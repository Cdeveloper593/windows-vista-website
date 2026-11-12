import type { ComponentType } from 'react'
import type { IconProps } from './types'
import type { WeatherKind } from '../../lib/weather'

/* Glossy Vista-style weather glyphs for the gadget. */

export function ThermometerIcon({ size = 26, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id="thermo-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#eef4f6" />
          <stop offset="45%" stopColor="#93a7ae" />
          <stop offset="100%" stopColor="#5a6a72" />
        </linearGradient>
        <linearGradient id="thermo-mercury" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9a4a" />
          <stop offset="100%" stopColor="#d42408" />
        </linearGradient>
      </defs>
      <rect
        x="17"
        y="3"
        width="14"
        height="27"
        rx="7"
        fill="url(#thermo-glass)"
        stroke="#2b2b2b"
        strokeWidth="1.4"
      />
      <circle
        cx="24"
        cy="38"
        r="8.5"
        fill="url(#thermo-glass)"
        stroke="#2b2b2b"
        strokeWidth="1.4"
      />
      <rect x="21.5" y="9" width="5" height="24" rx="2.5" fill="url(#thermo-mercury)" />
      <circle cx="24" cy="38" r="5.6" fill="url(#thermo-mercury)" />
      <path d="M20 8a4 4 0 0 1 8 0" fill="#ffffff" opacity="0.6" />
    </svg>
  )
}

function SunRays({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g fill="#f9a83e" stroke="#7a3c00" strokeWidth="1.1" strokeLinejoin="round">
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4 - Math.PI / 2
        const tip = r + 7.4
        const baseHalf = 3.3
        const bx = Math.cos(a) * (r - 1)
        const by = Math.sin(a) * (r - 1)
        const tx = Math.cos(a) * tip
        const ty = Math.sin(a) * tip
        const px = Math.cos(a + Math.PI / 2) * baseHalf
        const py = Math.sin(a + Math.PI / 2) * baseHalf
        return (
          <path
            key={i}
            d={`M${(cx + bx - px).toFixed(1)} ${(cy + by - py).toFixed(1)}L${(cx + tx).toFixed(1)} ${(cy + ty).toFixed(1)}L${(cx + bx + px).toFixed(1)} ${(cy + by + py).toFixed(1)}Z`}
          />
        )
      })}
    </g>
  )
}

export function SunIcon({ size = 32, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <radialGradient id="sun-core" cx="42%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#fffde0" />
          <stop offset="38%" stopColor="#ffd84d" />
          <stop offset="78%" stopColor="#f5a623" />
          <stop offset="100%" stopColor="#d96c00" />
        </radialGradient>
      </defs>
      <SunRays cx={24} cy={23} r={11} />
      <circle cx="24" cy="23" r="10.6" fill="url(#sun-core)" stroke="#7a3c00" strokeWidth="1.5" />
      <ellipse
        cx="20"
        cy="19.5"
        rx="4.6"
        ry="2.6"
        fill="#ffffff"
        opacity="0.75"
        transform="rotate(-24 20 19.5)"
      />
    </svg>
  )
}

