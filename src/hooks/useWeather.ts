import { useEffect, useState } from 'react'
import {
  FALLBACK_WEATHER,
  type WeatherCity,
  type WeatherDay,
  type WeatherPayload,
} from '../lib/weather'

type WeatherState =
  { status: 'loading'; weather: WeatherPayload } | { status: 'ready'; weather: WeatherPayload }

/**
 * Loads /api/weather, falling back to static sample conditions when the
 * backend is not reachable (static hosting) or returns an error.
 */
export function useWeather(): WeatherState {
  const [state, setState] = useState<WeatherState>({ status: 'loading', weather: FALLBACK_WEATHER })

  useEffect(() => {
    const controller = new AbortController()

    async function load(): Promise<void> {
      try {
        const response = await fetch('/api/weather', {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })
        if (!response.ok) throw new Error(`Weather request failed: ${String(response.status)}`)
        const data: unknown = await response.json()
        if (typeof data !== 'object' || data === null)
          throw new Error('Weather response not an object')
        const raw = data as {
          source?: unknown
          updated?: unknown
          cities?: unknown
          isFallback?: unknown
        }
        if (!Array.isArray(raw.cities) || raw.cities.length === 0) {
          throw new Error('Weather response missing cities')
        }
        const cities = raw.cities.map((item: unknown): WeatherCity => {
          const c = (typeof item === 'object' && item !== null ? item : {}) as Partial<WeatherCity>
          const tempF = typeof c.tempF === 'number' ? c.tempF : 0
          const hiF = typeof c.hiF === 'number' ? c.hiF : tempF
          const loF = typeof c.loF === 'number' ? c.loF : tempF
          const forecastRaw = Array.isArray(c.forecast) ? c.forecast : []
          const dayMs = 86_400_000
          const forecast: WeatherDay[] = Array.from({ length: 5 }, (_, i) => {
            const d = forecastRaw[i] as Partial<WeatherDay> | undefined
            return {
              day:
                typeof d?.day === 'string' ? d.day : new Date(Date.now() + i * dayMs).toISOString(),
              code: typeof d?.code === 'number' ? d.code : typeof c.code === 'number' ? c.code : 3,
              hiF: typeof d?.hiF === 'number' ? d.hiF : hiF,
              loF: typeof d?.loF === 'number' ? d.loF : loF,
            }
          })
          return {
            city: typeof c.city === 'string' ? c.city : 'Unknown',
            tempF,
            hiF,
            loF,
            code: typeof c.code === 'number' ? c.code : 3,
            windMph: typeof c.windMph === 'number' ? c.windMph : 0,
            windDir: typeof c.windDir === 'number' ? c.windDir : 0,
            forecast,
          }
        })
        setState({
          status: 'ready',
          weather: {
            source: typeof raw.source === 'string' ? raw.source : 'Live conditions',
            updated: typeof raw.updated === 'string' ? raw.updated : new Date(0).toISOString(),
            cities,
            isFallback: raw.isFallback === true,
          },
        })
      } catch {
        if (!controller.signal.aborted) {
          setState({ status: 'ready', weather: FALLBACK_WEATHER })
        }
      }
    }

    void load()
    return () => {
      controller.abort()
    }
  }, [])

  return state
}
