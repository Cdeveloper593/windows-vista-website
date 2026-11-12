import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.resolve(__dirname, '../dist')

const PORT = Number(process.env.PORT ?? 4173)
const HOST = process.env.HOST ?? '0.0.0.0'
const FEED_URL = process.env.FEED_URL ?? 'https://feeds.bbci.co.uk/news/rss.xml'
const FETCH_TIMEOUT_MS = 6_000
const CACHE_TTL_MS = 5 * 60_000
const WEATHER_CACHE_TTL_MS = 10 * 60_000

interface FeedItem {
  title: string
  link: string | null
  pubDate: string | null
}

interface FeedPayload {
  source: string
  headlines: FeedItem[]
  isFallback: boolean
}

/** Same sample headlines the frontend bakes in — served when the live feed is unreachable. */
const FALLBACK: FeedPayload = {
  source: 'Sample headlines (offline)',
  isFallback: true,
  headlines: [
    {
      title: 'Windows Vista review: Microsoft’s most ambitious OS yet',
      link: null,
      pubDate: '2007-01-30',
    },
    {
      title: 'Aero Glass brings translucent windows to the desktop',
      link: null,
      pubDate: '2007-01-30',
    },
    {
      title: 'Windows Sidebar gadgets: clock, slideshow and headlines',
      link: null,
      pubDate: '2007-01-30',
    },
    {
      title: 'BitLocker and Windows Defender headline Ultimate edition',
      link: null,
      pubDate: '2007-01-30',
    },
  ],
}

let cache: { at: number; payload: FeedPayload } | null = null

/* ================= Weather (Open-Meteo, no key required) ================= */

export interface WeatherDay {
  /** ISO date string for the day */
  day: string
  code: number
  hiF: number
  loF: number
}

export interface WeatherCity {
  city: string
  tempF: number
  hiF: number
  loF: number
  code: number
  windMph: number
  windDir: number
  forecast: WeatherDay[]
}

interface WeatherPayload {
  source: string
  updated: string
  cities: WeatherCity[]
  isFallback: boolean
}

function buildFallbackForecast(hiF: number, loF: number, baseCode: number): WeatherDay[] {
  const deltas = [0, 2, -1, 3, -2]
  const codeSteps = [0, 1, -1, 2, 1]
  const dayMs = 86_400_000
  const now = Date.now()
  return deltas.map((delta, i) => ({
    day: new Date(now + i * dayMs).toISOString(),
    code: Math.max(0, Math.min(3, baseCode + (codeSteps[i] ?? 0))),
    hiF: hiF + delta,
    loF: loF + delta,
  }))
}

