import { useEffect, useRef, useState } from 'react'
import styles from './games.module.css'

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const W = 640
const H = 420
const BALL_R = 9
const BALL_SPEED = 130
const POCKET_R = 16
const MAX_BALLS = 5
const SPAWN_MS = 2800
const INK_LIFE_MS = 4000
const MAX_SEGMENTS = 120

const BALL_COLORS = ['#e5484d', '#3d7dc4', '#46a758', '#f5c542']

interface Pocket {
  x: number
  y: number
  color: string
  name: string
}

const POCKETS: Pocket[] = [
  { x: POCKET_R + 2, y: H / 2, color: '#e5484d', name: 'red' },
  { x: W - POCKET_R - 2, y: H / 2, color: '#3d7dc4', name: 'blue' },
  { x: POCKET_R + 2, y: H - POCKET_R - 2, color: '#46a758', name: 'green' },
  { x: W - POCKET_R - 2, y: H - POCKET_R - 2, color: '#f5c542', name: 'yellow' },
]

interface Ball {
  x: number
  y: number
  vx: number
  vy: number
  color: string
}

interface Pt {
  x: number
  y: number
}

interface Stroke {
  points: Pt[]
  born: number
}

interface Flash {
  x: number
  y: number
  color: string
  until: number
  good: boolean
}

interface Sim {
  balls: Ball[]
  strokes: Stroke[]
  current: Stroke | null
  flashes: Flash[]
  lastSpawn: number
  score: number
  lives: number
  over: boolean
}

function freshSim(): Sim {
  return {
    balls: [],
    strokes: [],
    current: null,
    flashes: [],
    lastSpawn: 0,
    score: 0,
    lives: 3,
    over: false,
  }
}

