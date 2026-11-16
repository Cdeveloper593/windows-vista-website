import styles from './shellNav.module.css'

/**
 * Large pearly glass back/forward navigation circles used in the
 * Vista shell toolbar row.
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
        <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
          <path
            d="M14.5 5.5 8 12l6.5 6.5M8.8 12H20"
            fill="none"
            stroke="#12333f"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        className={styles.shellNavCircle}
        aria-label="Forward"
        title="Forward"
        aria-disabled="true"
        disabled
      >
        <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
          <path
            d="M9.5 5.5 16 12l-6.5 6.5M15.2 12H4"
            fill="none"
            stroke="#27414c"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
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