const WEATHER_CITIES = [
  { city: 'New York', lat: 40.7128, lon: -74.006, tz: 'America/New_York' },
  { city: 'Chicago', lat: 41.8781, lon: -87.6298, tz: 'America/Chicago' },
  { city: 'Los Angeles', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles' },
  { city: 'San Francisco', lat: 37.7749, lon: -122.4194, tz: 'America/Los_Angeles' },
  { city: 'Miami', lat: 25.7617, lon: -80.1918, tz: 'America/New_York' },
  { city: 'Seattle', lat: 47.6062, lon: -122.3321, tz: 'America/Los_Angeles' },
  { city: 'Las Vegas', lat: 36.1699, lon: -115.1398, tz: 'America/Los_Angeles' },
  { city: 'New Orleans', lat: 29.9511, lon: -90.0715, tz: 'America/Chicago' },
  { city: 'Dallas', lat: 32.7767, lon: -96.797, tz: 'America/Chicago' },
  { city: 'Atlanta', lat: 33.749, lon: -84.388, tz: 'America/New_York' },
  { city: 'Boston', lat: 42.3601, lon: -71.0589, tz: 'America/New_York' },
  { city: 'Washington, DC', lat: 38.9072, lon: -77.0369, tz: 'America/New_York' },
  { city: 'Denver', lat: 39.7392, lon: -104.9903, tz: 'America/Denver' },
  { city: 'Phoenix', lat: 33.4484, lon: -112.074, tz: 'America/Phoenix' },
  { city: 'Houston', lat: 29.7604, lon: -95.3698, tz: 'America/Chicago' },
  { city: 'Orlando', lat: 28.5383, lon: -81.3792, tz: 'America/New_York' },
]

const FALLBACK_BASE = [
  { city: 'New York', tempF: 52, hiF: 61, loF: 47, code: 3, windMph: 4, windDir: 74 },
  { city: 'Chicago', tempF: 48, hiF: 56, loF: 44, code: 61, windMph: 9, windDir: 290 },
  { city: 'Los Angeles', tempF: 68, hiF: 74, loF: 57, code: 2, windMph: 5, windDir: 220 },
  { city: 'San Francisco', tempF: 61, hiF: 66, loF: 52, code: 2, windMph: 10, windDir: 260 },
  { city: 'Miami', tempF: 79, hiF: 84, loF: 73, code: 2, windMph: 9, windDir: 110 },
  { city: 'Seattle', tempF: 50, hiF: 55, loF: 45, code: 61, windMph: 6, windDir: 150 },
  { city: 'Las Vegas', tempF: 66, hiF: 74, loF: 52, code: 0, windMph: 4, windDir: 300 },
  { city: 'New Orleans', tempF: 62, hiF: 68, loF: 54, code: 2, windMph: 7, windDir: 160 },
  { city: 'Dallas', tempF: 60, hiF: 69, loF: 50, code: 1, windMph: 8, windDir: 320 },
  { city: 'Atlanta', tempF: 58, hiF: 67, loF: 47, code: 2, windMph: 7, windDir: 240 },
  { city: 'Boston', tempF: 49, hiF: 57, loF: 42, code: 61, windMph: 10, windDir: 300 },
  { city: 'Washington, DC', tempF: 53, hiF: 62, loF: 44, code: 3, windMph: 6, windDir: 280 },
  { city: 'Denver', tempF: 38, hiF: 47, loF: 30, code: 1, windMph: 5, windDir: 310 },
  { city: 'Phoenix', tempF: 66, hiF: 76, loF: 51, code: 0, windMph: 3, windDir: 240 },
  { city: 'Houston', tempF: 63, hiF: 71, loF: 55, code: 0, windMph: 6, windDir: 140 },
  { city: 'Orlando', tempF: 71, hiF: 79, loF: 62, code: 2, windMph: 9, windDir: 80 },
] as const

const FALLBACK_CITIES: WeatherCity[] = FALLBACK_BASE.map((c) => ({
  ...c,
  forecast: buildFallbackForecast(c.hiF, c.loF, c.code),
}))

let weatherCache: { at: number; payload: WeatherPayload } | null = null

function toWeatherCity(
  city: string,
  data: {
    current?: {
      temperature_2m?: number
      weather_code?: number
      wind_speed_10m?: number
      wind_direction_10m?: number
    }
    daily?: {
      time?: string[]
      weather_code?: number[]
      temperature_2m_max?: number[]
      temperature_2m_min?: number[]
    }
  },
): WeatherCity | null {
  const t = data.current?.temperature_2m
  if (typeof t !== 'number') return null
  const hi = data.daily?.temperature_2m_max?.[0]
  const lo = data.daily?.temperature_2m_min?.[0]
  const code = data.daily?.weather_code?.[0] ?? data.current?.weather_code ?? 3

  const times = data.daily?.time ?? []
  const codes = data.daily?.weather_code ?? []
  const hiTemps = data.daily?.temperature_2m_max ?? []
  const loTemps = data.daily?.temperature_2m_min ?? []
  const forecast: WeatherDay[] = []
  for (let i = 0; i < 5; i++) {
    const dayHi = hiTemps[i]
    const dayLo = loTemps[i]
    forecast.push({
      day: times[i] ?? new Date(Date.now() + i * 86_400_000).toISOString(),
      code: codes[i] ?? 3,
      hiF: typeof dayHi === 'number' ? Math.round(dayHi) : Math.round(t),
      loF: typeof dayLo === 'number' ? Math.round(dayLo) : Math.round(t),
    })
  }

  return {
    city,
    tempF: Math.round(t),
    hiF: typeof hi === 'number' ? Math.round(hi) : Math.round(t),
    loF: typeof lo === 'number' ? Math.round(lo) : Math.round(t),
    code,
    windMph: Math.round(data.current?.wind_speed_10m ?? 0),
    windDir: Math.round(data.current?.wind_direction_10m ?? 0),
    forecast,
  }
}

async function loadWeather(): Promise<WeatherPayload> {
  if (weatherCache && Date.now() - weatherCache.at < WEATHER_CACHE_TTL_MS)
    return weatherCache.payload

  const results = await Promise.all(
    WEATHER_CITIES.map(async (c): Promise<{ city: WeatherCity; ok: boolean }> => {
      const controller = new AbortController()
      const timeout = setTimeout(() => {
        controller.abort()
      }, FETCH_TIMEOUT_MS)
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${String(c.lat)}&longitude=${String(c.lon)}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=${encodeURIComponent(c.tz)}&forecast_days=5`
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error(`upstream ${String(response.status)}`)
        const data = (await response.json()) as Parameters<typeof toWeatherCity>[1]
        const city = toWeatherCity(c.city, data)
        if (!city) throw new Error('malformed payload')
        return { city, ok: true }
      } catch {
        return {
          city: FALLBACK_CITIES.find((f) => f.city === c.city) ?? FALLBACK_CITIES[0],
          ok: false,
        }
      } finally {
        clearTimeout(timeout)
      }
    }),
  )

  const liveCount = results.filter((r) => r.ok).length
  const payload: WeatherPayload = {
    source: liveCount > 0 ? 'Live conditions (Open-Meteo)' : 'Sample conditions (offline)',
    updated: new Date().toISOString(),
    cities: results.map((r) => r.city),
    isFallback: liveCount === 0,
  }
  weatherCache = { at: Date.now(), payload }
  return payload
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/<[^>]*>/g, '')
    .trim()
}

function xmlField(raw: string, tag: string): string {
  const match = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i').exec(raw)
  return match ? decodeXmlEntities(match[1]) : ''
}

function parseRss(xml: string): FeedItem[] {
  const items: FeedItem[] = []
  const itemMatches = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []
  for (const raw of itemMatches) {
    const title = xmlField(raw, 'title')
    if (!title) continue
    const link = xmlField(raw, 'link')
    const pubDate = xmlField(raw, 'pubDate')
    items.push({ title, link: link || null, pubDate: pubDate || null })
    if (items.length >= 8) break
  }
  return items
}

async function loadFeed(): Promise<FeedPayload> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.payload

  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(FEED_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'WindowsVistaWeb/1.0 (+https://localhost)',
        Accept: 'application/rss+xml, text/xml, */*',
      },
    })
    if (!response.ok) throw new Error(`Upstream responded ${String(response.status)}`)
    const xml = await response.text()
    const headlines = parseRss(xml)
    if (headlines.length === 0) throw new Error('No headlines in feed')

    const payload: FeedPayload = { source: 'BBC News', headlines, isFallback: false }
    cache = { at: Date.now(), payload }
    return payload
  } catch {
    // Serve sample headlines instead of an error — the gadget stays useful offline.
    cache = { at: Date.now(), payload: FALLBACK }
    return FALLBACK
  } finally {
    clearTimeout(timeout)
  }
}

async function main(): Promise<void> {
  const app = Fastify({ logger: true })

  app.get('/api/health', () => ({ ok: true, service: 'windows-vista-web' }))

  app.get('/api/feed', async () => {
    const payload = await loadFeed()
    return payload
  })

  app.get('/api/weather', async () => {
    const payload = await loadWeather()
    return payload
  })

  // Static hosting of the production build when dist/ exists.
  if (fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    await app.register(fastifyStatic, {
      root: DIST_DIR,
      prefix: '/',
      index: ['index.html'],
      cacheControl: true,
      maxAge: '1h',
    })
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api/')) {
        return reply.code(404).send({ error: 'Not Found' })
      }
      // SPA fallback — everything else serves the shell.
      return reply.sendFile('index.html')
    })
    app.log.info(`Serving static build from ${DIST_DIR}`)
  } else {
    app.log.warn(
      `No production build found at ${DIST_DIR} — run \`pnpm build\`. Only /api/* is served.`,
    )
  }

  await app.listen({ port: PORT, host: HOST })
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
