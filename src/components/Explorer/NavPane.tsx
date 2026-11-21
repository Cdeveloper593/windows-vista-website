import type { ReactNode } from 'react'
import {
  ComputerIcon,
  ControlPanelIcon,
  DocumentsIcon,
  MusicIcon,
  PicturesIcon,
  RecentItemsIcon,
  RecycleBinIcon,
} from '../icons'
import styles from './NavPane.module.css'

interface NavLink {
  label: string
  icon: ReactNode
}

const FAVORITE_LINKS: NavLink[] = [
  { label: 'Documents', icon: <DocumentsIcon size={16} /> },
  { label: 'Pictures', icon: <PicturesIcon size={16} /> },
  { label: 'Music', icon: <MusicIcon size={16} /> },
  { label: 'Recently Changed', icon: <RecentItemsIcon size={16} /> },
  { label: 'Searches', icon: <RecentItemsIcon size={16} /> },
]

const FOLDER_TREE: NavLink[] = [
  { label: 'John Doe', icon: <DocumentsIcon size={16} /> },
  { label: 'Computer', icon: <ComputerIcon size={16} /> },
  { label: 'Control Panel', icon: <ControlPanelIcon size={16} /> },
  { label: 'Recycle Bin', icon: <RecycleBinIcon size={16} /> },
]

/**
 * Vista Explorer navigation pane: Favorite Links on top, the collapsible
 * Folders tree below. Present in Computer / Recycle Bin / folder windows —
 * the single biggest layout tell of a real Vista Explorer window.
 */
export function NavPane() {
  return (
    <nav className={styles.pane} aria-label="Navigation pane">
      <ul className={styles.links}>
        {FAVORITE_LINKS.map((link) => (
          <li key={link.label}>
            <button type="button" className={styles.link}>
              <span className={styles.linkIcon}>{link.icon}</span>
              {link.label}
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.foldersHeader}>
        <span>Folders</span>
        <svg viewBox="0 0 10 10" width="8" height="8" aria-hidden="true">
          <path
            d="M2 6.5 5 3.5l3 3"
            fill="none"
            stroke="#41545e"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <ul className={styles.tree}>
        <li>
          <span className={styles.treeRoot}>Desktop</span>
          <ul className={styles.treeChildren}>
            {FOLDER_TREE.map((item) => (
              <li key={item.label}>
                <button type="button" className={styles.link}>
                  <span className={styles.linkIcon}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </nav>
  )
}
