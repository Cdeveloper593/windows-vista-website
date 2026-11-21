import type { ReactNode } from 'react'
import { Window } from '../Window/Window'
import { ShellNavControls } from '../ShellToolbar/ShellNavControls'
import { ShellToolbar } from '../ShellToolbar/ShellToolbar'
import { CommandBar, type ExplorerCommand } from './CommandBar'
import { NavPane } from './NavPane'
import type { WindowId } from '../../store/windowStore'
import styles from './Explorer.module.css'

export interface ExplorerItem {
  label: string
  icon: ReactNode
  description?: string
  /** Vista Tiles-view capacity gauge (hard drives): fill % + free-space text */
  capacity?: { usedPercent: number; text: string }
}

export interface ExplorerGroup {
  label: string
  items: ExplorerItem[]
}

export interface ExplorerDetails {
  icon: ReactNode
  title: string
  lines?: string[]
}

interface ExplorerWindowProps {
  id: WindowId
  title: string
  /** this location's real Vista command-bar set */
  commands: ExplorerCommand[]
  /** bottom Details pane content (Vista replaces the old status bar);
      omit for Games Explorer, which uses a right-hand preview pane instead */
  details?: ExplorerDetails
  /** 16px location icon shown at the left of the address bar */
  addressIcon?: ReactNode
  /** breadcrumb trail shown in the address band (defaults to the window title) */
  crumbs?: string[]
  /** grouped tile view (Computer) */
  groups?: ExplorerGroup[]
  /** details-view column headers (Recycle Bin) — renders an empty shell list */
  listColumns?: string[]
  /** navigation pane visibility (Games Explorer has none); default true */
  showNavPane?: boolean
  /** custom body (Games Explorer) — replaces groups/list rendering */
  children?: ReactNode
}

/**
 * Explorer window shell matching real Vista layout: navigation pane on the
 * left (Favorite Links + Folders), content view in the middle, and the pale
 * blue Details pane along the bottom.
 */
export function ExplorerWindow({
  id,
  title,
  commands,
  details,
  addressIcon,
  crumbs,
  groups,
  listColumns,
  showNavPane = true,
  children,
}: ExplorerWindowProps) {
  return (
    <Window
      id={id}
      title={title}
      navControls={<ShellNavControls />}
      toolbar={
        <ShellToolbar
          crumbs={crumbs ?? [title]}
          searchPlaceholder="Search"
          searchLabel={`Search ${title}`}
          addressIcon={addressIcon}
        />
      }
      commandBar={<CommandBar commands={commands} />}
      bodyClassName={styles.body}
    >
      <div className={styles.main}>
        {showNavPane ? <NavPane /> : null}

        {children ??
          (groups ? (
            <div className={styles.contents}>
              {groups.map((group) => (
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
                          {item.capacity ? (
                            <>
                              <span className={styles.gauge} aria-hidden="true">
                                <span
                                  className={styles.gaugeFill}
                                  style={{ width: `${String(item.capacity.usedPercent)}%` }}
                                />
                              </span>
                              <span className={styles.itemDescription}>{item.capacity.text}</span>
                            </>
                          ) : item.description ? (
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
            <div className={styles.listView} role="table" aria-label={title}>
              <div className={styles.listHeader} role="row">
                {listColumns?.map((column, i) => (
                  <span
                    key={column}
                    className={styles.listCell}
                    style={{ flex: `${String([1.4, 1.3, 1, 0.55, 0.9][i] ?? 1)} 1 0` }}
                    role="columnheader"
                  >
                    {column}
                  </span>
                ))}
              </div>
              <div className={styles.listBody} />
            </div>
          ))}
      </div>

      {details ? (
        <footer className={styles.detailsPane}>
          <span className={styles.detailsIcon}>{details.icon}</span>
          <span className={styles.detailsText}>
            <span className={styles.detailsTitle}>{details.title}</span>
            {details.lines?.map((line) => (
              <span key={line} className={styles.detailsLine}>
                {line}
              </span>
            ))}
          </span>
        </footer>
      ) : null}
    </Window>
  )
}
