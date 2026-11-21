import { useState } from 'react'
import styles from './games.module.css'
import ms from './Minesweeper.module.css'

const SIZE = 9
const MINES = 10
const CELLS = SIZE * SIZE

/** Classic Minesweeper number colours, index = adjacent mine count. */
const NUMBER_COLORS = [
  '',
  '#0101d8',
  '#007b00',
  '#d80000',
  '#01017b',
  '#7b0101',
  '#007b7b',
  '#000000',
  '#7b7b7b',
]

function neighborsOf(i: number): number[] {
  const r = Math.floor(i / SIZE)
  const c = i % SIZE
  const out: number[] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) out.push(nr * SIZE + nc)
    }
  }
  return out
}

function countAround(mines: boolean[], i: number): number {
  let n = 0
  for (const nb of neighborsOf(i)) if (mines[nb]) n += 1
  return n
}

/** Place mines everywhere except the first-clicked cell. */
function placeMines(safe: number): boolean[] {
  const m = Array<boolean>(CELLS).fill(false)
  let placed = 0
  while (placed < MINES) {
    const i = Math.floor(Math.random() * CELLS)
    if (i === safe || m[i]) continue
    m[i] = true
    placed += 1
  }
  return m
}

/** Reveal a cell, flood-filling outwards through empty (0-count) cells. */
function floodReveal(mines: boolean[], revealed: boolean[], start: number): boolean[] {
  const next = [...revealed]
  const stack = [start]
  while (stack.length > 0) {
    const i = stack.pop()
    if (i === undefined) break
    if (next[i] || mines[i]) continue
    next[i] = true
    if (countAround(mines, i) === 0) {
      for (const nb of neighborsOf(i)) if (!next[nb]) stack.push(nb)
    }
  }
  return next
}

function MineIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <g stroke="#1d2a31" strokeWidth="1.8" strokeLinecap="round">
        <line x1="10" y1="1.5" x2="10" y2="18.5" />
        <line x1="1.5" y1="10" x2="18.5" y2="10" />
        <line x1="4" y1="4" x2="16" y2="16" />
        <line x1="16" y1="4" x2="4" y2="16" />
      </g>
      <circle cx="10" cy="10" r="4.6" fill="#1d2a31" />
      <circle cx="8.4" cy="8.4" r="1.3" fill="#e8f2f5" />
    </svg>
  )
}

type Phase = 'playing' | 'won' | 'lost'

export default function Minesweeper() {
  const [mines, setMines] = useState<boolean[] | null>(null)
  const [revealed, setRevealed] = useState<boolean[]>(() => Array<boolean>(CELLS).fill(false))
  const [flagged, setFlagged] = useState<boolean[]>(() => Array<boolean>(CELLS).fill(false))
  const [phase, setPhase] = useState<Phase>('playing')
  const [hit, setHit] = useState(-1)

  const flagsUsed = flagged.filter(Boolean).length

  function reset() {
    setMines(null)
    setRevealed(Array<boolean>(CELLS).fill(false))
    setFlagged(Array<boolean>(CELLS).fill(false))
    setPhase('playing')
    setHit(-1)
  }

  function handleReveal(i: number) {
    if (phase !== 'playing' || revealed[i] || flagged[i]) return
    let m = mines
    if (m === null) {
      m = placeMines(i)
      setMines(m)
    }
    if (m[i]) {
      setRevealed(revealed.map((r, idx) => r || m[idx]))
      setHit(i)
      setPhase('lost')
      return
    }
    const next = floodReveal(m, revealed, i)
    setRevealed(next)
    if (next.filter(Boolean).length === CELLS - MINES) setPhase('won')
  }

  function handleFlag(e: React.MouseEvent, i: number) {
    e.preventDefault()
    if (phase !== 'playing' || revealed[i]) return
    setFlagged(flagged.map((f, idx) => (idx === i ? !f : f)))
  }

  const status =
    phase === 'lost'
      ? 'Mine hit — game over.'
      : phase === 'won'
        ? 'Minefield cleared!'
        : `Mines left: ${MINES - flagsUsed} · right-click to flag`

  return (
    <div className={styles.stage}>
      <div className={styles.gameBar}>
        <span className={styles.gameBarTitle}>Minesweeper</span>
        <span className={styles.gameStatus}>{status}</span>
        <span className={styles.gameBarSpacer} />
        <button type="button" className={styles.gameButton} onClick={reset}>
          New game
        </button>
      </div>
      <div className={styles.stageScroll}>
        <div className={ms.board}>
          {Array.from({ length: CELLS }, (_, i) => {
            const isOpen = revealed[i]
            const count = isOpen && mines && !mines[i] ? countAround(mines, i) : 0
            const cls = [ms.cell, isOpen ? ms.cellOpen : '', i === hit ? ms.cellHit : '']
              .filter(Boolean)
              .join(' ')
            return (
              <button
                key={i}
                type="button"
                className={cls}
                aria-label={isOpen ? 'Revealed cell' : flagged[i] ? 'Flagged cell' : 'Hidden cell'}
                onClick={() => {
                  handleReveal(i)
                }}
                onContextMenu={(e) => {
                  handleFlag(e, i)
                }}
              >
                {isOpen ? (
                  mines?.[i] ? (
                    <MineIcon />
                  ) : count > 0 ? (
                    <span style={{ color: NUMBER_COLORS[count] }}>{count}</span>
                  ) : (
                    ''
                  )
                ) : flagged[i] ? (
                  <span className={ms.flag}>⚑</span>
                ) : (
                  ''
                )}
              </button>
            )
          })}
        </div>
        {phase === 'won' && (
          <div className={styles.winBanner} style={{ marginTop: 12 }}>
            You win! Every safe cell is clear.
          </div>
        )}
      </div>
    </div>
  )
}
