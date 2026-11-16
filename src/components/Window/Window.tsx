import type { CSSProperties, ReactNode } from 'react'
import { useWindowStore, type WindowId } from '../../store/windowStore'
import { useDraggable } from '../../hooks/useDraggable'
import { useResizable, type ResizeEdge } from '../../hooks/useResizable'
import { CloseGlyph, MaximizeGlyph, MinimizeGlyph, RestoreGlyph } from '../icons'
import styles from './Window.module.css'

const RESIZE_EDGES: ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

export interface WindowProps {
  id: WindowId
  /** accessible name, used for aria-label */
  title: string
  /** left side of the glass caption row (back/forward buttons…) */
  navControls?: ReactNode
  /** address/search band rendered under the caption row */
  toolbar?: ReactNode
  /** teal command bar rendered under the address/search band (Explorer) */
  commandBar?: ReactNode
  children: ReactNode
  bodyClassName?: string
}

export function Window({
  id,
  title,
  navControls,
  toolbar,
  commandBar,
  children,
  bodyClassName,
}: WindowProps) {
  const win = useWindowStore((s) => s.windows[id])
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  const finishClose = useWindowStore((s) => s.finishClose)
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow)
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize)
  const moveWindow = useWindowStore((s) => s.moveWindow)
  const resizeWindow = useWindowStore((s) => s.resizeWindow)

  const { onPointerDown } = useDraggable({
    position: { x: win.x, y: win.y },
    onMove: (x, y) => {
      moveWindow(id, x, y)
    },
    disabled: win.isMaximized,
    constrain: (x, y) => ({
      x: Math.min(Math.max(x, -win.width + 120), window.innerWidth - 80),
      y: Math.min(Math.max(y, 0), window.innerHeight - 90),
    }),
  })

  const { startResize } = useResizable({
    rect: { x: win.x, y: win.y, width: win.width, height: win.height },
    onResize: (rect) => {
      resizeWindow(id, rect)
    },
    disabled: win.isMaximized,
    minWidth: 380,
    minHeight: 280,
  })

  if (!win.isOpen && !win.isClosing) return null

  const style: CSSProperties = win.isMaximized
    ? {
        left: 0,
        top: 0,
        right: 0,
        bottom: 'var(--taskbar-height)',
        width: 'auto',
        height: 'auto',
        zIndex: 100 + win.zIndex,
      }
    : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: 100 + win.zIndex }

  const frameClasses = [
    styles.window,
    win.isClosing ? 'window-closing' : 'window-opening',
    win.isMinimized ? styles.minimized : '',
    win.isMaximized ? styles.maximized : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={frameClasses}
      style={style}
      role="dialog"
      aria-label={title}
      aria-modal="false"
      onPointerDown={() => {
        focusWindow(id)
      }}
      onAnimationEnd={(e) => {
        if (e.animationName === 'aero-window-out') finishClose(id)
      }}
    >
      {RESIZE_EDGES.map((edge) => (
        <div
          key={edge}
          className={`${styles.resizeHandle} ${styles[`edge-${edge}`] ?? ''}`}
          onPointerDown={startResize(edge)}
          aria-hidden="true"
        />
      ))}

      <div className={styles.inner}>
        {/* ---- glass caption row ---- */}
        <div
          className={styles.titlebar}
          onPointerDown={onPointerDown}
          onDoubleClick={() => {
            toggleMaximize(id)
          }}
        >
          <div
            className={styles.navControls}
            onPointerDown={(e) => {
              e.stopPropagation()
            }}
          >
            {navControls}
          </div>
          <div className={styles.dragSpacer} aria-hidden="true" />
          <div
            className={styles.captionButtons}
            onPointerDown={(e) => {
              e.stopPropagation()
            }}
          >
            <button
              type="button"
              className={styles.captionButton}
              aria-label="Minimize"
              onClick={() => {
                minimizeWindow(id)
              }}
            >
              <MinimizeGlyph size={13} />
            </button>
            <button
              type="button"
              className={styles.captionButton}
              aria-label={win.isMaximized ? 'Restore' : 'Maximize'}
              onClick={() => {
                toggleMaximize(id)
              }}
            >
              {win.isMaximized ? <RestoreGlyph size={13} /> : <MaximizeGlyph size={13} />}
            </button>
            <button
              type="button"
              className={`${styles.captionButton} ${styles.closeButton}`}
              aria-label="Close"
              onClick={() => {
                closeWindow(id)
              }}
            >
              <CloseGlyph size={15} />
            </button>
          </div>
        </div>

        {/* ---- address/search band ---- */}
        {toolbar ? <div className={styles.toolbar}>{toolbar}</div> : null}

        {/* ---- teal command bar ---- */}
        {commandBar ? <div className={styles.commandBar}>{commandBar}</div> : null}

        {/* ---- window body ---- */}
        <div className={`${styles.body} ${bodyClassName ?? ''}`}>{children}</div>
      </div>
    </section>
  )
}
