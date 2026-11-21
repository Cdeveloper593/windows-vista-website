/**
 * Stylised game artwork for the Games Explorer tiles. Vista's real box art
 * isn't part of the sliced icon sheet, so each game gets a small glossy
 * glyph in the same visual language as the shell icons.
 */

interface ArtProps {
  size?: number
}

function Frame({
  size = 48,
  children,
  label,
}: ArtProps & { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label={label}>
      {children}
    </svg>
  )
}

export function ChessArt({ size }: ArtProps) {
  return (
    <Frame size={size} label="Chess Titans">
      <defs>
        <linearGradient id="ga-chess" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a4632" />
          <stop offset="100%" stopColor="#241a10" />
        </linearGradient>
      </defs>
      <rect x="5" y="38" width="38" height="5" rx="2" fill="#17100a" />
      <path
        d="M33 38c-1-4-4-5-6-6 3-1 5-3 6-6l4 2c.6-2 .4-4-.5-6L32 15l-3-5c-4 1-7 4-8 8l-4-2c-1 4 1 7 4 9-1 3-4 5-7 6l9 3c3 1 5 2 6 4z"
        fill="url(#ga-chess)"
        stroke="#0d0906"
        strokeWidth="1"
      />
      <circle cx="28.5" cy="17.5" r="1.6" fill="#d8c9a8" />
    </Frame>
  )
}

export function MahjongArt({ size }: ArtProps) {
  return (
    <Frame size={size} label="Mahjong Titans">
      <rect x="12" y="5" width="26" height="38" rx="4" fill="#b9c4a8" />
      <rect x="10" y="3" width="26" height="38" rx="4" fill="#f4efdd" stroke="#9aa58c" />
      <circle cx="23" cy="14" r="4.4" fill="none" stroke="#c03a2e" strokeWidth="2" />
      <circle cx="23" cy="14" r="1.4" fill="#c03a2e" />
      <path
        d="M16 26h14M16 31h14M23 24v9"
        stroke="#2e6b34"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </Frame>
  )
}

export function MinesweeperArt({ size }: ArtProps) {
  const spikes = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4)
  return (
    <Frame size={size} label="Minesweeper">
      {spikes.map((a, i) => (
        <line
          key={i}
          x1={24 - Math.cos(a) * 4}
          y1={24 - Math.sin(a) * 4}
          x2={24 + Math.cos(a) * 17}
          y2={24 + Math.sin(a) * 17}
          stroke="#20242a"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
      ))}
      <circle cx="24" cy="24" r="11.5" fill="#262b33" />
      <circle cx="20" cy="19.5" r="3.6" fill="#8d99a8" opacity="0.85" />
    </Frame>
  )
}

function CardArt({
  size,
  rank,
  suit,
  color,
  label,
}: ArtProps & { rank: string; suit: 'spade' | 'heart' | 'club'; color: string; label: string }) {
  const suitPath =
    suit === 'spade'
      ? 'M24 17c3 5 8 7.6 8 11a4.6 4.6 0 0 1-8 3c.4 2 1.2 3.4 2.4 4.4h-4.8c1.2-1 2-2.4 2.4-4.4a4.6 4.6 0 0 1-8-3c0-3.4 5-6 8-11z'
      : suit === 'heart'
        ? 'M24 36S13 27.4 13 20.6A5.9 5.9 0 0 1 24 16a5.9 5.9 0 0 1 11 4.6C35 27.4 24 36 24 36z'
        : 'M24 15a4.8 4.8 0 0 1 1 9.5A4.8 4.8 0 1 1 27 34c-.6 1-1.4 1.8-2.4 2.4h-1.2C22.4 35.8 21.6 35 21 34a4.8 4.8 0 1 1 2-9.5A4.8 4.8 0 0 1 24 15z'
  return (
    <Frame size={size} label={label}>
      <rect x="13" y="6" width="24" height="36" rx="3" fill="#e8e4da" transform="rotate(7 25 24)" />
      <rect x="11" y="5" width="24" height="36" rx="3" fill="#fdfcf8" stroke="#b9bec4" />
      <text x="15" y="16" fontSize="10" fontWeight="700" fill={color} fontFamily="Georgia, serif">
        {rank}
      </text>
      <path d={suitPath} fill={color} transform="translate(-3.5 -1) scale(0.92)" />
    </Frame>
  )
}

export function SolitaireArt({ size }: ArtProps) {
  return <CardArt size={size} rank="A" suit="spade" color="#1d2733" label="Solitaire" />
}

export function SpiderArt({ size }: ArtProps) {
  return <CardArt size={size} rank="A" suit="heart" color="#b3313f" label="Spider Solitaire" />
}

export function FreeCellArt({ size }: ArtProps) {
  return <CardArt size={size} rank="K" suit="club" color="#1d2733" label="FreeCell" />
}

export function HeartsArt({ size }: ArtProps) {
  return (
    <Frame size={size} label="Hearts">
      <path
        d="M24 41S7 29.6 7 18.9A9.4 9.4 0 0 1 24 12a9.4 9.4 0 0 1 17 6.9C41 29.6 24 41 24 41z"
        fill="#c93a4b"
        stroke="#8e2432"
      />
      <path
        d="M15 15a7 7 0 0 1 6-3.4"
        fill="none"
        stroke="#f2a7b1"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </Frame>
  )
}

export function PurbleArt({ size }: ArtProps) {
  return (
    <Frame size={size} label="Purble Place">
      <circle cx="24" cy="25" r="16" fill="#8a5fc0" stroke="#5f3d8f" strokeWidth="1.4" />
      <circle cx="18.5" cy="22" r="2.4" fill="#ffffff" />
      <circle cx="29.5" cy="22" r="2.4" fill="#ffffff" />
      <circle cx="18.5" cy="22.6" r="1.2" fill="#2b1c40" />
      <circle cx="29.5" cy="22.6" r="1.2" fill="#2b1c40" />
      <path
        d="M18 30c2 2.6 4 3.6 6 3.6S28 32.6 30 30"
        fill="none"
        stroke="#2b1c40"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M24 4l2.2 4.4L31 9l-3.5 3.4.8 4.8L24 14.9l-4.3 2.3.8-4.8L17 9l4.8-.6z"
        fill="#f2c230"
        stroke="#c79a1d"
        strokeWidth="0.8"
      />
    </Frame>
  )
}

export function InkBallArt({ size }: ArtProps) {
  return (
    <Frame size={size} label="InkBall">
      <path
        d="M8 38c6-1 9-4 11-9"
        fill="none"
        stroke="#3366cc"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="31" cy="29" r="9" fill="#3366cc" />
      <circle cx="28" cy="26" r="3" fill="#9db9e8" />
      <path d="M36 6l6 2-8 14-4 1 1-4z" fill="#f2c230" stroke="#b98f1c" />
      <path d="M36 6l6 2-2.4 4.2L34 8.4z" fill="#e4572e" />
    </Frame>
  )
}
