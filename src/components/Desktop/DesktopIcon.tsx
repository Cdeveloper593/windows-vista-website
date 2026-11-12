import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useWindowStore, type WindowId } from '../../store/windowStore'
import styles from './Desktop.module.css'

interface DesktopIconProps {
  label: string
  icon: ReactNode
  windowId: WindowId
}

export function DesktopIcon({ label, icon, windowId }: DesktopIconProps) {
  const [selected, setSelected] = useState(false)
  const openWindow = useWindowStore((s) => s.openWindow)
  const rootRef = useRef<HTMLButtonElement>(null)

  // clicking the wallpaper clears the selection
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setSelected(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  return (
    <button
      ref={rootRef}
      type="button"
      className={`${styles.desktopIcon} ${selected ? styles.selected : ''}`}
      onClick={() => {
        setSelected(true)
      }}
      onDoubleClick={() => {
        openWindow(windowId)
      }}
      aria-pressed={selected}
      aria-label={label}
    >
      <span className={styles.iconImage}>{icon}</span>
      <span className={styles.iconLabel}>{label}</span>
    </button>
  )
}
