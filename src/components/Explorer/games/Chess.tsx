import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './games.module.css'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Color = 'w' | 'b'
type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'

interface Piece {
  type: PieceType
  color: Color
}

type Board = (Piece | null)[][]

interface CastlingRights {
  wK: boolean
  wQ: boolean
  bK: boolean
  bQ: boolean
}

interface Move {
  fromR: number
  fromC: number
  toR: number
  toC: number
  promotion?: PieceType
  enPassant?: boolean
  castle?: 'K' | 'Q'
}

interface GameState {
  board: Board
  turn: Color
  castling: CastlingRights
  /** Square a pawn may capture en passant onto, or null. */
  epTarget: { r: number; c: number } | null
}

const VALUES: Record<PieceType, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 }

const GLYPHS: Record<Color, Record<PieceType, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
}

const KNIGHT_JUMPS: [number, number][] = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
]
const KING_STEPS: [number, number][] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]
const BISHOP_DIRS: [number, number][] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
]
const ROOK_DIRS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8
}

function opponent(color: Color): Color {
  return color === 'w' ? 'b' : 'w'
}

/* ------------------------------------------------------------------ */
/* Setup                                                               */
/* ------------------------------------------------------------------ */

function initialState(): GameState {
  const backRank: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
  const board: Board = Array.from({ length: 8 }, () => Array<Piece | null>(8).fill(null))
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRank[c], color: 'b' }
    board[1][c] = { type: 'p', color: 'b' }
    board[6][c] = { type: 'p', color: 'w' }
    board[7][c] = { type: backRank[c], color: 'w' }
  }
  return {
    board,
    turn: 'w',
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    epTarget: null,
  }
}

/* ------------------------------------------------------------------ */
/* Attack detection                                                    */
/* ------------------------------------------------------------------ */

function isAttacked(board: Board, r: number, c: number, by: Color): boolean {
  // Pawns: a pawn of color `by` attacks one row ahead of itself, so a pawn
  // attacking (r, c) sits one row behind (r, c) from its perspective.
  const pawnRow = by === 'w' ? r + 1 : r - 1
  for (const dc of [-1, 1]) {
    const cc = c + dc
    if (inBounds(pawnRow, cc)) {
      const p = board[pawnRow][cc]
      if (p?.color === by && p.type === 'p') return true
    }
  }
  // Knights
  for (const [dr, dc] of KNIGHT_JUMPS) {
    const rr = r + dr
    const cc = c + dc
    if (inBounds(rr, cc)) {
      const p = board[rr][cc]
      if (p?.color === by && p.type === 'n') return true
    }
  }
  // King
  for (const [dr, dc] of KING_STEPS) {
    const rr = r + dr
    const cc = c + dc
    if (inBounds(rr, cc)) {
      const p = board[rr][cc]
      if (p?.color === by && p.type === 'k') return true
    }
  }
  // Sliders: bishops / queens on diagonals
  for (const [dr, dc] of BISHOP_DIRS) {
    let rr = r + dr
    let cc = c + dc
    while (inBounds(rr, cc)) {
      const p = board[rr][cc]
      if (p) {
        if (p.color === by && (p.type === 'b' || p.type === 'q')) return true
        break
      }
      rr += dr
      cc += dc
    }
  }
  // Sliders: rooks / queens on files and ranks
  for (const [dr, dc] of ROOK_DIRS) {
    let rr = r + dr
    let cc = c + dc
    while (inBounds(rr, cc)) {
      const p = board[rr][cc]
      if (p) {
        if (p.color === by && (p.type === 'r' || p.type === 'q')) return true
        break
      }
      rr += dr
      cc += dc
    }
  }
  return false
}

function findKing(board: Board, color: Color): { r: number; c: number } {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (p?.type === 'k' && p.color === color) return { r, c }
    }
  }
  return { r: -1, c: -1 }
}

function inCheck(board: Board, color: Color): boolean {
  const k = findKing(board, color)
  return isAttacked(board, k.r, k.c, opponent(color))
}

/* ------------------------------------------------------------------ */
/* Move generation                                                     */
/* ------------------------------------------------------------------ */

