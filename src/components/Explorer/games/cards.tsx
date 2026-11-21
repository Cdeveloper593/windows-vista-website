import styles from './games.module.css'

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs'

export interface CardT {
  id: string
  suit: Suit
  rank: number // 1 (Ace) .. 13 (King)
}

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
export const SUIT_GLYPH: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
}
export const RANK_LABEL: Record<number, string> = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K',
}

export function rankLabel(rank: number): string {
  return RANK_LABEL[rank] ?? String(rank)
}

export function isRed(card: CardT): boolean {
  return card.suit === 'hearts' || card.suit === 'diamonds'
}

let uid = 0
export function makeCard(suit: Suit, rank: number): CardT {
  uid += 1
  return { id: `${suit}-${rank}-${uid}`, suit, rank }
}

/** Standard 52-card deck, unshuffled. */
export function makeDeck(): CardT[] {
  const deck: CardT[] = []
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) deck.push(makeCard(suit, rank))
  }
  return deck
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface PlayingCardProps {
  card: CardT
  faceDown?: boolean
  selected?: boolean
  small?: boolean
  onClick?: () => void
  onDoubleClick?: () => void
}

/** A clean CSS playing card: corner indices + one large centre pip. */
export function PlayingCard({
  card,
  faceDown = false,
  selected = false,
  small = false,
  onClick,
  onDoubleClick,
}: PlayingCardProps) {
  const cls = [
    styles.pcard,
    small ? styles.pcardSmall : '',
    faceDown ? styles.pcardDown : '',
    !faceDown && isRed(card) ? styles.pcardRed : '',
    selected ? styles.pcardSelected : '',
  ]
    .filter(Boolean)
    .join(' ')
  if (faceDown) {
    return (
      <div
        className={cls}
        role={onClick ? 'button' : undefined}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        aria-label="Face-down card"
      >
        <div className={styles.pcardBackPattern} />
      </div>
    )
  }
  const glyph = SUIT_GLYPH[card.suit]
  const label = rankLabel(card.rank)
  return (
    <div
      className={cls}
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      aria-label={`${label} of ${card.suit}`}
    >
      <span className={styles.pcardCornerTop}>
        <span className={styles.pcardRank}>{label}</span>
        <span className={styles.pcardSuitSmall}>{glyph}</span>
      </span>
      <span className={styles.pcardCenter}>{glyph}</span>
      <span className={styles.pcardCornerBottom}>
        <span className={styles.pcardRank}>{label}</span>
        <span className={styles.pcardSuitSmall}>{glyph}</span>
      </span>
    </div>
  )
}

/** Empty pile outline with an optional label. */
export function PileSlot({
  label,
  small = false,
  onClick,
  children,
}: {
  label?: string
  small?: boolean
  onClick?: () => void
  children?: React.ReactNode
}) {
  return (
    <div
      className={`${styles.pileSlot} ${small ? styles.pileSlotSmall : ''}`}
      role={onClick ? 'button' : undefined}
      onClick={onClick}
    >
      {children ?? (label ? <span className={styles.pileLabel}>{label}</span> : null)}
    </div>
  )
}
