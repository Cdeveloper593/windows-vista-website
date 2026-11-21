import { useState } from 'react'
import styles from './games.module.css'
import f from './FreeCell.module.css'
import {
  type CardT,
  PlayingCard,
  PileSlot,
  SUITS,
  SUIT_GLYPH,
  isRed,
  makeDeck,
  shuffle,
} from './cards'

interface GameState {
  cells: (CardT | null)[] // 4 free cells, one card each
  foundations: CardT[][] // one pile per suit, index matches SUITS
  cascades: CardT[][] // 8 columns, all face up
  moves: number
}

type Selection =
  | { kind: 'cell'; index: number }
  | { kind: 'foundation'; pile: number }
  | { kind: 'cascade'; col: number; index: number }

type Dest =
  | { kind: 'cell'; index: number }
  | { kind: 'foundation'; pile: number }
  | { kind: 'cascade'; col: number }

function newGame(): GameState {
  const deck = shuffle(makeDeck())
  const cascades: CardT[][] = Array.from({ length: 8 }, () => [])
  deck.forEach((card, i) => {
    cascades[i % 8].push(card)
  })
  return {
    cells: [null, null, null, null],
    foundations: SUITS.map(() => []),
    cascades,
    moves: 0,
  }
}

function cloneState(s: GameState): GameState {
  return {
    cells: s.cells.slice(),
    foundations: s.foundations.map((p) => p.slice()),
    cascades: s.cascades.map((p) => p.slice()),
    moves: s.moves,
  }
}

/** Start index of the movable run at the end of a cascade: the longest
 *  suffix that descends in alternating colours. */
function runStart(pile: CardT[]): number {
  let start = pile.length - 1
  while (start > 0) {
    const upper = pile[start - 1]
    const lower = pile[start]
    if (upper.rank === lower.rank + 1 && isRed(upper) !== isRed(lower)) start -= 1
    else break
  }
  return start
}

function selectionCards(s: GameState, sel: Selection): CardT[] {
  switch (sel.kind) {
    case 'cell': {
      const card = s.cells[sel.index]
      return card ? [card] : []
    }
    case 'foundation': {
      const pile = s.foundations[sel.pile]
      return pile.length ? [pile[pile.length - 1]] : []
    }
    case 'cascade':
      return s.cascades[sel.col].slice(sel.index)
  }
}

function removeSelection(s: GameState, sel: Selection, count: number): void {
  switch (sel.kind) {
    case 'cell':
      s.cells[sel.index] = null
      break
    case 'foundation':
      s.foundations[sel.pile].splice(s.foundations[sel.pile].length - count, count)
      break
    case 'cascade':
      s.cascades[sel.col].splice(sel.index, count)
      break
  }
}

function addToDest(s: GameState, dest: Dest, cards: CardT[]): void {
  switch (dest.kind) {
    case 'cell':
      s.cells[dest.index] = cards[0]
      break
    case 'foundation':
      s.foundations[dest.pile].push(...cards)
      break
    case 'cascade':
      s.cascades[dest.col].push(...cards)
      break
  }
}

function canDropOnFoundation(card: CardT, pile: CardT[], pileIdx: number): boolean {
  if (card.suit !== SUITS[pileIdx]) return false
  if (!pile.length) return card.rank === 1
  return pile[pile.length - 1].rank + 1 === card.rank
}

/** How many cards may be carried at once: (1 + free cells) × 2^(empty
 *  cascades). An empty destination cascade doesn't count itself. */
function moveCapacity(s: GameState, destCol: number | null): number {
  const emptyCells = s.cells.filter((c) => c === null).length
  let emptyCascades = s.cascades.filter((c) => c.length === 0).length
  if (destCol !== null && s.cascades[destCol].length === 0) emptyCascades -= 1
  return (1 + emptyCells) * 2 ** emptyCascades
}

/** Validate + apply a move on a clone; returns null when illegal. */
function tryMove(s0: GameState, sel: Selection, dest: Dest): GameState | null {
  const cards = selectionCards(s0, sel)
  if (!cards.length) return null
  if (dest.kind === 'cell') {
    if (cards.length !== 1 || sel.kind === 'cell') return null
    if (s0.cells[dest.index] !== null) return null
  } else if (dest.kind === 'foundation') {
    if (cards.length !== 1) return null
    if (!canDropOnFoundation(cards[0], s0.foundations[dest.pile], dest.pile)) return null
  } else {
    // cascade destination
    if (sel.kind === 'cascade') {
      if (sel.col === dest.col) return null
      // Only a proper descending alternating run can be picked up.
      if (sel.index < runStart(s0.cascades[sel.col])) return null
      // Moving a whole cascade into an empty cascade changes nothing.
      if (!s0.cascades[dest.col].length && sel.index === 0) return null
    }
    if (cards.length > moveCapacity(s0, dest.col)) return null
    const destPile = s0.cascades[dest.col]
    if (destPile.length) {
      const top = destPile[destPile.length - 1]
      if (top.rank !== cards[0].rank + 1 || isRed(top) === isRed(cards[0])) return null
    }
  }
  const s = cloneState(s0)
  const moving = selectionCards(s, sel)
  removeSelection(s, sel, moving.length)
  addToDest(s, dest, moving)
  s.moves += 1
  return s
}

