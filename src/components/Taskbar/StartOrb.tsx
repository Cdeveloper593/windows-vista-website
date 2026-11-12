import { useWindowStore } from '../../store/windowStore'
import vistaOrb from '../../assets/icons/vista-orb.png'
import styles from './Taskbar.module.css'

export function StartOrb() {
  const toggleStartMenu = useWindowStore((s) => s.toggleStartMenu)
  const startMenuOpen = useWindowStore((s) => s.startMenuOpen)

  return (
    <button
      type="button"
      className={`${styles.orb} ${startMenuOpen ? styles.orbOpen : ''}`}
      onClick={toggleStartMenu}
      aria-label="Start"
      aria-expanded={startMenuOpen}
      aria-controls="start-menu"
      title="Start"
    >
      <img src={vistaOrb} alt="" draggable={false} className={styles.orbImage} aria-hidden="true" />
    </button>
  )
}
