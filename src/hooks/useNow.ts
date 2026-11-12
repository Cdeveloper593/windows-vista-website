import { useEffect, useState } from 'react'

/**
 * A ticking clock. `intervalMs` controls the refresh rate —
 * the taskbar clock uses 5s, the analog gadget clock uses 1s.
 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, intervalMs)
    return () => {
      window.clearInterval(timer)
    }
  }, [intervalMs])

  return now
}

export function formatTime(d: Date): string {
  let hours = d.getHours()
  const minutes = d.getMinutes()
  const suffix = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${String(hours)}:${String(minutes).padStart(2, '0')} ${suffix}`
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })
}