function pseudoMoves(state: GameState, r: number, c: number): Move[] {
  const { board } = state
  const piece = board[r][c]
  if (!piece) return []
  const moves: Move[] = []
  const push = (toR: number, toC: number, extra?: Partial<Move>) => {
    moves.push({ fromR: r, fromC: c, toR, toC, ...extra })
  }

  if (piece.type === 'p') {
    const dir = piece.color === 'w' ? -1 : 1
    const startRow = piece.color === 'w' ? 6 : 1
    const promoRow = piece.color === 'w' ? 0 : 7
    // Single push
    const oneR = r + dir
    if (inBounds(oneR, c) && !board[oneR][c]) {
      push(oneR, c, oneR === promoRow ? { promotion: 'q' } : undefined)
      // Double push
      const twoR = r + 2 * dir
      if (r === startRow && !board[twoR][c]) {
        push(twoR, c)
      }
    }
    // Captures + en passant
    for (const dc of [-1, 1]) {
      const tr = r + dir
      const tc = c + dc
      if (!inBounds(tr, tc)) continue
      const target = board[tr][tc]
      if (target && target.color !== piece.color) {
        push(tr, tc, tr === promoRow ? { promotion: 'q' } : undefined)
      } else if (!target && state.epTarget?.r === tr && state.epTarget.c === tc) {
        push(tr, tc, { enPassant: true })
      }
    }
    return moves
  }

  if (piece.type === 'n' || piece.type === 'k') {
    const steps = piece.type === 'n' ? KNIGHT_JUMPS : KING_STEPS
    for (const [dr, dc] of steps) {
      const tr = r + dr
      const tc = c + dc
      if (!inBounds(tr, tc)) continue
      const target = board[tr][tc]
      if (target?.color !== piece.color) push(tr, tc)
    }
    // Castling (king only, from its home square)
    if (piece.type === 'k') {
      const homeRow = piece.color === 'w' ? 7 : 0
      const enemy = opponent(piece.color)
      const rights = state.castling
      const kingSide = piece.color === 'w' ? rights.wK : rights.bK
      const queenSide = piece.color === 'w' ? rights.wQ : rights.bQ
      if (r === homeRow && c === 4 && !isAttacked(board, r, c, enemy)) {
        if (
          kingSide &&
          !board[homeRow][5] &&
          !board[homeRow][6] &&
          board[homeRow][7]?.type === 'r' &&
          board[homeRow][7]?.color === piece.color &&
          !isAttacked(board, homeRow, 5, enemy) &&
          !isAttacked(board, homeRow, 6, enemy)
        ) {
          push(homeRow, 6, { castle: 'K' })
        }
        if (
          queenSide &&
          !board[homeRow][3] &&
          !board[homeRow][2] &&
          !board[homeRow][1] &&
          board[homeRow][0]?.type === 'r' &&
          board[homeRow][0]?.color === piece.color &&
          !isAttacked(board, homeRow, 3, enemy) &&
          !isAttacked(board, homeRow, 2, enemy)
        ) {
          push(homeRow, 2, { castle: 'Q' })
        }
      }
    }
    return moves
  }

  // Sliding pieces
  const dirs = piece.type === 'b' ? BISHOP_DIRS : piece.type === 'r' ? ROOK_DIRS : KING_STEPS
  for (const [dr, dc] of dirs) {
    let tr = r + dr
    let tc = c + dc
    while (inBounds(tr, tc)) {
      const target = board[tr][tc]
      if (!target) {
        push(tr, tc)
      } else {
        if (target.color !== piece.color) push(tr, tc)
        break
      }
      tr += dr
      tc += dc
    }
  }
  return moves
}

