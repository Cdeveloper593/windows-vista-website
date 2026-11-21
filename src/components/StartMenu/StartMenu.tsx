import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useWindowStore, type WindowId } from '../../store/windowStore'
import {
  InternetExplorerIcon,
  WindowsMailIcon,
  WelcomeCenterIcon,
  MediaCenterIcon,
  UltimateExtrasIcon,
  MediaPlayerIcon,
  PhotoGalleryIcon,
  MessengerIcon,
  DVDMakerIcon,
  MeetingSpaceIcon,
  DocumentsIcon,
  PicturesIcon,
  MusicIcon,
  GamesIcon,
  RecentItemsIcon,
  ComputerIcon,
  NetworkIcon,
  ConnectToIcon,
  ControlPanelIcon,
  DefaultProgramsIcon,
  HelpIcon,
  AllProgramsIcon,
  FlowerAvatarIcon,
  PowerGlyph,
  LockGlyph,
  MagnifierIcon,
} from '../icons'
import styles from './StartMenu.module.css'

interface PinnedItem {
  id: string
  icon: ReactNode
  name: string
  sub: string
  /** window this pinned item launches, if it is a real app */
  windowId?: WindowId
}

interface ProgramItem {
  id: string
  icon: ReactNode
  name: string
}

const PINNED: PinnedItem[] = [
  {
    id: 'ie',
    icon: <InternetExplorerIcon size={34} />,
    name: 'Internet',
    sub: 'Internet Explorer',
    windowId: 'internet-explorer',
  },
  { id: 'mail', icon: <WindowsMailIcon size={34} />, name: 'E-mail', sub: 'Windows Mail' },
]

const PROGRAMS: ProgramItem[] = [
  { id: 'welcome', icon: <WelcomeCenterIcon size={23} />, name: 'Welcome Center' },
  { id: 'mediacenter', icon: <MediaCenterIcon size={23} />, name: 'Windows Media Center' },
  { id: 'extras', icon: <UltimateExtrasIcon size={23} />, name: 'Windows Ultimate Extras' },
  { id: 'wmp', icon: <MediaPlayerIcon size={23} />, name: 'Windows Media Player' },
  { id: 'photogallery', icon: <PhotoGalleryIcon size={23} />, name: 'Windows Photo Gallery' },
  { id: 'messenger', icon: <MessengerIcon size={23} />, name: 'Windows Live Messenger Download' },
  { id: 'dvd', icon: <DVDMakerIcon size={23} />, name: 'Windows DVD Maker' },
  { id: 'meetingspace', icon: <MeetingSpaceIcon size={23} />, name: 'Windows Meeting Space' },
]

interface RightItem {
  id: string
  icon?: ReactNode
  label: string
  bold?: boolean
  hasSubmenu?: boolean
}

const RIGHT_USER: RightItem[] = [{ id: 'john', label: 'John Doe', bold: true }]
const RIGHT_DOCS: RightItem[] = [
  { id: 'documents', icon: <DocumentsIcon size={26} />, label: 'Documents' },
  { id: 'pictures', icon: <PicturesIcon size={26} />, label: 'Pictures' },
  { id: 'music', icon: <MusicIcon size={26} />, label: 'Music' },
  { id: 'games', icon: <GamesIcon size={26} />, label: 'Games' },
  { id: 'recent', icon: <RecentItemsIcon size={26} />, label: 'Recent Items', hasSubmenu: true },
]
const RIGHT_SYSTEM: RightItem[] = [
  { id: 'computer', icon: <ComputerIcon size={26} />, label: 'Computer' },
  { id: 'network', icon: <NetworkIcon size={26} />, label: 'Network' },
  { id: 'connectto', icon: <ConnectToIcon size={26} />, label: 'Connect To' },
]
const RIGHT_TOOLS: RightItem[] = [
  { id: 'controlpanel', icon: <ControlPanelIcon size={26} />, label: 'Control Panel' },
  { id: 'defaults', icon: <DefaultProgramsIcon size={26} />, label: 'Default Programs' },
  { id: 'help', icon: <HelpIcon size={26} />, label: 'Help and Support' },
]

const RECENT_ITEMS = ['Welcome Center.website', 'Budget 2007.xlsx', 'Vacation plans.docx']

export interface StartMenuProps {
  /** ask the desktop to show the shutdown/lock overlay */
  onPowerAction: (action: 'shutdown' | 'lock') => void
}

