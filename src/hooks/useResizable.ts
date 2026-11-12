import { useCallback, useRef } from 'react'

export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export interface WindowRect {
  x: number
  y: number
  width: number
  height: number
}

export interface UseResizableOptions {
  rect: WindowRect
  onResize: (rect: WindowRect) => void
  disabled?: boolean
  minWidth?: number
  minHeight?: number
}

const MIN_WIDTH = 320
const MIN_HEIGHT = 240

/**
 * Pointer-Events based resize hook. Returns a factory that creates
 * pointer-down handlers for the 8 resize handles (4 edges + 4 corners).
 */
export function useResizable({
  rect,
  onResize,
  disabled = false,
  minWidth = MIN_WIDTH,
  minHeight = MIN_HEIGHT,
}: UseResizableOptions) {
  const origin = useRef({ px: 0, py: 0, rect })

  const startResize = useCallback(
    (edge: ResizeEdge) => (event: React.PointerEvent<HTMLElement>) => {
      if (disabled || event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()
      origin.current = { px: event.clientX, py: event.clientY, rect }

      const handleMove = (e: PointerEvent) => {
        const dx = e.clientX - origin.current.px
        const dy = e.clientY - origin.current.py
        const start = origin.current.rect
        let { x, y, width, height } = start

        if (edge.includes('e')) width = Math.max(minWidth, start.width + dx)
        if (edge.includes('s')) height = Math.max(minHeight, start.height + dy)
        if (edge.includes('w')) {
          const nextWidth = Math.max(minWidth, start.width - dx)
          x = start.x + (start.width - nextWidth)
          width = nextWidth
        }
        if (edge.includes('n')) {
          const nextHeight = Math.max(minHeight, start.height - dy)
          y = start.y + (start.height - nextHeight)
          height = nextHeight
        }
        onResize({ x, y, width, height })
      }
      const handleUp = () => {
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
        window.removeEventListener('pointercancel', handleUp)
      }
      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
      window.addEventListener('pointercancel', handleUp)
    },
    [disabled, rect, onResize, minWidth, minHeight],
  )

  return { startResize }
}
