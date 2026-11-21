import { useEffect, useState } from 'react'
import shared from './games.module.css'
import styles from './hearts.module.css'
import { makeDeck, shuffle, SUIT_GLYPH, PlayingCard, type CardT, type Suit } from './cards'

/**
 * Simplified Hearts against three CPU players. No passing phase.
 * 2♣ leads the first trick; follow suit if you can; hearts can't be led
 * until broken. Each heart is 1 point, Q♠ is 13; taking all 26 shoots
 * the moon. First to 100 loses — lowest score wins.
 * Players: 0 = You (South), 1 = West, 2 = North, 3 = East.
 */

const NAMES = ['You', 'West', 'North', 'East']
const CPU_DELAY = 550
const TRICK_PAUSE = 950
const HAND_PAUSE = 3800

interface Play {
  player: number
  card: CardT
}

interface HandState {
  hands: CardT[][]
  trick: Play[]
  turn: number
  heartsBroken: boolean
  taken: CardT[][]
  tricksPlayed: number
}

type Phase = 'play' | 'handEnd' | 'gameEnd'

/** Trick-taking strength: Ace (rank 1) is high. */
function strength(card: CardT): number {
  return card.rank === 1 ? 14 : card.rank
}

const SUIT_ORDER: Record<Suit, number> = { clubs: 0, diamonds: 1, spades: 2, hearts: 3 }

function cmpCard(a: CardT, b: CardT): number {
  return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit] || strength(a) - strength(b)
}

function dealHand(): HandState {
  const deck = shuffle(makeDeck())
  const hands: CardT[][] = [[], [], [], []]
  deck.forEach((card, i) => hands[i % 4].push(card))
  for (const h of hands) h.sort(cmpCard)
  const leader = hands.findIndex((h) => h.some((c) => c.suit === 'clubs' && c.rank === 2))
  return {
    hands,
    trick: [],
    turn: leader < 0 ? 0 : leader,
    heartsBroken: false,
    taken: [[], [], [], []],
    tricksPlayed: 0,
  }
}

function legalCards(h: HandState, player: number): CardT[] {
  const hand = h.hands[player]
  if (h.trick.length === 0) {
    // Opening lead of the hand: the 2♣ holder must lead it.
    if (h.tricksPlayed === 0) {
      const two = hand.find((c) => c.suit === 'clubs' && c.rank === 2)
      if (two) return [two]
    }
    const nonHearts = hand.filter((c) => c.suit !== 'hearts')
    if (h.heartsBroken || nonHearts.length === 0) return hand
    return nonHearts
  }
  const led = h.trick[0].card.suit
  const follow = hand.filter((c) => c.suit === led)
  return follow.length > 0 ? follow : hand
}

function lowest(cards: CardT[]): CardT {
  return cards.reduce((a, b) => (strength(b) < strength(a) ? b : a))
}

function highest(cards: CardT[]): CardT {
  return cards.reduce((a, b) => (strength(b) > strength(a) ? b : a))
}

function cpuChoose(h: HandState, player: number): CardT {
  const legal = legalCards(h, player)
  if (legal.length === 1) return legal[0]
  if (h.trick.length === 0) {
    // Lead the lowest card of the longest available suit.
    const bySuit = new Map<Suit, CardT[]>()
    for (const c of legal) {
      const g = bySuit.get(c.suit)
      if (g) g.push(c)
      else bySuit.set(c.suit, [c])
    }
    let best: CardT[] = legal
    for (const g of bySuit.values()) if (g.length > best.length) best = g
    return lowest(best)
  }
  const led = h.trick[0].card.suit
  const follow = legal.filter((c) => c.suit === led)
  if (follow.length > 0) return lowest(follow)
  // Void in the led suit: dump the dangerous cards first.
  const queen = legal.find((c) => c.suit === 'spades' && c.rank === 12)
  if (queen) return queen
  const aceSpades = legal.find((c) => c.suit === 'spades' && c.rank === 1)
  if (aceSpades) return aceSpades
  const kingSpades = legal.find((c) => c.suit === 'spades' && c.rank === 13)
  if (kingSpades) return kingSpades
  const hearts = legal.filter((c) => c.suit === 'hearts')
  if (hearts.length > 0) return highest(hearts)
  return highest(legal)
}

