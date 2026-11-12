import { useNow, formatTime, formatShortDate } from '../../hooks/useNow'
import { TrayVolumeIcon, TrayNetworkIcon, TraySecurityIcon, TrayUsbIcon } from '../icons'
import styles from './Taskbar.module.css'

export function SystemTray() {
  const now = useNow(5000)

  return (
    <div className={styles.tray}>
      <button
        type="button"
        className={styles.trayIcon}
        aria-label="Show hidden icons"
        title="Show hidden icons"
      >
        <svg viewBox="0 0 12 12" width="9" height="9" aria-hidden="true">
          <path
            d="M8 2 3 6l5 4"
            fill="none"
            stroke="#e8f4f6"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        className={styles.trayIcon}
        aria-label="Windows Security Center"
        title="Windows Security Center"
      >
        <TraySecurityIcon size={16} />
      </button>
      <button
        type="button"
        className={styles.trayIcon}
        aria-label="Safely Remove Hardware"
        title="Safely Remove Hardware"
      >
        <TrayUsbIcon size={16} />
      </button>
      <button
        type="button"
        className={styles.trayIcon}
        aria-label="Network"
        title="Local Area Connection: Connected"
      >
        <TrayNetworkIcon size={16} />
      </button>
      <button type="button" className={styles.trayIcon} aria-label="Volume" title="Volume">
        <TrayVolumeIcon size={16} />
      </button>
      <time className={styles.trayClock} dateTime={now.toISOString()} title={formatShortDate(now)}>
        {formatTime(now)}
      </time>
    </div>
  )
}
