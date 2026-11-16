import styles from './CommandBar.module.css'

const COMMANDS = ['Organize', 'Views', 'Share', 'Burn'] as const

function HelpGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="19" height="19" aria-hidden="true">
      <defs>
        <radialGradient id="vista-help-glass" cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#7fa8f2" />
          <stop offset="45%" stopColor="#2b5fc7" />
          <stop offset="100%" stopColor="#17357e" />
        </radialGradient>
      </defs>
      <circle
        cx="10"
        cy="10"
        r="8.4"
        fill="url(#vista-help-glass)"
        stroke="#e8edf0"
        strokeWidth="1.6"
      />
      <text
        x="10"
        y="14.6"
        textAnchor="middle"
        fontSize="12.5"
        fontWeight="700"
        fill="#ffffff"
        fontFamily="'Segoe UI', Tahoma, sans-serif"
      >
        ?
      </text>
    </svg>
  )
}

/**
 * Vista Explorer command bar — the glossy teal slab from the "Windows Aero"
 * reference detail, with command labels on the left and the round blue
 * help button at the right end.
 */
export function CommandBar() {
  return (
    <>
      <div className={styles.commands}>
        {COMMANDS.map((label, i) => (
          <button type="button" key={label} className={styles.command}>
            {label}
            {i < 2 ? (
              <svg viewBox="0 0 10 10" width="7" height="7" aria-hidden="true">
                <path d="M1.5 3.5 5 7l3.5-3.5z" fill="#dceef2" />
              </svg>
            ) : null}
          </button>
        ))}
      </div>
      <button type="button" className={styles.help} aria-label="Help" title="Help">
        <HelpGlyph />
      </button>
    </>
  )
}