function applyMove(state: GameState, move: Move): GameState {
  const board = state.board.map((row) => row.slice())
  const piece = board[move.fromR][move.fromC]
  if (!piece) return state

  const castling: CastlingRights = { ...state.castling }

  // En passant capture removes the pawn beside the mover.
  if (move.enPassant) {
    board[move.fromR][move.toC] = null
  }

  // Capturing a rook on its home square strips that castling right.
  const captured = board[move.toR][move.toC]
  if (captured?.type === 'r') {
    if (move.toR === 0 && move.toC === 0) castling.bQ = false
    if (move.toR === 0 && move.toC === 7) castling.bK = false
    if (move.toR === 7 && move.toC === 0) castling.wQ = false
    if (move.toR === 7 && move.toC === 7) castling.wK = false
  }

  board[move.toR][move.toC] = move.promotion ? { type: move.promotion, color: piece.color } : piece
  board[move.fromR][move.fromC] = null

  // Castling also moves the rook.
  if (move.castle) {
    const row = move.fromR
    if (move.castle === 'K') {
      board[row][5] = board[row][7]
      board[row][7] = null
    } else {
      board[row][3] = board[row][0]
      board[row][0] = null
    }
  }

  // Moving a king or rook strips castling rights.
  if (piece.type === 'k') {
    if (piece.color === 'w') {
      castling.wK = false
      castling.wQ = false
    } else {
      castling.bK = false
      castling.bQ = false
    }
  }
  if (piece.type === 'r') {
    if (move.fromR === 0 && move.fromC === 0) castling.bQ = false
    if (move.fromR === 0 && move.fromC === 7) castling.bK = false
    if (move.fromR === 7 && move.fromC === 0) castling.wQ = false
    if (move.fromR === 7 && move.fromC === 7) castling.wK = false
  }

  // A double pawn push opens an en passant target for one move.
  let epTarget: { r: number; c: number } | null = null
  if (piece.type === 'p' && Math.abs(move.toR - move.fromR) === 2) {
    epTarget = { r: (move.fromR + move.toR) / 2, c: move.fromC }
  }

  return { board, turn: opponent(state.turn), castling, epTarget }
}

function legalMoves(state: GameState, color: Color): Move[] {
  const result: Move[] = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c]
      if (p?.color !== color) continue
      for (const move of pseudoMoves(state, r, c)) {
        const next = applyMove(state, move)
        if (!inCheck(next.board, color)) result.push(move)
      }
    }
  }
  return result
}

/* ------------------------------------------------------------------ */
/* CPU: 2-ply minimax with alpha-beta, scored from Black's view        */
/* ------------------------------------------------------------------ */

function squareBonus(piece: Piece, r: number, c: number): number {
  const centre = 3.5 - Math.abs(3.5 - c) + (3.5 - Math.abs(3.5 - r))
  switch (piece.type) {
    case 'p': {
      const advanced = piece.color === 'w' ? 6 - r : r - 1
      return advanced * 6 + (c === 3 || c === 4 ? 6 : 0)
    }
    case 'n':
      return centre * 5
    case 'b':
      return centre * 3
    case 'q':
      return centre * 2
    case 'k': {
      const homeRow = piece.color === 'w' ? 7 : 0
      return r === homeRow ? 10 : 0
    }
    default:
      return 0
  }
}

function evaluate(board: Board): number {
  let score = 0
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (!p) continue
      const v = VALUES[p.type] + squareBonus(p, r, c)
      score += p.color === 'b' ? v : -v
    }
  }
  return score
}

