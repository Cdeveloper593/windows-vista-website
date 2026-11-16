import { useState } from 'react'
import type { ReactNode } from 'react'
import styles from './ShellToolbar.module.css'

export interface ShellToolbarProps {
  /** breadcrumb segments, e.g. ['System and Maintenance', 'Welcome Center'] */
  crumbs: string[]
  searchPlaceholder?: string
  /** called when the user presses Enter in the address field */
  onNavigate?: (value: string) => void
}

function AddressIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <rect
        x="0.75"
        y="0.75"
        width="14.5"
        height="14.5"
        rx="1.8"
        fill="#0e8ba0"
        stroke="#04272e"
        strokeWidth="1"
      />
      <path d="M4.4 4.4h7.2v3H4.4z" fill="#7fe3f2" />
      <path d="M4.4 9.2h7.2v2.4H4.4z" fill="#3aa9bd" />
    </svg>
  )
}

function SparklePlusGlyph() {
  /* Reference detail: the small button beside the search box carries the
     Vista refresh mark — two curved BLUE arrows chasing each other. */
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
      <path
        d="M13.2 8a5.2 5.2 0 0 1-9.3 3.2"
        fill="none"
        stroke="#2b6cb3"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M3.4 14.6l.5-3.6 3.2 1.7z"
        fill="#2b6cb3"
        stroke="#2b6cb3"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path
        d="M2.8 8a5.2 5.2 0 0 1 9.3-3.2"
        fill="none"
        stroke="#2b6cb3"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12.6 1.4l-.5 3.6-3.2-1.7z"
        fill="#2b6cb3"
        stroke="#2b6cb3"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronDownGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
      <path d="M3 6l5 5 5-5z" fill="#20333a" />
    </svg>
  )
}

function SearchGlyph() {
  /* Reference detail: BLUE magnifier, loop at the upper right with the
     handle running down to the lower left, pale blue glass fill. */
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <path d="M7.6 9.9L3 14.5" stroke="#2e6da8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10.4" cy="6" r="4.4" fill="#dceefb" stroke="#2e6da8" strokeWidth="1.7" />
    </svg>
  )
}

export function ShellToolbar({
  crumbs,
  searchPlaceholder = 'Search',
  onNavigate,
}: ShellToolbarProps): ReactNode {
  const [search, setSearch] = useState('')
  const [spinning, setSpinning] = useState(false)

  return (
    <>
      <div
        className={styles.addressField}
        role="combobox"
        aria-label="Address"
        aria-expanded="false"
      >
        <AddressIcon />
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => (
            <span key={i} className={styles.crumb}>
              {i > 0 ? (
                <svg
                  viewBox="0 0 10 10"
                  width="7"
                  height="7"
                  className={styles.crumbSep}
                  aria-hidden="true"
                >
                  <path
                    d="M2 1l5 4-5 4"
                    fill="none"
                    stroke="#20333a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
              <span className={styles.crumbText}>{crumb}</span>
            </span>
          ))}
        </nav>
        <button
          type="button"
          className={styles.addressDropdown}
          aria-label="Address history"
          title="Address history"
        >
          <ChevronDownGlyph />
        </button>
      </div>

      <button
        type="button"
        className={`${styles.sparkleButton} ${spinning ? styles.spinning : ''}`}
        aria-label="Refresh view"
        title="Refresh"
        onClick={() => {
          setSpinning(true)
          window.setTimeout(() => {
            setSpinning(false)
          }, 650)
          onNavigate?.(crumbs.join('/'))
        }}
      >
        <SparklePlusGlyph />
      </button>

      <label className={styles.searchField}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
          aria-label={searchPlaceholder}
        />
        <SearchGlyph />
      </label>
    </>
  )
}
