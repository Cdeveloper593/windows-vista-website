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
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <path
        d="M6 1l1.1 3.1L10.2 5.2 7.1 6.3 6 9.4 4.9 6.3 1.8 5.2l3.1-1.1z"
        fill="#1b63b7"
        stroke="#06223f"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <path
        d="M12.2 7.6v5.6M9.4 10.4h5.6"
        stroke="#1b63b7"
        strokeWidth="1.7"
        strokeLinecap="round"
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
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <circle cx="6.6" cy="6.6" r="4.6" fill="#bfe2f5" stroke="#123f63" strokeWidth="1.5" />
      <path d="M10.2 10.2l4 4" stroke="#123f63" strokeWidth="1.8" strokeLinecap="round" />
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
