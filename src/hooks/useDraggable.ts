import { useCallback, useRef, useState } from 'react'

export interface DragPosition {
  x: number
  y: number
}

export interface UseDraggableOptions {
  /** current position (controlled) */
  position: DragPosition
  /** called with the new position on every pointermove */
  onMove: (x: number, y: number) => void
  /** disable dragging (e.g. when maximized) */
  disabled?: boolean
  /** constrain the result inside the desktop bounds */
  constrain?: (x: number, y: number) => DragPosition
}

export interface DraggableHandlers {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void
  isDragging: boolean
}

/**
 * Pointer-Events based drag hook. The component using it calls
 * `onPointerDown` on the drag handle; movement is tracked with
 * pointer capture so fast drags never lose the pointer.
 */
export function useDraggable({
  position,
  onMove,
  disabled = false,
  constrain,
}: UseDraggableOptions): DraggableHandlers {
  const [isDragging, setIsDragging] = useState(false)
  const origin = useRef({ pointerX: 0, pointerY: 0, winX: 0, winY: 0 })

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled || event.button !== 0) return
      const target = event.currentTarget
      target.setPointerCapture(event.pointerId)
      origin.current = {
        pointerX: event.clientX,
        pointerY: event.clientY,
        winX: position.x,
        winY: position.y,
      }
      setIsDragging(true)

      const handleMove = (e: PointerEvent) => {
        const dx = e.clientX - origin.current.pointerX
        const dy = e.clientY - origin.current.pointerY
        let next = { x: origin.current.winX + dx, y: origin.current.winY + dy }
        if (constrain) next = constrain(next.x, next.y)
        onMove(next.x, next.y)
      }
      const handleUp = () => {
        setIsDragging(false)
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
        window.removeEventListener('pointercancel', handleUp)
        if (target.hasPointerCapture(event.pointerId)) {
          target.releasePointerCapture(event.pointerId)
        }
      }
      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
      window.addEventListener('pointercancel', handleUp)
    },
    [disabled, position.x, position.y, onMove, constrain],
  )

  return { onPointerDown, isDragging }
}