function applyPlay(h: HandState, player: number, card: CardT): HandState {
  const hands = h.hands.map((hh, i) => (i === player ? hh.filter((c) => c.id !== card.id) : hh))
  const trick = [...h.trick, { player, card }]
  const heartsBroken =
    h.heartsBroken ||
    (card.suit === 'hearts' && h.trick.length > 0 && h.trick[0].card.suit !== 'hearts')
  return {
    ...h,
    hands,
    trick,
    heartsBroken,
    turn: trick.length < 4 ? (player + 1) % 4 : player,
  }
}

function trickWinner(trick: Play[]): Play {
  const led = trick[0].card.suit
  let win = trick[0]
  for (const p of trick) {
    if (p.card.suit === led && strength(p.card) > strength(win.card)) win = p
  }
  return win
}

function scoreCards(cards: CardT[]): number {
  let pts = 0
  for (const c of cards) {
    if (c.suit === 'hearts') pts += 1
    if (c.suit === 'spades' && c.rank === 12) pts += 13
  }
  return pts
}

export default function Hearts() {
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0])
  const [hand, setHand] = useState<HandState>(dealHand)
  const [phase, setPhase] = useState<Phase>('play')
  const [handSummary, setHandSummary] = useState('')
  const [lastWinner, setLastWinner] = useState<number | null>(null)

  function newGame() {
    setScores([0, 0, 0, 0])
    setHand(dealHand())
    setPhase('play')
    setHandSummary('')
    setLastWinner(null)
  }

  // CPU turns.
  useEffect(() => {
    if (phase !== 'play' || hand.trick.length >= 4 || hand.turn === 0) return
    const t = setTimeout(() => {
      setHand((h) => {
        if (h.trick.length >= 4 || h.turn === 0) return h
        return applyPlay(h, h.turn, cpuChoose(h, h.turn))
      })
    }, CPU_DELAY)
    return () => {
      clearTimeout(t)
    }
  }, [hand, phase])

  // Resolve a completed trick (and score the hand when it ends).
  useEffect(() => {
    if (phase !== 'play' || hand.trick.length < 4) return
    const t = setTimeout(() => {
      const winner = trickWinner(hand.trick).player
      const taken = hand.taken.map((pile, i) =>
        i === winner ? [...pile, ...hand.trick.map((p) => p.card)] : pile,
      )
      setLastWinner(winner)
      if (hand.hands.every((hh) => hh.length === 0)) {
        const pts = taken.map(scoreCards)
        const shooter = pts.findIndex((p) => p === 26)
        const applied = shooter >= 0 ? pts.map((_, i) => (i === shooter ? 0 : 26)) : pts
        const next = scores.map((s, i) => s + applied[i])
        const detail = NAMES.map((n, i) => `${n} +${applied[i]}`).join(' · ')
        setHandSummary(
          shooter >= 0 ? `${NAMES[shooter]} shot the moon! ${detail}` : `Hand over — ${detail}`,
        )
        setScores(next)
        setHand((h) => ({ ...h, trick: [], taken, tricksPlayed: h.tricksPlayed + 1 }))
        setPhase(next.some((s) => s >= 100) ? 'gameEnd' : 'handEnd')
      } else {
        setHand((h) => ({
          ...h,
          trick: [],
          taken,
          turn: winner,
          tricksPlayed: h.tricksPlayed + 1,
        }))
      }
    }, TRICK_PAUSE)
    return () => {
      clearTimeout(t)
    }
  }, [hand, scores, phase])

  // Deal the next hand after the summary has been shown.
  useEffect(() => {
    if (phase !== 'handEnd') return
    const t = setTimeout(() => {
      setHand(dealHand())
      setPhase('play')
      setLastWinner(null)
    }, HAND_PAUSE)
    return () => {
      clearTimeout(t)
    }
  }, [phase])

  const myTurn = phase === 'play' && hand.turn === 0 && hand.trick.length < 4
  const myLegal = myTurn ? legalCards(hand, 0) : []
  const winning = hand.trick.length > 0 ? trickWinner(hand.trick) : null

  let turnMsg: string
  if (phase === 'gameEnd') turnMsg = 'Game over'
  else if (phase === 'handEnd') turnMsg = 'Next hand coming up…'
  else if (hand.trick.length >= 4) turnMsg = 'Trick complete…'
  else if (hand.turn === 0)
    turnMsg =
      hand.trick.length === 0
        ? 'Your lead'
        : `Your turn — follow ${SUIT_GLYPH[hand.trick[0].card.suit]} if you can`
  else turnMsg = `${NAMES[hand.turn]} is playing…`

  const scoreLine = NAMES.map((n, i) => `${n} ${scores[i]}`).join(' · ')
  const gameWinner = phase === 'gameEnd' ? scores.indexOf(Math.min(...scores)) : -1

  function onHumanCard(card: CardT) {
    if (!myTurn) return
    if (!myLegal.some((c) => c.id === card.id)) return
    setHand((h) => applyPlay(h, 0, card))
  }

  function cpuBlock(player: number) {
    const cards = hand.hands[player]
    return (
      <div className={styles.cpuBlock}>
        <div
          className={`${styles.cpuLabel} ${
            phase === 'play' && hand.turn === player ? styles.cpuLabelActive : ''
          }`}
        >
          {NAMES[player]} · {cards.length}
        </div>
        <div className={styles.cpuHand}>
          {cards.map((c) => (
            <PlayingCard key={c.id} card={c} small faceDown />
          ))}
        </div>
      </div>
    )
  }

  const trickPos = [styles.pos0, styles.pos1, styles.pos2, styles.pos3]

  return (
    <div className={shared.stage}>
      <div className={shared.gameBar}>
        <span className={shared.gameBarTitle}>Hearts</span>
        <span className={shared.gameStatus}>
          {scoreLine} — {turnMsg}
          {hand.heartsBroken && phase === 'play' ? ' · ♥ broken' : ''}
        </span>
        <span className={shared.gameBarSpacer} />
        <button type="button" className={shared.gameButton} onClick={newGame}>
          New game
        </button>
      </div>
      {phase === 'gameEnd' ? (
        <div className={styles.bannerWrap}>
          <div className={shared.winBanner}>
            {gameWinner === 0
              ? `You win the game! Final scores — ${scoreLine}`
              : `${NAMES[gameWinner]} wins the game. Final scores — ${scoreLine}`}
          </div>
        </div>
      ) : phase === 'handEnd' ? (
        <div className={styles.bannerWrap}>
          <div className={shared.winBanner}>{handSummary}</div>
        </div>
      ) : null}
      <div className={styles.table}>
        {cpuBlock(2)}
        <div className={styles.middleRow}>
          {cpuBlock(1)}
          <div className={styles.trickArea}>
            {hand.trick.length === 0 && lastWinner !== null && phase === 'play' ? (
              <div className={styles.trickNote}>{NAMES[lastWinner]} won the last trick</div>
            ) : null}
            {hand.trick.map((p) => (
              <div key={p.player} className={`${styles.trickCard} ${trickPos[p.player]}`}>
                <PlayingCard
                  card={p.card}
                  small
                  selected={winning !== null && winning.player === p.player}
                />
              </div>
            ))}
          </div>
          {cpuBlock(3)}
        </div>
        <div className={styles.humanHand}>
          {hand.hands[0].map((card) => {
            const legal = myLegal.some((c) => c.id === card.id)
            const el = (
              <PlayingCard
                card={card}
                small
                onClick={
                  legal
                    ? () => {
                        onHumanCard(card)
                      }
                    : undefined
                }
              />
            )
            return myTurn && !legal ? (
              <div key={card.id} className={styles.dimmed}>
                {el}
              </div>
            ) : (
              <div key={card.id}>{el}</div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
