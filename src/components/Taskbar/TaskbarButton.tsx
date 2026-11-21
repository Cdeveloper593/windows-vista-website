import type { ReactNode } from 'react'
import { useWindowStore, type WindowId } from '../../store/windowStore'
import {
  FileExplorerIcon,
  GamesIcon,
  InternetExplorerIcon,
  RecycleBinIcon,
  WelcomeCapsuleIcon,
} from '../icons'
import styles from './Taskbar.module.css'

const WINDOW_ICONS: Record<WindowId, ReactNode> = {
  welcome: <WelcomeCapsuleIcon size={19} title="Welcome Center" />,
  'recycle-bin': <RecycleBinIcon size={17} />,
  games: <GamesIcon size={17} />,
  'file-explorer': <FileExplorerIcon size={17} />,
  'internet-explorer': <InternetExplorerIcon size={17} />,
}

export function TaskbarButton({ id }: { id: WindowId }) {
  const win = useWindowStore((s) => s.windows[id])
  const topZ = useWindowStore((s) => s.topZ)
  const toggleTaskbarWindow = useWindowStore((s) => s.toggleTaskbarWindow)

  if (!win.isOpen) return null

  const isActive = win.zIndex === topZ && !win.isMinimized

  return (
    <button
      type="button"
      className={`${styles.taskButton} ${isActive ? styles.taskButtonActive : ''}`}
      onClick={() => {
        toggleTaskbarWindow(id)
      }}
      aria-pressed={isActive}
      title={win.title}
    >
      <span className={styles.taskButtonIcon}>{WINDOW_ICONS[id]}</span>
      <span className={styles.taskButtonLabel}>{win.title}</span>
    </button>
  )
}
