import { WeatherGadget } from './WeatherGadget'
import { FeedGadget } from './FeedGadget'
import styles from './Sidebar.module.css'

export function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Windows Sidebar">
      {/* gadget toolbar pill: add / dock */}
      <div className={styles.gadgetPill} role="toolbar" aria-label="Gadget options">
        <button
          type="button"
          className={styles.pillButton}
          aria-label="Add gadgets"
          title="Add gadgets"
        >
          <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
            <path d="M6 1v10M1 6h10" stroke="#cfe3ec" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <span className={styles.pillDivider} aria-hidden="true" />
        <button
          type="button"
          className={styles.pillButton}
          aria-label="Move Sidebar to the other side"
          title="Move Sidebar to the other side"
        >
          <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
            <path
              d="M8 2 4 6l4 4"
              fill="none"
              stroke="#cfe3ec"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className={styles.gadgetStack}>
        <WeatherGadget />
        <FeedGadget />
      </div>
    </aside>
  )
}
