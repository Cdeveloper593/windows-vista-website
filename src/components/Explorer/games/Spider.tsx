import { useState } from 'react'
import shared from './games.module.css'
import styles from './spider.module.css'
import { makeCard, shuffle, PlayingCard, PileSlot, type CardT } from './cards'

/**
 * One-suit Spider Solitaire — the simple, winnable variant.
 * 104 cards: 8 copies of A..K, all spades. Tableau builds descending by
 * rank; any descending-consecutive face-up suffix can be moved together.
 * A complete K→A run on top of a column is removed automatically.
 * Click-to-move only (no drag).
 */

interface TCard {
  card: CardT
  faceUp: boolean
}

interface GameState {
  cols: TCard[][]
  stock: CardT[][] // piles of 10
  runs: number
}

interface Selection {
  col: number
  index: number
}

function buildGame(): GameState {
  const deck: CardT[] = []
  for (let copy = 0; copy < 8; copy++) {
    for (let rank = 1; rank <= 13; rank++) deck.push(makeCard('spades', rank))
  }
  const cards = shuffle(deck)
  const cols: TCard[][] = []
  let idx = 0
  for (let c = 0; c < 10; c++) {
    const n = c < 4 ? 6 : 5
    const col: TCard[] = []
    for (let i = 0; i < n; i++) {
      col.push({ card: cards[idx], faceUp: i === n - 1 })
      idx += 1
    }
    cols.push(col)
  }
  const stock: CardT[][] = []
  for (let p = 0; p < 5; p++) {
    stock.push(cards.slice(idx, idx + 10))
    idx += 10
  }
  return { cols, stock, runs: 0 }
}

/** Is the suffix of `col` starting at `i` one descending-consecutive run? */
function isRun(col: TCard[], i: number): boolean {
  if (i < 0 || i >= col.length || !col[i].faceUp) return false
  for (let k = i; k < col.length - 1; k++) {
    if (!col[k + 1].faceUp) return false
    if (col[k].card.rank !== col[k + 1].card.rank + 1) return false
  }
  return true
}

/**
 * The movable run a click on index `i` should grab: the longest valid
 * descending suffix at or below the clicked card.
 */
function runStart(col: TCard[], i: number): number {
  let j = i
  while (j < col.length - 1 && !isRun(col, j)) j += 1
  return j
}

/**
 * Tidy a column after cards arrive or leave: remove any complete K→A run
 * sitting on top (possibly more than one), and flip the exposed card.
 */
function settle(colIn: TCard[]): { col: TCard[]; gained: number } {
  let col = colIn
  let gained = 0
  for (;;) {
    if (col.length >= 13) {
      const start = col.length - 13
      let complete = true
      for (let k = 0; k < 13; k++) {
        const t = col[start + k]
        if (!t.faceUp || t.card.rank !== 13 - k) {
          complete = false
          break
        }
      }
      if (complete) {
        col = col.slice(0, start)
        gained += 1
        continue
      }
    }
    if (col.length > 0 && !col[col.length - 1].faceUp) {
      const top = col.length - 1
      col = col.map((t, i) => (i === top ? { ...t, faceUp: true } : t))
      continue
    }
    break
  }
  return { col, gained }
}

export default function Spider() {
  const [game, setGame] = useState<GameState>(buildGame)
  const [sel, setSel] = useState<Selection | null>(null)
  const [hint, setHint] = useState('')

  function newGame() {
    setGame(buildGame())
    setSel(null)
    setHint('')
  }

  function tryMove(destCol: number): boolean {
    if (!sel || sel.col === destCol) return false
    const src = game.cols[sel.col]
    const moving = src.slice(sel.index)
    if (moving.length === 0) return false
    const head = moving[0].card.rank
    const dest = game.cols[destCol]
    if (dest.length === 0) {
      if (head !== 13) {
        setHint('Only a King — or a run starting with a King — can fill an empty column.')
        return false
      }
    } else if (dest[dest.length - 1].card.rank !== head + 1) {
      setHint('Build down: the moved card must be exactly one rank below the card it lands on.')
      return false
    }
    let gained = 0
    const cols = game.cols.map((col, i) => {
      if (i === sel.col) {
        const s = settle(col.slice(0, sel.index))
        gained += s.gained
        return s.col
      }
      if (i === destCol) {
        const s = settle([...col, ...moving])
        gained += s.gained
        return s.col
      }
      return col
    })
    setGame({ cols, stock: game.stock, runs: game.runs + gained })
    setSel(null)
    setHint('')
    return true
  }

  function onCardClick(c: number, i: number) {
    const t = game.cols[c][i]
    if (!t.faceUp) return
    const start = runStart(game.cols[c], i)
    // Clicking another column with a run selected tries the move first;
    // if it was illegal, fall through and select the clicked card instead.
    if (sel && sel.col !== c && tryMove(c)) return
    if (sel?.col === c && sel.index === start) {
      setSel(null) // clicked the selected run again — deselect
      return
    }
    setSel({ col: c, index: start })
  }

  function onSlotClick(c: number) {
    if (sel) tryMove(c)
  }

  function dealStock() {
    if (game.stock.length === 0) return
    if (game.cols.some((c) => c.length === 0)) {
      setHint('Fill every empty column before dealing from the stock.')
      return
    }
    const pile = game.stock[game.stock.length - 1]
    let gained = 0
    const cols = game.cols.map((col, i) => {
      const s = settle([...col, { card: pile[i], faceUp: true }])
      gained += s.gained
      return s.col
    })
    setGame({ cols, stock: game.stock.slice(0, -1), runs: game.runs + gained })
    setSel(null)
    setHint('')
  }

  return (
    <div className={shared.stage}>
      <div className={shared.gameBar}>
        <span className={shared.gameBarTitle}>Spider Solitaire</span>
        <span className={shared.gameStatus}>Runs: {game.runs} / 8</span>
        {hint ? <span className={styles.hint}>{hint}</span> : null}
        <span className={shared.gameBarSpacer} />
        <button type="button" className={shared.gameButton} onClick={newGame}>
          New game
        </button>
      </div>
      {game.runs >= 8 ? (
        <div style={{ padding: '8px 10px 0' }}>
          <div className={shared.winBanner}>You completed all 8 runs — you win!</div>
        </div>
      ) : null}
      <div className={shared.stageScroll}>
        <div className={styles.board}>
          <div className={shared.feltRow}>
            {game.cols.map((col, c) => (
              <div key={c} className={`${shared.cardStack} ${shared.cardStackSmall}`}>
                {col.length === 0 ? (
                  <PileSlot
                    small
                    onClick={() => {
                      onSlotClick(c)
                    }}
                  />
                ) : (
                  col.map((t, i) => (
                    <PlayingCard
                      key={t.card.id}
                      card={t.card}
                      small
                      faceDown={!t.faceUp}
                      selected={!!sel && sel.col === c && i >= sel.index}
                      onClick={() => {
                        onCardClick(c, i)
                      }}
                    />
                  ))
                )}
              </div>
            ))}
          </div>
          <div className={styles.bottomRow}>
            <div className={styles.runs}>
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className={`${styles.runSlot} ${i < game.runs ? styles.runSlotDone : ''}`}
                >
                  {i < game.runs ? 'K → A' : ''}
                </div>
              ))}
            </div>
            <div className={styles.stock}>
              {game.stock.map((pile) => (
                <PlayingCard key={pile[0].id} card={pile[0]} small faceDown onClick={dealStock} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