function spawnBall(sim: Sim) {
  const color = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)]
  const angle = Math.PI / 2 + (Math.random() - 0.5) * 1.1 // mostly downward
  sim.balls.push({
    x: W / 2,
    y: BALL_R + 4,
    vx: Math.cos(angle) * BALL_SPEED,
    vy: Math.sin(angle) * BALL_SPEED,
    color,
  })
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function InkBall() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const simRef = useRef<Sim>(freshSim())
  const rafRef = useRef<number>(0)
  const [hud, setHud] = useState({ score: 0, lives: 3, over: false })

  const syncHud = () => {
    const s = simRef.current
    setHud((prev) =>
      prev.score === s.score && prev.lives === s.lives && prev.over === s.over
        ? prev
        : { score: s.score, lives: s.lives, over: s.over },
    )
  }

  const newGame = () => {
    simRef.current = freshSim()
    syncHud()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let last = performance.now()

    const step = (now: number) => {
      const sim = simRef.current
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      /* ---- update ---- */
      if (!sim.over) {
        if (sim.lastSpawn === 0) sim.lastSpawn = now
        if (now - sim.lastSpawn >= SPAWN_MS && sim.balls.length < MAX_BALLS) {
          spawnBall(sim)
          sim.lastSpawn = now
        }
      }

      // Prune faded strokes; cap total ink segments.
      sim.strokes = sim.strokes.filter((s) => now - s.born < INK_LIFE_MS)
      let segments = 0
      for (const s of sim.strokes) segments += Math.max(0, s.points.length - 1)
      while (segments > MAX_SEGMENTS && sim.strokes.length > 0) {
        const oldest = sim.strokes[0]
        if (oldest.points.length > 1) {
          oldest.points.shift()
          segments--
        } else {
          sim.strokes.shift()
        }
      }
      sim.flashes = sim.flashes.filter((f) => f.until > now)

      for (const ball of sim.balls) {
        ball.x += ball.vx * dt
        ball.y += ball.vy * dt

        // Ink collision: reflect across any segment the ball touches.
        const allStrokes = sim.current ? [...sim.strokes, sim.current] : sim.strokes
        for (const stroke of allStrokes) {
          const pts = stroke.points
          for (let i = 0; i + 1 < pts.length; i++) {
            const a = pts[i]
            const b = pts[i + 1]
            const abx = b.x - a.x
            const aby = b.y - a.y
            const lenSq = abx * abx + aby * aby
            if (lenSq === 0) continue
            let t = ((ball.x - a.x) * abx + (ball.y - a.y) * aby) / lenSq
            t = Math.max(0, Math.min(1, t))
            const cx = a.x + abx * t
            const cy = a.y + aby * t
            const dx = ball.x - cx
            const dy = ball.y - cy
            const dist = Math.hypot(dx, dy)
            const minDist = BALL_R + 2.5
            if (dist < minDist && dist > 0.0001) {
              // Unit normal of the segment.
              const len = Math.sqrt(lenSq)
              let nx = -aby / len
              let ny = abx / len
              // Normal should point toward the ball.
              if (dx * nx + dy * ny < 0) {
                nx = -nx
                ny = -ny
              }
              const dot = ball.vx * nx + ball.vy * ny
              if (dot < 0) {
                ball.vx -= 2 * dot * nx
                ball.vy -= 2 * dot * ny
              }
              ball.x = cx + nx * minDist
              ball.y = cy + ny * minDist
            }
          }
        }

        // Walls
        if (ball.x < BALL_R) {
          ball.x = BALL_R
          ball.vx = Math.abs(ball.vx)
        } else if (ball.x > W - BALL_R) {
          ball.x = W - BALL_R
          ball.vx = -Math.abs(ball.vx)
        }
        if (ball.y < BALL_R) {
          ball.y = BALL_R
          ball.vy = Math.abs(ball.vy)
        } else if (ball.y > H - BALL_R) {
          ball.y = H - BALL_R
          ball.vy = -Math.abs(ball.vy)
        }

        // Keep speed constant.
        const speed = Math.hypot(ball.vx, ball.vy)
        if (speed > 0.0001) {
          ball.vx = (ball.vx / speed) * BALL_SPEED
          ball.vy = (ball.vy / speed) * BALL_SPEED
        }
      }

      // Pockets
      if (!sim.over) {
        const survivors: Ball[] = []
        for (const ball of sim.balls) {
          let consumed = false
          for (const pocket of POCKETS) {
            const dist = Math.hypot(ball.x - pocket.x, ball.y - pocket.y)
            if (dist < POCKET_R) {
              consumed = true
              if (ball.color === pocket.color) {
                sim.score += 10
                sim.flashes.push({
                  x: pocket.x,
                  y: pocket.y,
                  color: pocket.color,
                  until: now + 450,
                  good: true,
                })
              } else {
                sim.lives -= 1
                sim.flashes.push({
                  x: pocket.x,
                  y: pocket.y,
                  color: '#e5484d',
                  until: now + 450,
                  good: false,
                })
                if (sim.lives <= 0) {
                  sim.lives = 0
                  sim.over = true
                }
              }
              break
            }
          }
          if (!consumed) survivors.push(ball)
        }
        sim.balls = survivors
      }

      /* ---- draw ---- */
      ctx.clearRect(0, 0, W, H)
      // Playfield
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#33465c')
      bg.addColorStop(1, '#26374a')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)
      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 32; x < W; x += 32) {
        ctx.moveTo(x + 0.5, 0)
        ctx.lineTo(x + 0.5, H)
      }
      for (let y = 32; y < H; y += 32) {
        ctx.moveTo(0, y + 0.5)
        ctx.lineTo(W, y + 0.5)
      }
      ctx.stroke()

      // Hatch at top centre
      ctx.fillStyle = '#101c28'
      ctx.fillRect(W / 2 - 22, 0, 44, 8)
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'
      ctx.strokeRect(W / 2 - 22 + 0.5, -0.5, 44, 8)

      // Pockets
      for (const pocket of POCKETS) {
        ctx.beginPath()
        ctx.arc(pocket.x, pocket.y, POCKET_R, 0, Math.PI * 2)
        ctx.fillStyle = '#131e29'
        ctx.fill()
        ctx.lineWidth = 4
        ctx.strokeStyle = pocket.color
        ctx.stroke()
      }

      // Pocket flashes
      for (const flash of sim.flashes) {
        const remaining = (flash.until - now) / 450
        ctx.beginPath()
        ctx.arc(flash.x, flash.y, POCKET_R + (1 - remaining) * 14, 0, Math.PI * 2)
        ctx.lineWidth = 3
        ctx.strokeStyle = flash.good ? 'rgba(120, 230, 150, 0.8)' : 'rgba(240, 90, 90, 0.8)'
        ctx.stroke()
      }

      // Ink strokes
      const drawStroke = (stroke: Stroke) => {
        if (stroke.points.length < 2) return
        const age = now - stroke.born
        const alpha = Math.max(0, 1 - age / INK_LIFE_MS)
        ctx.beginPath()
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
        }
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = `rgba(16, 22, 30, ${alpha.toFixed(3)})`
        ctx.stroke()
      }
      for (const stroke of sim.strokes) drawStroke(stroke)
      if (sim.current) drawStroke(sim.current)

      // Balls
      for (const ball of sim.balls) {
        const grad = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 1, ball.x, ball.y, BALL_R)
        grad.addColorStop(0, '#ffffff')
        grad.addColorStop(0.25, ball.color)
        grad.addColorStop(1, ball.color)
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        ctx.lineWidth = 1
        ctx.strokeStyle = 'rgba(0,0,0,0.35)'
        ctx.stroke()
      }

      // Game over overlay
      if (sim.over) {
        ctx.fillStyle = 'rgba(10, 18, 26, 0.62)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#f2f7fa'
        ctx.font = 'bold 34px "Segoe UI", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Game Over', W / 2, H / 2 - 12)
        ctx.font = '16px "Segoe UI", sans-serif'
        ctx.fillText(`Final score: ${sim.score}`, W / 2, H / 2 + 20)
        ctx.font = '13px "Segoe UI", sans-serif'
        ctx.fillText('Click “New game” to play again', W / 2, H / 2 + 44)
      }

      syncHud()
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  /* ---- pointer handling ---- */

  const toInternal = (e: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (simRef.current.over) return
    e.currentTarget.setPointerCapture(e.pointerId)
    simRef.current.current = { points: [toInternal(e)], born: performance.now() }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const sim = simRef.current
    if (!sim.current) return
    const p = toInternal(e)
    const lastPt = sim.current.points[sim.current.points.length - 1]
    if (Math.hypot(p.x - lastPt.x, p.y - lastPt.y) >= 3) {
      sim.current.points.push(p)
    }
  }

  const endStroke = () => {
    const sim = simRef.current
    if (sim.current) {
      if (sim.current.points.length >= 2) sim.strokes.push(sim.current)
      sim.current = null
    }
  }

  return (
    <div className={styles.stage}>
      <div className={styles.gameBar}>
        <span className={styles.gameBarTitle}>InkBall</span>
        <span className={styles.gameStatus}>
          Score: {hud.score} · Lives: {'♥'.repeat(hud.lives)}
          {'♡'.repeat(3 - hud.lives)}
          {hud.over ? ' · Game over' : ''}
        </span>
        <span className={styles.gameBarSpacer} />
        <button type="button" className={styles.gameButton} onClick={newGame}>
          New game
        </button>
      </div>
      <div className={styles.stageScroll}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{
            width: '100%',
            maxWidth: W,
            aspectRatio: `${W} / ${H}`,
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(20,40,50,0.35)',
            touchAction: 'none',
            cursor: 'crosshair',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
        />
        <div style={{ fontSize: 11, color: '#47616e', marginTop: 6, maxWidth: W }}>
          Draw ink lines to deflect each ball into the pocket of the same colour: a match scores
          +10, the wrong pocket costs a life. Ink fades after a few seconds.
        </div>
      </div>
    </div>
  )
}
