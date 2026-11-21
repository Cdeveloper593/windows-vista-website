import { useEffect, useRef, useState } from 'react'
import styles from './games.module.css'
import pb from './Purble.module.css'

/** The 8 pair shapes, drawn as filled SVG paths in a 40x40 box. */
const SHAPES: { name: string; color: string; path: string }[] = [
  { name: 'Circle', color: '#e5484d', path: 'M8 20 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 Z' },
  { name: 'Square', color: '#3e63dd', path: 'M9 9 h22 v22 h-22 Z' },
  { name: 'Triangle', color: '#46a758', path: 'M20 7 L33 31 L7 31 Z' },
  {
    name: 'Star',
    color: '#f5a623',
    path: 'M20 5 L24 15.5 L35 16 L26.5 23.5 L29.5 34.5 L20 28 L10.5 34.5 L13.5 23.5 L5 16 L16 15.5 Z',
  },
  {
    name: 'Heart',
    color: '#d6409f',
    path: 'M20 33 C8 24 6 15 12 10 C16 7 20 10 20 14 C20 10 24 7 28 10 C34 15 32 24 20 33 Z',
  },
  { name: 'Diamond', color: '#12a594', path: 'M20 5 L32 20 L20 35 L8 20 Z' },
  {
    // Two offset circles; fillRule="evenodd" punches the inner one out.
    name: 'Crescent',
    color: '#8e4ec6',
    path: 'M5 20 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 Z M14.5 20 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0 Z',
  },
  {
    name: 'Cross',
    color: '#f76b15',
    path: 'M15 6 h10 v9 h9 v10 h-9 v9 h-10 v-9 h-9 v-10 h9 Z',
  },
]

function ShapeGlyph({ index }: { index: number }) {
  const s = SHAPES[index]
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
      <path d={s.path} fill={s.color} fillRule="evenodd" />
    </svg>
  )
}

/** Face-down back: concentric white rings on the purple card. */
function BackGlyph() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <circle
        cx="20"
        cy="20"
        r="13"
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="2.5"
      />
      <circle
        cx="20"
        cy="20"
        r="7.5"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2.5"
      />
      <circle cx="20" cy="20" r="2.6" fill="rgba(255,255,255,0.9)" />
    </svg>
  )
}

interface PCard {
  shape: number
  matched: boolean
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function deal(): PCard[] {
  return shuffled(SHAPES.flatMap((_, s) => [s, s])).map((shape) => ({ shape, matched: false }))
}

export default function Purble() {
  const [cards, setCards] = useState<PCard[]>(deal)
  const [up, setUp] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const lockRef = useRef(false)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(
    () => () => {
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const pairsFound = cards.filter((c) => c.matched).length / 2
  const won = pairsFound === SHAPES.length

  function reset() {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current)
    lockRef.current = false
    setCards(deal())
    setUp([])
    setMoves(0)
  }

  function flip(i: number) {
    if (lockRef.current || cards[i].matched || up.includes(i)) return
    const nextUp = [...up, i]
    setUp(nextUp)
    if (nextUp.length < 2) return
    setMoves((m) => m + 1)
    const [a, b] = nextUp
    if (cards[a].shape === cards[b].shape) {
      setCards(cards.map((c, idx) => (idx === a || idx === b ? { ...c, matched: true } : c)))
      setUp([])
    } else {
      lockRef.current = true
      timerRef.current = window.setTimeout(() => {
        setUp([])
        lockRef.current = false
      }, 700)
    }
  }

  return (
    <div className={styles.stage}>
      <div className={styles.gameBar}>
        <span className={styles.gameBarTitle}>Purble Place · Pairs</span>
        <span className={styles.gameStatus}>
          {won ? 'All pairs found!' : `Moves: ${moves} · Pairs: ${pairsFound} of ${SHAPES.length}`}
        </span>
        <span className={styles.gameBarSpacer} />
        <button type="button" className={styles.gameButton} onClick={reset}>
          New game
        </button>
      </div>
      <div className={styles.stageScroll}>
        <div className={pb.grid}>
          {cards.map((c, i) => {
            const faceUp = c.matched || up.includes(i)
            const cls = [
              pb.card,
              c.matched ? pb.cardMatched : faceUp ? pb.cardUp : pb.cardDown,
            ].join(' ')
            return (
              <button
                key={i}
                type="button"
                className={cls}
                aria-label={faceUp ? SHAPES[c.shape].name : 'Face-down card'}
                onClick={() => {
                  flip(i)
                }}
              >
                {faceUp ? <ShapeGlyph index={c.shape} /> : <BackGlyph />}
              </button>
            )
          })}
        </div>
        {won && (
          <div className={styles.winBanner} style={{ marginTop: 12 }}>
            You win! All 8 pairs matched in {moves} moves.
          </div>
        )}
      </div>
    </div>
  )
}
