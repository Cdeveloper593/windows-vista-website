import { useEffect, useState } from 'react'
import { useWeather } from '../../hooks/useWeather'
import { weatherKind, weatherDescription } from '../../lib/weather'
import { WeatherIcon } from '../icons/weather'
import styles from './sidebarGadgets.module.css'

const CYCLE_MS = 6000
const STAT_COUNT = 3
const STAT_NAMES = ['current conditions', 'wind', 'high and low'] as const

const COMPASS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
] as const

function cardinal(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360
  return COMPASS[Math.round(normalized / 22.5) % 16] ?? 'N'
}

function WindCompass({ degrees, size }: { degrees: number; size: number }) {
  return (
    <svg
      className={styles.twcCompass}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`Wind from ${cardinal(degrees)}`}
    >
      <circle cx="32" cy="32" r="28.5" fill="#082e43" stroke="#7dcede" strokeWidth="2" />
      <circle cx="32" cy="32" r="23" fill="none" stroke="#2f8cad" strokeWidth="1" />
      {(['N', 'E', 'S', 'W'] as const).map((label, i) => {
        const angle = (i * Math.PI) / 2
        const x = 32 + Math.sin(angle) * 19.5
        const y = 32 - Math.cos(angle) * 19.5
        return (
          <text
            key={label}
            x={x}
            y={y}
            fill="#b9f8ff"
            fontSize="8.5"
            fontWeight="800"
            fontFamily="Arial, sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {label}
          </text>
        )
      })}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i * Math.PI) / 12
        const major = i % 6 === 0
        const r1 = major ? 23 : 26
        const r2 = 28.5
        return (
          <line
            key={i}
            x1={32 + Math.sin(angle) * r1}
            y1={32 - Math.cos(angle) * r1}
            x2={32 + Math.sin(angle) * r2}
            y2={32 - Math.cos(angle) * r2}
            stroke="#7dcede"
            strokeWidth={major ? 1.6 : 0.8}
          />
        )
      })}
      <g transform={`rotate(${degrees} 32 32)`}>
        <path
          d="M32 10 L27.5 30 L32 25.5 L36.5 30 Z"
          fill="#ff5a3c"
          stroke="#2a0e00"
          strokeWidth="1.2"
        />
        <path
          d="M32 54 L28.5 34.5 L32 38.5 L35.5 34.5 Z"
          fill="#dff8ff"
          stroke="#2a0e00"
          strokeWidth="1.2"
        />
      </g>
      <circle cx="32" cy="32" r="3.4" fill="#f2f4f6" stroke="#082e43" strokeWidth="1.4" />
    </svg>
  )
}

/**
 * The Weather Channel "Current Conditions" broadcast graphic, recreated as a
 * narrow Sidebar gadget. Live conditions stream from /api/weather. The single
 * teal panel rotates through current temp, wind, and today's Hi/Lo.
 */