export default function FreeCell() {
  const [state, setState] = useState<GameState>(newGame)
  const [sel, setSel] = useState<Selection | null>(null)

  const won = state.foundations.reduce((n, p) => n + p.length, 0) === 52
  const freeCells = state.cells.filter((c) => c === null).length

  function restart() {
    setState(newGame())
    setSel(null)
  }

  function moveSel(dest: Dest): boolean {
    if (!sel) return false
    const ns = tryMove(state, sel, dest)
    if (!ns) return false
    setState(ns)
    setSel(null)
    return true
  }

  function clickCell(index: number) {
    if (state.cells[index]) {
      // Filled cell: select its card (or deselect).
      setSel(sel?.kind === 'cell' && sel.index === index ? null : { kind: 'cell', index })
    } else if (sel) {
      moveSel({ kind: 'cell', index })
    }
  }

  function clickFoundation(pile: number) {
    if (sel && sel.kind !== 'foundation' && moveSel({ kind: 'foundation', pile })) return
    if (sel?.kind === 'foundation' && sel.pile === pile) setSel(null)
    else if (state.foundations[pile].length) setSel({ kind: 'foundation', pile })
    else setSel(null)
  }

  function clickCascadeCard(col: number, index: number) {
    const pile = state.cascades[col]
    // Only the movable run can be picked up; clicking above it grabs the run.
    const start = Math.max(index, runStart(pile))
    if (sel) {
      if (sel.kind === 'cascade' && sel.col === col) {
        setSel(sel.index === start ? null : { kind: 'cascade', col, index: start })
        return
      }
      if (moveSel({ kind: 'cascade', col })) return
    }
    setSel({ kind: 'cascade', col, index: start })
  }

  function clickEmptyCascade(col: number) {
    if (sel) moveSel({ kind: 'cascade', col })
  }

  /** Double-click: foundation if it fits, otherwise a free cell. */
  function autoMove(source: Selection) {
    const cards = selectionCards(state, source)
    if (cards.length !== 1) return
    const pile = SUITS.indexOf(cards[0].suit)
    const toFoundation = tryMove(state, source, { kind: 'foundation', pile })
    if (toFoundation) {
      setState(toFoundation)
      setSel(null)
      return
    }
    if (source.kind !== 'cell') {
      const empty = state.cells.findIndex((c) => c === null)
      if (empty >= 0) {
        const toCell = tryMove(state, source, { kind: 'cell', index: empty })
        if (toCell) {
          setState(toCell)
          setSel(null)
        }
      }
    }
  }

  function cardSelected(col: number, idx: number): boolean {
    return sel !== null && sel.kind === 'cascade' && sel.col === col && idx >= sel.index
  }

  return (
    <div className={styles.stage}>
      <div className={styles.gameBar}>
        <span className={styles.gameBarTitle}>FreeCell</span>
        <span className={styles.gameStatus}>Free cells: {freeCells}</span>
        <span className={styles.gameStatus}>Moves: {state.moves}</span>
        <span className={styles.gameBarSpacer} />
        <button type="button" className={styles.gameButton} onClick={restart}>
          New game
        </button>
      </div>
      <div className={styles.stageScroll}>
        <div className={f.board}>
          {won && <div className={styles.winBanner}>You win! All 52 cards are home. 🎉</div>}
          <div className={styles.feltRow}>
            {state.cells.map((card, i) =>
              card ? (
                <PlayingCard
                  key={i}
                  card={card}
                  small
                  selected={sel?.kind === 'cell' && sel.index === i}
                  onClick={() => {
                    clickCell(i)
                  }}
                  onDoubleClick={() => {
                    autoMove({ kind: 'cell', index: i })
                  }}
                />
              ) : (
                <PileSlot
                  key={i}
                  small
                  onClick={() => {
                    clickCell(i)
                  }}
                />
              ),
            )}
            <div className={f.gap} />
            {state.foundations.map((pile, i) =>
              pile.length ? (
                <PlayingCard
                  key={SUITS[i]}
                  card={pile[pile.length - 1]}
                  small
                  selected={sel?.kind === 'foundation' && sel.pile === i}
                  onClick={() => {
                    clickFoundation(i)
                  }}
                />
              ) : (
                <PileSlot
                  key={SUITS[i]}
                  small
                  label={SUIT_GLYPH[SUITS[i]]}
                  onClick={() => {
                    clickFoundation(i)
                  }}
                />
              ),
            )}
          </div>
          <div className={styles.feltRow}>
            {state.cascades.map((pile, col) => (
              <div key={col} className={`${styles.cardStack} ${styles.cardStackSmall}`}>
                {pile.length === 0 ? (
                  <PileSlot
                    small
                    onClick={() => {
                      clickEmptyCascade(col)
                    }}
                  />
                ) : (
                  pile.map((card, idx) => (
                    <PlayingCard
                      key={card.id}
                      card={card}
                      small
                      selected={cardSelected(col, idx)}
                      onClick={() => {
                        clickCascadeCard(col, idx)
                      }}
                      onDoubleClick={
                        idx === pile.length - 1
                          ? () => {
                              autoMove({ kind: 'cascade', col, index: idx })
                            }
                          : undefined
                      }
                    />
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