function CloudShape({
  fill = 'url(#cloud-g)',
  stroke = '#33404c',
}: {
  fill?: string
  stroke?: string
}) {
  return (
    <path
      d="M15 33a7.5 7.5 0 0 1 .8-15 9.5 9.5 0 0 1 17.4 2.6 6.6 6.6 0 0 1-1.2 12.4z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  )
}

function CloudDefs() {
  return (
    <defs>
      <linearGradient id="cloud-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="48%" stopColor="#e6ecf1" />
        <stop offset="100%" stopColor="#8e9aa6" />
      </linearGradient>
      <radialGradient id="sun-hi" cx="42%" cy="38%" r="62%">
        <stop offset="0%" stopColor="#fffde0" />
        <stop offset="38%" stopColor="#ffd84d" />
        <stop offset="78%" stopColor="#f5a623" />
        <stop offset="100%" stopColor="#d96c00" />
      </radialGradient>
    </defs>
  )
}

export function PartlyIcon({ size = 32, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <CloudDefs />
      <SunRays cx={15} cy={14} r={5.4} />
      <circle cx="15" cy="14" r="6.6" fill="url(#sun-hi)" stroke="#7a3c00" strokeWidth="1.4" />
      <g transform="translate(4 7) scale(0.92)">
        <CloudShape />
        <ellipse cx="22" cy="23.5" rx="6.2" ry="2.1" fill="#ffffff" opacity="0.65" />
      </g>
    </svg>
  )
}

export function OvercastIcon({ size = 32, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <CloudDefs />
      <CloudShape />
      <ellipse cx="22" cy="25" rx="7" ry="2.3" fill="#ffffff" opacity="0.6" />
    </svg>
  )
}

export function FogIcon({ size = 32, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <CloudDefs />
      <g transform="translate(2 -3) scale(0.9)">
        <CloudShape />
      </g>
      <path d="M8 33h32M11 39h26" stroke="#c9d4db" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function RainDrops() {
  return (
    <g stroke="#4aa3e0" strokeWidth="2.4" strokeLinecap="round">
      <path d="M15 37l-2 4M24 37l-2 4M33 37l-2 4" />
    </g>
  )
}

export function DrizzleIcon({ size = 32, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <CloudDefs />
      <g transform="translate(2 -3) scale(0.9)">
        <CloudShape />
      </g>
      <path
        d="M16 37l-1.2 2.6M24 37l-1.2 2.6M32 37l-1.2 2.6"
        stroke="#4aa3e0"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function RainIcon({ size = 32, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <CloudDefs />
      <g transform="translate(2 -3) scale(0.9)">
        <CloudShape />
      </g>
      <RainDrops />
    </svg>
  )
}

export function SnowIcon({ size = 32, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <CloudDefs />
      <g transform="translate(2 -3) scale(0.9)">
        <CloudShape />
      </g>
      <g fill="#eef6ff" stroke="#8fb8d8" strokeWidth="0.7">
        <path
          d="M15 37.5l1 2 2.2.2-1.7 1.5.5 2.1-2-1.2-2 1.2.5-2.1-1.7-1.5 2.2-.2z"
          transform="scale(0.9) translate(2 5)"
        />
        <path
          d="M28 36l1 2 2.2.2-1.7 1.5.5 2.1-2-1.2-2 1.2.5-2.1-1.7-1.5 2.2-.2z"
          transform="scale(0.9) translate(3 5)"
        />
      </g>
    </svg>
  )
}

export function StormIcon({ size = 32, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <CloudDefs />
      <SunRays cx={14} cy={12.5} r={4.8} />
      <circle cx="14" cy="12.5" r="6.1" fill="url(#sun-hi)" stroke="#7a3c00" strokeWidth="1.4" />
      <g transform="translate(3 6) scale(0.9)">
        <CloudShape />
        <ellipse cx="22" cy="23.5" rx="6.2" ry="2.1" fill="#ffffff" opacity="0.6" />
      </g>
      <path
        d="M27.5 26l-7.5 10h5.8l-3 9 10-12h-6.6l5-7z"
        fill="#ffd94a"
        stroke="#5c3a00"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const WEATHER_ICONS: Record<WeatherKind, ComponentType<IconProps>> = {
  clear: SunIcon,
  partly: PartlyIcon,
  overcast: OvercastIcon,
  fog: FogIcon,
  drizzle: DrizzleIcon,
  rain: RainIcon,
  snow: SnowIcon,
  thunderstorm: StormIcon,
}

export function WeatherIcon({
  kind,
  size = 32,
  className,
  title,
}: IconProps & { kind: WeatherKind }) {
  const Icon = WEATHER_ICONS[kind]
  return <Icon size={size} className={className} title={title} />
}

/* Small sun/moon globe glyph for the gadget header */
export function WeatherGlobeIcon({ size = 18, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <radialGradient id="wg-globe" cx="40%" cy="36%" r="62%">
          <stop offset="0%" stopColor="#a8e4ff" />
          <stop offset="45%" stopColor="#2f8fd0" />
          <stop offset="100%" stopColor="#0d3a63" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="17" fill="url(#wg-globe)" stroke="#081f30" strokeWidth="1.6" />
      <ellipse
        cx="24"
        cy="24"
        rx="7.4"
        ry="17"
        fill="none"
        stroke="#bfe6ff"
        strokeWidth="1.3"
        opacity="0.85"
      />
      <path
        d="M7 24h34M24 7a24 24 0 0 1 0 34"
        stroke="#bfe6ff"
        strokeWidth="1.3"
        opacity="0.85"
        fill="none"
      />
    </svg>
  )
}