export function WeatherGadget() {
  const { status, weather } = useWeather()
  const [index, setIndex] = useState(0)
  const [stat, setStat] = useState(0)
  const cities = weather.cities
  const safeIndex = cities.length > 0 ? index % cities.length : 0

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => i + 1)
      setStat((s) => (s + 1) % STAT_COUNT)
    }, CYCLE_MS)
    return () => {
      window.clearInterval(timer)
    }
  }, [index, cities.length])

  const city = cities.length > 0 ? cities[safeIndex] : undefined
  if (!city) return null

  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  const dateLine = today
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .toUpperCase()

  const kind = weatherKind(city.code)
  const description = weatherDescription(city.code)
  const direction = cardinal(city.windDir)

  return (
    <section
      className={styles.twcGadget}
      aria-label={`Weather in ${city.city}`}
      title={weather.source}
    >
      {/* ---- masthead: TWC badge + 8s LIVE / city + Current Conditions / date ---- */}
      <header className={styles.twcHeader}>
        <span className={styles.twcBadge} aria-hidden="true">
          <span className={styles.twcBadgeLine1}>The</span>
          <span className={styles.twcBadgeLine2}>Weather</span>
          <span className={styles.twcBadgeLine3}>Channel</span>
        </span>
        <span className={styles.twcEight} aria-hidden="true">
          <span className={styles.twcEightTop}>
            <span className={styles.twcEightMain}>8</span>
            <span className={styles.twcEightSub}>s</span>
          </span>
          <span className={styles.twcEightLive}>LIVE</span>
        </span>
        <span className={styles.twcTitleWrap}>
          <span className={styles.twcCity}>{city.city}</span>
          <span className={styles.twcExtended}>Current Conditions</span>
        </span>
        <span className={styles.twcDateBlock}>
          <span>{dayName}</span>
          <span className={styles.twcDateDot} aria-hidden="true">
            ·
          </span>
          <span>{dateLine}</span>
        </span>
      </header>

      {/* ---- single chrome-framed teal panel, rotating weather stats ---- */}
      <div className={styles.twcDays}>
        <div className={styles.twcCard}>
          <div className={styles.twcCardInner}>
            {stat === 0 ? (
              <>
                <span className={styles.twcStatLabel}>Now</span>
                <span className={styles.twcStatIcon} title={description}>
                  <WeatherIcon kind={kind} size={54} />
                </span>
                <span className={styles.twcBigTemp}>
                  {city.tempF}
                  <span className={styles.twcBigTempUnit}>°</span>
                </span>
                <span className={styles.twcStatDesc}>{description}</span>
              </>
            ) : stat === 1 ? (
              <>
                <span className={styles.twcStatLabel}>Wind</span>
                <WindCompass degrees={city.windDir} size={46} />
                <span className={styles.twcBigTemp}>
                  {city.windMph}
                  <span className={styles.twcUnitWord}>MPH</span>
                </span>
                <span className={styles.twcStatDesc}>
                  From {direction} · {Math.round(city.windDir)}°
                </span>
              </>
            ) : (
              <>
                <span className={styles.twcStatLabel}>Today's Hi / Lo</span>
                <span className={styles.twcHiLoRow}>
                  <span className={styles.twcHiLoCol}>
                    <span className={styles.twcHiLoCap}>▲ Hi</span>
                    <span className={styles.twcHiLoNum}>{city.hiF}</span>
                  </span>
                  <span className={styles.twcHiLoCol}>
                    <span className={styles.twcHiLoCap}>▼ Lo</span>
                    <span className={styles.twcHiLoNum}>{city.loF}</span>
                  </span>
                </span>
                <span className={styles.twcStatDesc}>{description}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---- lower-third ticker: live conditions, stat dots, city cycling ---- */}
      <footer className={styles.twcFooter}>
        <span className={styles.twcFooterTop}>
          <span className={styles.twcLiveDot} aria-hidden="true" />
          <span className={styles.twcFooterLabel}>Live Conditions</span>
          {status === 'loading' ? <span className={styles.twcUpdating}>updating…</span> : null}
        </span>
        <span className={styles.twcFooterBottom}>
          <span className={styles.twcDots} aria-label="Weather stat">
            {STAT_NAMES.map((name, i) => (
              <button
                key={name}
                type="button"
                aria-pressed={i === stat}
                aria-label={`Show ${name}`}
                title={`Show ${name}`}
                className={i === stat ? `${styles.twcDot} ${styles.twcDotActive}` : styles.twcDot}
                onClick={() => {
                  setStat(i)
                }}
              />
            ))}
          </span>
          <span className={styles.twcNav}>
            <button
              type="button"
              className={styles.twcNavButton}
              aria-label="Previous city"
              onClick={() => {
                setIndex((i) => (i - 1 + cities.length) % cities.length)
                setStat(0)
              }}
            >
              <svg viewBox="0 0 10 10" width="6" height="6" aria-hidden="true">
                <path d="M7 1 2.5 5 7 9z" fill="#8fefff" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.twcNavButton}
              aria-label="Next city"
              onClick={() => {
                setIndex((i) => (i + 1) % cities.length)
                setStat(0)
              }}
            >
              <svg viewBox="0 0 10 10" width="6" height="6" aria-hidden="true">
                <path d="M3 1l4.5 4L3 9z" fill="#8fefff" />
              </svg>
            </button>
          </span>
        </span>
      </footer>
    </section>
  )
}
