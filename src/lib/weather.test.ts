import { describe, expect, it } from 'vitest'
import { weatherKind, weatherDescription, FALLBACK_CITIES } from './weather'

describe('weatherKind', () => {
  it('maps clear codes', () => {
    expect(weatherKind(0)).toBe('clear')
    expect(weatherKind(1)).toBe('clear')
  })
  it('maps partly cloudy', () => {
    expect(weatherKind(2)).toBe('partly')
  })
  it('maps overcast', () => {
    expect(weatherKind(3)).toBe('overcast')
  })
  it('maps fog', () => {
    expect(weatherKind(45)).toBe('fog')
    expect(weatherKind(48)).toBe('fog')
  })
  it('maps drizzle', () => {
    expect(weatherKind(51)).toBe('drizzle')
    expect(weatherKind(57)).toBe('drizzle')
  })
  it('maps rain', () => {
    expect(weatherKind(61)).toBe('rain')
    expect(weatherKind(65)).toBe('rain')
    expect(weatherKind(80)).toBe('rain')
    expect(weatherKind(82)).toBe('rain')
  })
  it('maps snow', () => {
    expect(weatherKind(71)).toBe('snow')
    expect(weatherKind(86)).toBe('snow')
  })
  it('maps thunderstorm', () => {
    expect(weatherKind(95)).toBe('thunderstorm')
    expect(weatherKind(99)).toBe('thunderstorm')
  })
  it('falls back to overcast for unknown codes', () => {
    expect(weatherKind(-1)).toBe('overcast')
  })
})

describe('weatherDescription', () => {
  it('returns terse TWC-style text', () => {
    expect(weatherDescription(0)).toBe('Plenty of Sun')
    expect(weatherDescription(95)).toBe('Hit & Miss Storms')
  })
})

describe('FALLBACK_CITIES', () => {
  it('has US metro coverage with hi/lo ordering and 5-day forecasts', () => {
    expect(FALLBACK_CITIES.length).toBeGreaterThanOrEqual(14)
    for (const c of FALLBACK_CITIES) {
      expect(c.hiF).toBeGreaterThanOrEqual(c.loF)
      expect(c.city.length).toBeGreaterThan(0)
      expect(c.forecast).toHaveLength(5)
      for (const day of c.forecast) {
        expect(day.hiF).toBeGreaterThanOrEqual(day.loF)
        expect(Number.isNaN(Date.parse(day.day))).toBe(false)
      }
    }
    const names = FALLBACK_CITIES.map((c) => c.city)
    expect(names).toContain('New York')
    expect(names).toContain('Chicago')
    expect(names).toContain('Los Angeles')
  })
})
