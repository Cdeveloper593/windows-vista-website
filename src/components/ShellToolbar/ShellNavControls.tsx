import styles from './shellNav.module.css'

/**
 * Pearly glass back/forward navigation circles in the Vista titlebar row.
 * Real Vista uses BOLD FILLED arrows (not line-drawn chevrons): back is
 * dark slate, the disabled forward arrow is medium grey, and the forward
 * pearl is smaller than the back pearl.
 */
export function ShellNavControls() {
  return (
    <>
      <button
        type="button"
        className={`${styles.shellNavCircle} ${styles.shellNavBack}`}
        aria-label="Back"
        title="Back"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M21 10.3h-8.2V5.6L4.6 12l8.2 6.4v-4.7H21z" fill="#26333b" />
        </svg>
      </button>
      <button
        type="button"
        className={`${styles.shellNavCircle} ${styles.shellNavForward}`}
        aria-label="Forward"
        title="Forward"
        aria-disabled="true"
        disabled
      >
        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
          <path d="M3 10.3h8.2V5.6L19.4 12l-8.2 6.4v-4.7H3z" fill="#8a959b" />
        </svg>
      </button>
      <button
        type="button"
        className={styles.shellNavDropdown}
        aria-label="Recent locations"
        title="Recent locations"
      >
        <svg viewBox="0 0 12 12" width="8" height="8" aria-hidden="true">
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            fill="none"
            stroke="#26343c"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  )
}