function minimax(state: GameState, depth: number, alpha: number, beta: number): number {
  const moves = legalMoves(state, state.turn)
  if (moves.length === 0) {
    if (inCheck(state.board, state.turn)) {
      // Side to move is mated; prefer faster mates.
      return state.turn === 'b' ? -100000 - depth : 100000 + depth
    }
    return 0
  }
  if (depth === 0) return evaluate(state.board)

  if (state.turn === 'b') {
    let best = -Infinity
    for (const move of moves) {
      best = Math.max(best, minimax(applyMove(state, move), depth - 1, alpha, beta))
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  }
  let best = Infinity
  for (const move of moves) {
    best = Math.min(best, minimax(applyMove(state, move), depth - 1, alpha, beta))
    beta = Math.min(beta, best)
    if (beta <= alpha) break
  }
  return best
}

function bestBlackMove(state: GameState): Move | null {
  const moves = legalMoves(state, 'b')
  if (moves.length === 0) return null
  let bestMove: Move | null = null
  let bestScore = -Infinity
  let alpha = -Infinity
  const beta = Infinity
  for (const move of moves) {
    const score = minimax(applyMove(state, move), 1, alpha, beta)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
    alpha = Math.max(alpha, bestScore)
  }
  return bestMove
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const LIGHT = '#ecdcb9'
const DARK = '#a8b98a'
const SQ = 40

export default function Chess() {
  const [state, setState] = useState<GameState>(initialState)
  const [history, setHistory] = useState<GameState[]>([])
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null)
  const [lastMove, setLastMove] = useState<{
    fromR: number
    fromC: number
    toR: number
    toC: number
  } | null>(null)
  const timerRef = useRef<number | null>(null)

  const movesForTurn = useMemo(() => legalMoves(state, state.turn), [state])
  const checked = useMemo(() => inCheck(state.board, state.turn), [state])
  const gameOver = movesForTurn.length === 0
  const thinking = state.turn === 'b' && !gameOver

  const selectedMoves = useMemo(() => {
    if (!selected) return []
    return movesForTurn.filter((m) => m.fromR === selected.r && m.fromC === selected.c)
  }, [movesForTurn, selected])

  const capturedByWhite = useMemo(() => capturedPieces(state.board, 'w'), [state])
  const capturedByBlack = useMemo(() => capturedPieces(state.board, 'b'), [state])

  function capturedPieces(board: Board, capturer: Color): PieceType[] {
    const counts: Record<PieceType, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 0 }
    const victim = opponent(capturer)
    const taken: PieceType[] = []
    const remaining = { ...counts }
    for (const row of board) {
      for (const p of row) {
        if (p?.color === victim && p.type !== 'k') remaining[p.type]--
      }
    }
    ;(Object.keys(counts) as PieceType[]).forEach((t) => {
      for (let i = 0; i < remaining[t]; i++) taken.push(t)
    })
    taken.sort((a, b) => VALUES[b] - VALUES[a])
    return taken
  }

  const doMove = (move: Move) => {
    setHistory((h) => [...h, state])
    setState(applyMove(state, move))
    setLastMove(move)
    setSelected(null)
  }

  // CPU plays Black shortly after the human move.
  useEffect(() => {
    if (state.turn !== 'b' || gameOver) return
    timerRef.current = window.setTimeout(() => {
      const move = bestBlackMove(state)
      if (move) {
        setHistory((h) => [...h, state])
        setState(applyMove(state, move))
        setLastMove(move)
      }
    }, 350)
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [state, gameOver])

  const newGame = () => {
    setState(initialState())
    setHistory([])
    setSelected(null)
    setLastMove(null)
  }

  const undo = () => {
    if (thinking || history.length === 0) return
    // Take back the CPU reply and the human move together when possible.
    const steps = history.length >= 2 && state.turn === 'w' ? 2 : 1
    const target = history[history.length - steps]
    setHistory(history.slice(0, history.length - steps))
    setState(target)
    setSelected(null)
    setLastMove(null)
  }

  const onSquare = (r: number, c: number) => {
    if (state.turn !== 'w' || gameOver || thinking) return
    const target = selectedMoves.find((m) => m.toR === r && m.toC === c)
    if (selected && target) {
      doMove(target)
      return
    }
    const piece = state.board[r][c]
    if (piece?.color === 'w') {
      setSelected({ r, c })
    } else {
      setSelected(null)
    }
  }

  let status: string
  if (gameOver) {
    status = checked
      ? state.turn === 'w'
        ? 'Checkmate — you lose'
        : 'Checkmate — you win!'
      : 'Stalemate — draw'
  } else if (thinking) {
    status = 'Black is thinking…'
  } else if (state.turn === 'w') {
    status = checked ? 'Check! Your move' : 'Your move'
  } else {
    status = 'Black to move'
  }

  const isTarget = (r: number, c: number) => selectedMoves.some((m) => m.toR === r && m.toC === c)
  const isCaptureTarget = (r: number, c: number) =>
    selectedMoves.some((m) => m.toR === r && m.toC === c) &&
    (state.board[r][c] !== null ||
      selectedMoves.some((m) => m.toR === r && m.toC === c && m.enPassant))

  return (
    <div className={styles.stage}>
      <div className={styles.gameBar}>
        <span className={styles.gameBarTitle}>Chess Titans</span>
        <span className={styles.gameStatus}>{status}</span>
        <span className={styles.gameBarSpacer} />
        <button
          type="button"
          className={styles.gameButton}
          onClick={undo}
          disabled={history.length === 0 || thinking}
        >
          Undo
        </button>
        <button type="button" className={styles.gameButton} onClick={newGame}>
          New game
        </button>
      </div>
      <div className={styles.stageScroll}>
        {(gameOver && checked && state.turn === 'b') || (gameOver && !checked) ? (
          <div className={styles.winBanner} style={{ marginBottom: 8 }}>
            {!checked ? 'Draw by stalemate' : 'Checkmate — you win!'}
          </div>
        ) : null}
        <div
          style={{ fontSize: 16, minHeight: 4, letterSpacing: 1 }}
          aria-label="Pieces Black has captured"
        >
          {capturedByBlack.map((t, i) => (
            <span key={i} style={{ color: '#f4f4f4', textShadow: '0 0 2px #333, 0 1px 1px #333' }}>
              {GLYPHS.w[t]}
            </span>
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(8, ${SQ}px)`,
            gridTemplateRows: `repeat(8, ${SQ}px)`,
            border: '3px solid #5d7350',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(20,40,30,0.35)',
            userSelect: 'none',
          }}
        >
          {state.board.map((row, r) =>
            row.map((piece, c) => {
              const isLight = (r + c) % 2 === 0
              const isSel = selected !== null && selected.r === r && selected.c === c
              const isLast =
                lastMove &&
                ((lastMove.fromR === r && lastMove.fromC === c) ||
                  (lastMove.toR === r && lastMove.toC === c))
              const target = isTarget(r, c)
              const capture = target && isCaptureTarget(r, c)
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  aria-label={`Square ${'abcdefgh'[c]}${8 - r}${piece ? `, ${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}` : ''}`}
                  onClick={() => {
                    onSquare(r, c)
                  }}
                  style={{
                    width: SQ,
                    height: SQ,
                    padding: 0,
                    border: 'none',
                    cursor: piece?.color === 'w' || target ? 'pointer' : 'default',
                    background: isSel
                      ? '#f2d06b'
                      : isLast
                        ? isLight
                          ? '#e8d48a'
                          : '#b3bd6d'
                        : isLight
                          ? LIGHT
                          : DARK,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    lineHeight: 1,
                  }}
                >
                  {piece && (
                    <span
                      style={
                        piece.color === 'w'
                          ? {
                              color: '#fafafa',
                              textShadow:
                                '0 0 2px #222, 1px 0 0 #222, -1px 0 0 #222, 0 1px 0 #222, 0 -1px 0 #222, 0 2px 3px rgba(0,0,0,0.45)',
                            }
                          : {
                              color: '#191919',
                              textShadow:
                                '0 0 2px rgba(255,255,255,0.35), 0 2px 3px rgba(0,0,0,0.5)',
                            }
                      }
                    >
                      {GLYPHS[piece.color][piece.type]}
                    </span>
                  )}
                  {target && !capture && (
                    <span
                      style={{
                        position: 'absolute',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: 'rgba(40, 70, 40, 0.35)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  {capture && (
                    <span
                      style={{
                        position: 'absolute',
                        inset: 2,
                        borderRadius: '50%',
                        border: '3px solid rgba(160, 40, 30, 0.55)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </button>
              )
            }),
          )}
        </div>
        <div
          style={{ fontSize: 16, minHeight: 4, letterSpacing: 1 }}
          aria-label="Pieces you have captured"
        >
          {capturedByWhite.map((t, i) => (
            <span key={i} style={{ color: '#191919', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
              {GLYPHS.b[t]}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#47616e', marginTop: 4 }}>
          You play White. Click a piece, then a highlighted square. Promotion is automatic to queen.
        </div>
      </div>
    </div>
  )
}
