import { StartOrb } from './StartOrb'
import { TaskbarButton } from './TaskbarButton'
import { SystemTray } from './SystemTray'
import { useWindowStore } from '../../store/windowStore'
import { ShowDesktopIcon, SwitchWindowsIcon, InternetExplorerIcon, MediaPlayerIcon } from '../icons'
import styles from './Taskbar.module.css'

export function Taskbar() {
  const openWindow = useWindowStore((s) => s.openWindow)
  return (
    <footer className={styles.taskbar} aria-label="Taskbar">
      <StartOrb />

      {/* Quick Launch */}
      <div className={styles.quickLaunch} role="toolbar" aria-label="Quick Launch">
        <button
          type="button"
          className={styles.quickLaunchButton}
          aria-label="Show Desktop"
          title="Show Desktop"
        >
          <ShowDesktopIcon size={18} />
        </button>
        <button
          type="button"
          className={styles.quickLaunchButton}
          aria-label="Switch between windows"
          title="Switch between windows"
        >
          <SwitchWindowsIcon size={18} />
        </button>
        <button
          type="button"
          className={styles.quickLaunchButton}
          aria-label="Internet Explorer"
          title="Internet Explorer"
          onClick={() => {
            openWindow('internet-explorer')
          }}
        >
          <InternetExplorerIcon size={18} />
        </button>
        <button
          type="button"
          className={styles.quickLaunchButton}
          aria-label="Windows Media Player"
          title="Windows Media Player"
        >
          <MediaPlayerIcon size={18} />
        </button>
      </div>

      <div className={styles.quickLaunchSeparator} aria-hidden="true" />

      {/* Open windows */}
      <div className={styles.taskButtons} role="toolbar" aria-label="Open windows">
        <TaskbarButton id="welcome" />
        <TaskbarButton id="recycle-bin" />
        <TaskbarButton id="games" />
        <TaskbarButton id="file-explorer" />
        <TaskbarButton id="internet-explorer" />
      </div>

      {/* active app status text spacer */}
      <div className={styles.spacer} aria-hidden="true" />

      <SystemTray />
    </footer>
  )
}
