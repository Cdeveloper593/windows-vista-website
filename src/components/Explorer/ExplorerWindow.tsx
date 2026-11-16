import type { ReactNode } from 'react'
import { Window } from '../Window/Window'
import { ShellNavControls } from '../ShellToolbar/ShellNavControls'
import { ShellToolbar } from '../ShellToolbar/ShellToolbar'
import { CommandBar } from './CommandBar'
import type { WindowId } from '../../store/windowStore'
import styles from './Explorer.module.css'

export interface ExplorerItem {
  label: string
  icon: ReactNode
  description?: string
}

export interface ExplorerGroup {
  label: string
  items: ExplorerItem[]
}

interface ExplorerWindowProps {
  id: WindowId
  title: string
  icon: ReactNode
  statusNote: string
  /** breadcrumb trail shown in the address band (defaults to the window title) */
  crumbs?: string[]
  /** when provided, the window renders a grouped tile view instead of the empty state */
  groups?: ExplorerGroup[]
}

/** Explorer window used by the desktop icons; either an empty folder or a grouped tile view. */
export function ExplorerWindow({
  id,
  title,
  icon,
  statusNote,
  crumbs,
  groups,
}: ExplorerWindowProps) {
  const itemCount = groups?.reduce((count, group) => count + group.items.length, 0) ?? 0
  const hasContents = itemCount > 0

  return (
    <Window
      id={id}
      title={title}
      navControls={<ShellNavControls />}
      toolbar={<ShellToolbar crumbs={crumbs ?? [title]} searchPlaceholder={`Search ${title}`} />}
      commandBar={<CommandBar />}
      bodyClassName={styles.body}
    >
      {hasContents ? (
        <div className={styles.contents}>
          {groups?.map((group) => (
            <section key={group.label} className={styles.group} aria-label={group.label}>
              <h2 className={styles.groupTitle}>
                <span className={styles.groupChevron} aria-hidden="true" />
                {group.label}
              </h2>
              <ul className={styles.itemGrid}>
                {group.items.map((item) => (
                  <li key={item.label} className={styles.item}>
                    <span className={styles.itemIcon}>{item.icon}</span>
                    <span className={styles.itemText}>
                      <span className={styles.itemLabel}>{item.label}</span>
                      {item.description ? (
                        <span className={styles.itemDescription}>{item.description}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          {icon}
          <h2 className={styles.emptyTitle}>{title}</h2>
          <p className={styles.emptyText}>This folder is empty.</p>
        </div>
      )}

      <footer className={styles.statusBar}>
        <span>
          {hasContents ? `${String(itemCount)} ${itemCount === 1 ? 'item' : 'items'}` : '0 objects'}
        </span>
        <span className={styles.statusDivider} />
        <span>{statusNote}</span>
      </footer>
    </Window>
  )
}