export function StartMenu({ onPowerAction }: StartMenuProps) {
  const setStartMenuOpen = useWindowStore((s) => s.setStartMenuOpen)
  const openWindow = useWindowStore((s) => s.openWindow)
  const [query, setQuery] = useState('')
  const [recentOpen, setRecentOpen] = useState(false)
  const [powerFlyoutOpen, setPowerFlyoutOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const close = useCallback(() => {
    setStartMenuOpen(false)
  }, [setStartMenuOpen])

  // Escape closes the menu
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        close()
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [close])

  // Focus the search box when the menu opens
  useEffect(() => {
    searchRef.current?.focus({ preventScroll: true })
  }, [])

  const filteredPrograms = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PROGRAMS
    return PROGRAMS.filter((p) => p.name.toLowerCase().includes(q))
  }, [query])

  const isFiltering = query.trim().length > 0

  // Simple vertical arrow-key navigation between menu items
  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[data-menu-item="true"]') ?? [],
    )
    if (items.length === 0) return
    const current = document.activeElement as HTMLElement | null
    const index = current ? items.indexOf(current) : -1
    event.preventDefault()
    const delta = event.key === 'ArrowDown' ? 1 : -1
    const next = items[(index + delta + items.length) % items.length]
    next.focus()
  }

  const renderRightItem = (item: RightItem) => {
    const isRecent = item.hasSubmenu === true
    return (
      <li key={item.id} className={styles.rightItemSlot}>
        <button
          type="button"
          role="menuitem"
          data-menu-item="true"
          className={`${styles.rightItem} ${item.bold ? styles.rightItemBold : ''}`}
          aria-haspopup={isRecent ? 'menu' : undefined}
          aria-expanded={isRecent ? recentOpen : undefined}
          onClick={() => {
            if (isRecent) {
              setRecentOpen((v) => !v)
              return
            }
            close()
          }}
        >
          {item.icon ? <span className={styles.rightItemIcon}>{item.icon}</span> : null}
          <span className={styles.rightItemLabel}>{item.label}</span>
          {isRecent ? (
            <svg
              viewBox="0 0 10 10"
              width="8"
              height="8"
              className={styles.submenuChevron}
              aria-hidden="true"
            >
              <path d="M2.5 1l5 4-5 4z" fill="#f2f2f2" />
            </svg>
          ) : null}
        </button>
        {isRecent && recentOpen ? (
          <ul className={styles.submenu} role="menu" aria-label="Recent Items">
            {RECENT_ITEMS.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  role="menuitem"
                  className={styles.submenuItem}
                  onClick={close}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </li>
    )
  }

  return (
    <div
      id="start-menu"
      ref={menuRef}
      className={`${styles.menu} menu-opening`}
      role="menu"
      aria-label="Start menu"
      onKeyDown={onMenuKeyDown}
    >
      {/* ============ LEFT PANE (white) ============ */}
      <div className={styles.leftPane}>
        {/* pinned items */}
        <div className={styles.pinned}>
          {PINNED.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              data-menu-item="true"
              className={styles.pinnedItem}
              onClick={() => {
                if (item.windowId) openWindow(item.windowId)
                close()
              }}
            >
              <span className={styles.pinnedIcon}>{item.icon}</span>
              <span className={styles.pinnedText}>
                <span className={styles.pinnedName}>{item.name}</span>
                <span className={styles.pinnedSub}>{item.sub}</span>
              </span>
            </button>
          ))}
        </div>

        <div className={styles.divider} role="separator" />

        {/* program list */}
        <div className={styles.programs} aria-label="Programs">
          {isFiltering ? <div className={styles.filterCaption}>Programs</div> : null}
          {filteredPrograms.map((program) => (
            <button
              key={program.id}
              type="button"
              role="menuitem"
              data-menu-item="true"
              className={styles.programItem}
              onClick={close}
            >
              <span className={styles.programIcon}>{program.icon}</span>
              <span className={styles.programName}>{program.name}</span>
            </button>
          ))}
          {filteredPrograms.length === 0 ? (
            <div className={styles.emptyFilter}>No programs found</div>
          ) : null}
        </div>

        {/* All Programs */}
        <button
          type="button"
          role="menuitem"
          data-menu-item="true"
          className={styles.allPrograms}
          onClick={close}
        >
          <AllProgramsIcon size={17} />
          <span>All Programs</span>
        </button>

        {/* Start Search */}
        <div className={styles.searchRow}>
          <label className={styles.searchBox}>
            <input
              ref={searchRef}
              type="text"
              className={styles.searchInput}
              placeholder="Start Search"
              aria-label="Start Search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
              }}
              spellCheck={false}
              autoComplete="off"
            />
            <MagnifierIcon size={19} className={styles.searchGlyph} title="Search" />
          </label>
        </div>
      </div>

      {/* ============ RIGHT PANE (dark glass) ============ */}
      <div className={styles.rightPane}>
        {/* avatar overlapping the top edge */}
        <div className={styles.avatarSlot}>
          <FlowerAvatarIcon size={56} className={styles.avatar} title="John Doe" />
        </div>

        <ul className={styles.rightList}>
          {RIGHT_USER.map(renderRightItem)}
          <li className={styles.rightSpacer} aria-hidden="true" />
          {RIGHT_DOCS.map(renderRightItem)}
          <li className={styles.rightSpacer} aria-hidden="true" />
          {RIGHT_SYSTEM.map(renderRightItem)}
          <li className={styles.rightSpacer} aria-hidden="true" />
          {RIGHT_TOOLS.map(renderRightItem)}
        </ul>

        {/* power / lock / flyout */}
        <div className={styles.powerRow}>
          <div className={styles.powerCluster} role="group" aria-label="Power options">
            <button
              type="button"
              className={styles.powerButton}
              aria-label="Shut down"
              title="Shut down"
              onClick={() => {
                close()
                onPowerAction('shutdown')
              }}
            >
              <PowerGlyph size={19} />
            </button>
            <button
              type="button"
              className={styles.lockButton}
              aria-label="Lock"
              title="Lock"
              onClick={() => {
                close()
                onPowerAction('lock')
              }}
            >
              <LockGlyph size={15} />
            </button>
            <button
              type="button"
              className={styles.moreButton}
              aria-label="More power options"
              aria-haspopup="menu"
              aria-expanded={powerFlyoutOpen}
              title="More power options"
              onClick={() => {
                setPowerFlyoutOpen((v) => !v)
              }}
            >
              <svg viewBox="0 0 10 10" width="7" height="9" aria-hidden="true">
                <path d="M1 0.8 5.6 5 1 9.2z" fill="#f2f2f2" />
              </svg>
            </button>
            {powerFlyoutOpen ? (
              <ul className={styles.powerFlyout} role="menu" aria-label="Power options">
                {['Sleep', 'Restart', 'Log Off', 'Switch User'].map((label) => (
                  <li key={label}>
                    <button
                      type="button"
                      role="menuitem"
                      className={styles.submenuItem}
                      onClick={() => {
                        setPowerFlyoutOpen(false)
                        close()
                      }}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
