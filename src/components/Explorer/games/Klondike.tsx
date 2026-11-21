import { useState } from 'react'
import styles from './games.module.css'
import k from './Klondike.module.css'
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

/** A card plus its face-up state (Klondike hides part of the tableau). */
interface PCard extends CardT {
  faceUp: boolean
}

interface GameState {
  stock: PCard[]
  waste: PCard[]
  foundations: PCard[][] // one pile per suit, index matches SUITS
  tableau: PCard[][]
  moves: number
}

type Selection =
  | { kind: 'waste' }
  | { kind: 'foundation'; pile: number }
  | { kind: 'tableau'; col: number; index: number }

type Dest = { kind: 'tableau'; col: number } | { kind: 'foundation'; pile: number }

function newGame(): GameState {
  const deck = shuffle(makeDeck()).map((c) => ({ ...c, faceUp: false }))
  const tableau: PCard[][] = []
  let i = 0
  for (let col = 0; col < 7; col++) {
    const pile: PCard[] = []
    for (let n = 0; n <= col; n++) {
      const card = deck[i]
      i += 1
      pile.push(n === col ? { ...card, faceUp: true } : card)
    }
    tableau.push(pile)
  }
  return {
    stock: deck.slice(i),
    waste: [],
    foundations: SUITS.map(() => []),
    tableau,
    moves: 0,
  }
}

function cloneState(s: GameState): GameState {
  return {
    stock: s.stock.map((c) => ({ ...c })),
    waste: s.waste.map((c) => ({ ...c })),
    foundations: s.foundations.map((p) => p.map((c) => ({ ...c }))),
    tableau: s.tableau.map((p) => p.map((c) => ({ ...c }))),
    moves: s.moves,
  }
}

/** Cards a selection would carry: waste/foundation tops move singly, a
 *  tableau selection carries the card and everything below it. */
function selectionCards(s: GameState, sel: Selection): PCard[] {
  switch (sel.kind) {
    case 'waste':
      return s.waste.length ? [s.waste[s.waste.length - 1]] : []
    case 'foundation': {
      const pile = s.foundations[sel.pile]
      return pile.length ? [pile[pile.length - 1]] : []
    }
    case 'tableau':
      return s.tableau[sel.col].slice(sel.index)
  }
}

function removeSelection(s: GameState, sel: Selection, count: number): void {
  switch (sel.kind) {
    case 'waste':
      s.waste.splice(s.waste.length - count, count)
      break
    case 'foundation':
      s.foundations[sel.pile].splice(s.foundations[sel.pile].length - count, count)
      break
    case 'tableau':
      s.tableau[sel.col].splice(sel.index, count)
      break
  }
}

function canDropOnTableau(cards: PCard[], dest: PCard[]): boolean {
  if (!cards.length) return false
  if (!dest.length) return cards[0].rank === 13
  const top = dest[dest.length - 1]
  return top.faceUp && top.rank === cards[0].rank + 1 && isRed(top) !== isRed(cards[0])
}

function canDropOnFoundation(card: PCard, pile: PCard[], pileIdx: number): boolean {
  if (card.suit !== SUITS[pileIdx]) return false
  if (!pile.length) return card.rank === 1
  return pile[pile.length - 1].rank + 1 === card.rank
}

/** Validate + apply a move on a clone; returns null when illegal. Also
 *  flips a newly exposed tableau card at the source column. */
function tryMove(s0: GameState, sel: Selection, dest: Dest): GameState | null {
  const cards = selectionCards(s0, sel)
  if (!cards.length) return null
  if (sel.kind === 'tableau' && dest.kind === 'tableau') {
    if (sel.col === dest.col) return null
    // Moving a whole column into an empty column changes nothing.
    if (!s0.tableau[dest.col].length && sel.index === 0) return null
  }
  if (dest.kind === 'foundation') {
    if (cards.length !== 1) return null
    if (!canDropOnFoundation(cards[0], s0.foundations[dest.pile], dest.pile)) return null
  } else if (!canDropOnTableau(cards, s0.tableau[dest.col])) {
    return null
  }
  const s = cloneState(s0)
  const moving = selectionCards(s, sel)
  removeSelection(s, sel, moving.length)
  if (dest.kind === 'foundation') s.foundations[dest.pile].push(...moving)
  else s.tableau[dest.col].push(...moving)
  if (sel.kind === 'tableau') {
    const col = s.tableau[sel.col]
    if (col.length && !col[col.length - 1].faceUp) {
      col[col.length - 1] = { ...col[col.length - 1], faceUp: true }
    }
  }
  s.moves += 1
  return s
}

