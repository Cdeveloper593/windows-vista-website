export interface WeatherDay {
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

export interface WeatherPayload {
  source: string
  updated: string
  cities: WeatherCity[]
  isFallback: boolean
}

export type WeatherKind =
  'clear' | 'partly' | 'overcast' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm'

/** Map a WMO weather code to a gadget-friendly kind. */
export function weatherKind(code: number): WeatherKind {
  if (code === 0 || code === 1) return 'clear'
  if (code === 2) return 'partly'
  if (code === 3) return 'overcast'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if ((code >= 61 && code <= 67) || code === 80 || code === 81 || code === 82) return 'rain'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'thunderstorm'
  return 'overcast'
}

export function weatherDescription(code: number): string {
  switch (weatherKind(code)) {
    case 'clear':
      return 'Plenty of Sun'
    case 'partly':
      return 'Partly Cloudy'
    case 'overcast':
      return 'Cloudy'
    case 'fog':
      return 'Fog'
    case 'drizzle':
      return 'Drizzle'
    case 'rain':
      return 'Rain Showers'
    case 'snow':
      return 'Snow Showers'
    case 'thunderstorm':
      return 'Hit & Miss Storms'
  }
}

/** Deterministic 5-day forecast synthesized around a city's sample values. */
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

/** Static sample conditions used when /api/weather is unavailable (static hosting). */
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

export const FALLBACK_CITIES: WeatherCity[] = FALLBACK_BASE.map((c) => ({
  ...c,
  forecast: buildFallbackForecast(c.hiF, c.loF, c.code),
}))

export const FALLBACK_WEATHER: WeatherPayload = {
  source: 'Sample conditions (offline)',
  updated: new Date(0).toISOString(),
  cities: FALLBACK_CITIES,
  isFallback: true,
}
