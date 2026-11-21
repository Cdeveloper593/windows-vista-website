import { useState } from 'react'
import styles from './games.module.css'
import mj from './Mahjong.module.css'

const TILE_W = 44
const TILE_H = 56

interface Pos {
  x: number
  y: number
  layer: number
}

/**
 * Fixed 48-tile layout: a full 8x4 base, a 4x3 middle slab offset by half a
 * tile vertically, and a 2x2 cap. Coordinates are in tile units; fractional
 * values give the classic half-tile offsets.
 */
const LAYOUT: Pos[] = (() => {
  const out: Pos[] = []
  for (let y = 0; y < 4; y++) for (let x = 0; x < 8; x++) out.push({ x, y, layer: 0 })
  for (const y of [0.5, 1.5, 2.5]) for (let x = 2; x <= 5; x++) out.push({ x, y, layer: 1 })
  for (const y of [1, 2]) for (const x of [3, 4]) out.push({ x, y, layer: 2 })
  return out
})()

/** 24 distinct faces, each dealt exactly twice. */
const FACES = [
  '1筒',
  '2筒',
  '3筒',
  '4筒',
  '5筒',
  '6筒',
  '7筒',
  '8筒',
  '9筒',
  '東',
  '南',
  '西',
  '北',
  '中',
  '發',
  '白',
  '春',
  '夏',
  '秋',
  '冬',
  '梅',
  '蘭',
  '菊',
  '竹',
]

function faceColor(face: string): string {
  if (face === '中') return '#c01f28'
  if (face === '發') return '#1e7b34'
  if (face === '白') return '#1a5fb4'
  if (face.endsWith('筒')) return '#17557f'
  if ('東南西北'.includes(face)) return '#22333c'
  return '#7a3d99'
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface TileState {
  face: string
  removed: boolean
}

function deal(): TileState[] {
  const deck = shuffled(FACES.flatMap((f) => [f, f]))
  return LAYOUT.map((_, i) => ({ face: deck[i], removed: false }))
}

/**
 * A tile is free when nothing on a higher layer overlaps its rectangle, and
 * at least one long side (left or right) has no same-layer neighbour
 * touching it.
 */
function isFree(tiles: TileState[], idx: number): boolean {
  if (tiles[idx].removed) return false
  const t = LAYOUT[idx]
  let leftBlocked = false
  let rightBlocked = false
  for (let j = 0; j < LAYOUT.length; j++) {
    if (j === idx || tiles[j].removed) continue
    const o = LAYOUT[j]
    const overlapY = Math.abs(o.y - t.y) < 1
    if (!overlapY) continue
    if (o.layer > t.layer && Math.abs(o.x - t.x) < 1) return false
    if (o.layer === t.layer) {
      if (o.x < t.x && o.x + 1 >= t.x - 0.001) leftBlocked = true
      if (o.x > t.x && t.x + 1 >= o.x - 0.001) rightBlocked = true
    }
  }
  return !leftBlocked || !rightBlocked
}

function hasMoves(tiles: TileState[]): boolean {
  const seen = new Set<string>()
  for (let i = 0; i < tiles.length; i++) {
    if (!isFree(tiles, i)) continue
    if (seen.has(tiles[i].face)) return true
    seen.add(tiles[i].face)
  }
  return false
}

export default function Mahjong() {
  const [tiles, setTiles] = useState<TileState[]>(deal)
  const [selected, setSelected] = useState<number | null>(null)

  const remaining = tiles.filter((t) => !t.removed).length
  const won = remaining === 0
  const stuck = !won && !hasMoves(tiles)

  function reset() {
    setTiles(deal())
    setSelected(null)
  }

  function handleClick(i: number) {
    if (!isFree(tiles, i)) return
    if (selected === i) {
      setSelected(null)
      return
    }
    if (selected !== null && tiles[selected].face === tiles[i].face) {
      setTiles(tiles.map((t, idx) => (idx === i || idx === selected ? { ...t, removed: true } : t)))
      setSelected(null)
      return
    }
    setSelected(i)
  }

  function shuffleRemaining() {
    const faces = shuffled(tiles.filter((t) => !t.removed).map((t) => t.face))
    let k = 0
    setTiles(
      tiles.map((t) => {
        if (t.removed) return t
        const face = faces[k]
        k += 1
        return { ...t, face }
      }),
    )
    setSelected(null)
  }

  return (
    <div className={styles.stage}>
      <div className={styles.gameBar}>
        <span className={styles.gameBarTitle}>Mahjong Titans</span>
        <span className={styles.gameStatus}>
          {won ? 'Board cleared!' : `Tiles left: ${remaining} · match two free tiles`}
        </span>
        <span className={styles.gameBarSpacer} />
        <button type="button" className={styles.gameButton} onClick={reset}>
          New game
        </button>
      </div>
      <div className={styles.stageScroll}>
        <div className={mj.board} style={{ width: 8 * TILE_W + 12, height: 4 * TILE_H + 12 }}>
          {tiles.map((t, i) => {
            if (t.removed) return null
            const p = LAYOUT[i]
            const free = isFree(tiles, i)
            const cls = [mj.tile, free ? '' : mj.tileBlocked, selected === i ? mj.tileSelected : '']
              .filter(Boolean)
              .join(' ')
            return (
              <button
                key={i}
                type="button"
                className={cls}
                style={{
                  left: 6 + p.x * TILE_W - p.layer * 3,
                  top: 6 + p.y * TILE_H - p.layer * 3,
                  zIndex: p.layer * 100 + Math.round(p.y * 10) + Math.round(p.x),
                  color: faceColor(t.face),
                }}
                aria-label={`Tile ${t.face}${free ? '' : ' (blocked)'}`}
                onClick={() => {
                  handleClick(i)
                }}
              >
                {t.face}
              </button>
            )
          })}
        </div>
        {won && (
          <div className={styles.winBanner} style={{ marginTop: 12 }}>
            You win! The whole board is cleared.
          </div>
        )}
        {stuck && (
          <div className={mj.notice}>
            <span>No moves left.</span>
            <button type="button" className={styles.gameButton} onClick={shuffleRemaining}>
              Shuffle
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