export default function Klondike() {
  const [state, setState] = useState<GameState>(newGame)
  const [sel, setSel] = useState<Selection | null>(null)

  const won = state.foundations.reduce((n, p) => n + p.length, 0) === 52

  function restart() {
    setState(newGame())
    setSel(null)
  }

  /** Attempt the current selection against a destination. */
  function moveSel(dest: Dest): boolean {
    if (!sel) return false
    const ns = tryMove(state, sel, dest)
    if (!ns) return false
    setState(ns)
    setSel(null)
    return true
  }

  function clickStock() {
    setSel(null)
    setState((s) => {
      if (s.stock.length) {
        const ns = cloneState(s)
        const card = ns.stock[ns.stock.length - 1]
        ns.stock = ns.stock.slice(0, -1)
        ns.waste.push({ ...card, faceUp: true })
        ns.moves += 1
        return ns
      }
      if (s.waste.length) {
        const ns = cloneState(s)
        // Recycle: waste flips back over as the new stock, order preserved.
        ns.stock = ns.waste
          .slice()
          .reverse()
          .map((c) => ({ ...c, faceUp: false }))
        ns.waste = []
        ns.moves += 1
        return ns
      }
      return s
    })
  }

  function clickWaste() {
    if (!state.waste.length) return
    setSel(sel?.kind === 'waste' ? null : { kind: 'waste' })
  }

  function clickFoundation(pile: number) {
    if (sel && sel.kind !== 'foundation' && moveSel({ kind: 'foundation', pile })) return
    if (sel?.kind === 'foundation' && sel.pile === pile) setSel(null)
    else if (state.foundations[pile].length) setSel({ kind: 'foundation', pile })
    else setSel(null)
  }

  function clickTableauCard(col: number, index: number) {
    const card = state.tableau[col][index]
    if (!card.faceUp) return
    if (sel) {
      if (sel.kind === 'tableau' && sel.col === col) {
        setSel(sel.index === index ? null : { kind: 'tableau', col, index })
        return
      }
      if (moveSel({ kind: 'tableau', col })) return
    }
    setSel({ kind: 'tableau', col, index })
  }

  function clickEmptyTableau(col: number) {
    if (sel) moveSel({ kind: 'tableau', col })
  }

  /** Double-click: send a single top card to its foundation if it fits. */
  function autoFoundation(source: Selection) {
    const cards = selectionCards(state, source)
    if (cards.length !== 1) return
    const pile = SUITS.indexOf(cards[0].suit)
    const ns = tryMove(state, source, { kind: 'foundation', pile })
    if (ns) {
      setState(ns)
      setSel(null)
    }
  }

  function cardSelected(col: number, idx: number): boolean {
    return sel !== null && sel.kind === 'tableau' && sel.col === col && idx >= sel.index
  }

  const wasteTop = state.waste[state.waste.length - 1]

  return (
    <div className={styles.stage}>
      <div className={styles.gameBar}>
        <span className={styles.gameBarTitle}>Solitaire</span>
        <span className={styles.gameStatus}>Moves: {state.moves}</span>
        <span className={styles.gameBarSpacer} />
        <button type="button" className={styles.gameButton} onClick={restart}>
          New game
        </button>
      </div>
      <div className={styles.stageScroll}>
        <div className={k.board}>
          {won && <div className={styles.winBanner}>You win! All 52 cards are home. 🎉</div>}
          <div className={styles.feltRow}>
            {state.stock.length ? (
              <PlayingCard
                card={state.stock[state.stock.length - 1]}
                faceDown
                onClick={clickStock}
              />
            ) : (
              <PileSlot label={state.waste.length ? '↻' : undefined} onClick={clickStock} />
            )}
            {state.waste.length ? (
              <PlayingCard
                card={wasteTop}
                selected={sel?.kind === 'waste'}
                onClick={clickWaste}
                onDoubleClick={() => {
                  autoFoundation({ kind: 'waste' })
                }}
              />
            ) : (
              <PileSlot />
            )}
            <div className={k.gap} />
            {state.foundations.map((pile, i) =>
              pile.length ? (
                <PlayingCard
                  key={SUITS[i]}
                  card={pile[pile.length - 1]}
                  selected={sel?.kind === 'foundation' && sel.pile === i}
                  onClick={() => {
                    clickFoundation(i)
                  }}
                />
              ) : (
                <PileSlot
                  key={SUITS[i]}
                  label={SUIT_GLYPH[SUITS[i]]}
                  onClick={() => {
                    clickFoundation(i)
                  }}
                />
              ),
            )}
          </div>
          <div className={styles.feltRow}>
            {state.tableau.map((pile, col) => (
              <div key={col} className={styles.cardStack}>
                {pile.length === 0 ? (
                  <PileSlot
                    onClick={() => {
                      clickEmptyTableau(col)
                    }}
                  />
                ) : (
                  pile.map((card, idx) => (
                    <PlayingCard
                      key={card.id}
                      card={card}
                      faceDown={!card.faceUp}
                      selected={cardSelected(col, idx)}
                      onClick={
                        card.faceUp
                          ? () => {
                              clickTableauCard(col, idx)
                            }
                          : undefined
                      }
                      onDoubleClick={
                        card.faceUp && idx === pile.length - 1
                          ? () => {
                              autoFoundation({ kind: 'tableau', col, index: idx })
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
