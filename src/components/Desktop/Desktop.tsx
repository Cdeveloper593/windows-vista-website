import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useWindowStore } from '../../store/windowStore'
import { DesktopIcon } from './DesktopIcon'
import { WelcomeCenter } from '../WelcomeCenter/WelcomeCenter'
import { FileExplorerWindow } from '../Explorer/FileExplorerWindow'
import { RecycleBinWindow } from '../Explorer/RecycleBinWindow'
import { GamesWindow } from '../Explorer/GamesWindow'
import { Sidebar } from '../Sidebar/Sidebar'
import { StartMenu } from '../StartMenu/StartMenu'
import { ComputerIcon, FlowerAvatarIcon, GamesIcon, RecycleBinIcon } from '../icons'
import styles from './Desktop.module.css'

type PowerOverlay = 'shutdown' | 'lock' | null

export function Desktop() {
  const startMenuOpen = useWindowStore((s) => s.startMenuOpen)
  const setStartMenuOpen = useWindowStore((s) => s.setStartMenuOpen)
  const [powerOverlay, setPowerOverlay] = useState<PowerOverlay>(null)

  // Clicking anywhere outside the menu closes it; Escape is handled in StartMenu.
  useEffect(() => {
    if (!startMenuOpen) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('#start-menu') || target.closest('[aria-controls="start-menu"]')) return
      setStartMenuOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [startMenuOpen, setStartMenuOpen])

  return (
    <main className={styles.desktop} aria-label="Desktop">
      {/* wallpaper */}
      <div className="wallpaper" aria-hidden="true" />

      {/* desktop icons (top-left) */}
      <div className={styles.iconColumn}>
        <DesktopIcon
          label="Recycle Bin"
          windowId="recycle-bin"
          icon={<RecycleBinIcon size={54} />}
        />
        <DesktopIcon label="Games" windowId="games" icon={<GamesIcon size={54} />} />
        <DesktopIcon label="Computer" windowId="file-explorer" icon={<ComputerIcon size={54} />} />
      </div>

      {/* windows */}
      <WelcomeCenter />
      <RecycleBinWindow />
      <GamesWindow />
      <FileExplorerWindow />

      {/* sidebar gadgets */}
      <Sidebar />

      {/* Start menu */}
      {startMenuOpen ? <StartMenu onPowerAction={setPowerOverlay} /> : null}

      {/* shutdown / lock gag overlay (portaled to body so it covers the taskbar) */}
      {powerOverlay
        ? createPortal(
            <div
              className={powerOverlay === 'shutdown' ? styles.shutdownOverlay : styles.lockOverlay}
              role="alertdialog"
              aria-label={powerOverlay === 'shutdown' ? 'Shutting down' : 'Locked'}
              onClick={() => {
                setPowerOverlay(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') setPowerOverlay(null)
              }}
              tabIndex={0}
            >
              {powerOverlay === 'shutdown' ? (
                <p className={styles.shutdownText}>Shutting down…</p>
              ) : (
                <div className={styles.lockContent}>
                  <span className={styles.lockAvatarFrame}>
                    <FlowerAvatarIcon size={88} />
                  </span>
                  <p className={styles.lockName}>John Doe</p>
                  <p className={styles.lockHint}>Locked — click anywhere to sign in</p>
                </div>
              )}
            </div>,
            document.body,
          )
        : null}
    </main>
  )
}
