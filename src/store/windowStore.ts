import { create } from 'zustand'

export type WindowId = 'welcome' | 'recycle-bin' | 'games' | 'file-explorer' | 'internet-explorer'

export interface WindowEntry {
  id: WindowId
  title: string
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  isClosing: boolean
  zIndex: number
  /** px from the left edge of the desktop area */
  x: number
  /** px from the top edge of the desktop area */
  y: number
  width: number
  height: number
}

interface WindowManagerState {
  windows: Record<WindowId, WindowEntry>
  /** monotonically increasing counter used to assign z-indexes */
  topZ: number
  startMenuOpen: boolean

  toggleStartMenu: () => void
  setStartMenuOpen: (open: boolean) => void

  openWindow: (id: WindowId) => void
  closeWindow: (id: WindowId) => void
  finishClose: (id: WindowId) => void
  minimizeWindow: (id: WindowId) => void
  toggleMaximize: (id: WindowId) => void
  restoreWindow: (id: WindowId) => void
  focusWindow: (id: WindowId) => void
  /** Taskbar button behaviour: minimize if focused/normal, else restore+focus */
  toggleTaskbarWindow: (id: WindowId) => void
  moveWindow: (id: WindowId, x: number, y: number) => void
  resizeWindow: (
    id: WindowId,
    patch: Partial<Pick<WindowEntry, 'x' | 'y' | 'width' | 'height'>>,
  ) => void
}

const WELCOME_CLOSE = { isClosing: true } as const

export function createInitialWindows(): Record<WindowId, WindowEntry> {
  return {
    welcome: {
      id: 'welcome',
      title: 'Welcome Center',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      isClosing: false,
      zIndex: 2,
      // 2x the reference screenshot placement (reference: x=111, y=84, w=403, h=326)
      x: 222,
      y: 168,
      width: 806,
      height: 652,
    },
    'recycle-bin': {
      id: 'recycle-bin',
      title: 'Recycle Bin',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      isClosing: false,
      zIndex: 1,
      x: 260,
      y: 190,
      width: 620,
      height: 420,
    },
    games: {
      id: 'games',
      title: 'Games',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      isClosing: false,
      zIndex: 0,
      x: 240,
      y: 130,
      width: 820,
      height: 600,
    },
    'file-explorer': {
      id: 'file-explorer',
      title: 'Computer',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      isClosing: false,
      zIndex: 0,
      x: 320,
      y: 210,
      width: 700,
      height: 500,
    },
    'internet-explorer': {
      id: 'internet-explorer',
      title: 'Internet Explorer',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      isClosing: false,
      zIndex: 0,
      x: 180,
      y: 90,
      width: 900,
      height: 600,
    },
  }
}

export const useWindowStore = create<WindowManagerState>((set, get) => ({
  windows: createInitialWindows(),
  topZ: 2,
  startMenuOpen: true,

  toggleStartMenu: () => {
    set((s) => ({ startMenuOpen: !s.startMenuOpen }))
  },
  setStartMenuOpen: (open) => {
    set({ startMenuOpen: open })
  },

  openWindow: (id) => {
    set((s) => {
      const topZ = s.topZ + 1
      return {
        topZ,
        windows: {
          ...s.windows,
          [id]: {
            ...s.windows[id],
            isOpen: true,
            isMinimized: false,
            isClosing: false,
            zIndex: topZ,
          },
        },
      }
    })
  },

  closeWindow: (id) => {
    set((s) => ({
      windows: { ...s.windows, [id]: { ...s.windows[id], ...WELCOME_CLOSE } },
    }))
  },

  finishClose: (id) => {
    set((s) => ({
      windows: {
        ...s.windows,
        [id]: { ...s.windows[id], isOpen: false, isClosing: false },
      },
    }))
  },

  minimizeWindow: (id) => {
    set((s) => ({
      windows: {
        ...s.windows,
        [id]: { ...s.windows[id], isMinimized: true },
      },
    }))
  },

  toggleMaximize: (id) => {
    set((s) => {
      const w = s.windows[id]
      return {
        windows: {
          ...s.windows,
          [id]: { ...w, isMaximized: !w.isMaximized },
        },
      }
    })
  },

  restoreWindow: (id) => {
    set((s) => ({
      windows: {
        ...s.windows,
        [id]: { ...s.windows[id], isMinimized: false },
      },
    }))
  },

  focusWindow: (id) => {
    set((s) => {
      const w = s.windows[id]
      if (w.zIndex === s.topZ) return s
      const topZ = s.topZ + 1
      return {
        topZ,
        windows: { ...s.windows, [id]: { ...w, zIndex: topZ } },
      }
    })
  },

  toggleTaskbarWindow: (id) => {
    const s = get()
    const w = s.windows[id]
    if (!w.isOpen) {
      s.openWindow(id)
      return
    }
    const focused = w.zIndex === s.topZ && !w.isMinimized
    if (focused) {
      s.minimizeWindow(id)
    } else {
      s.focusWindow(id)
      s.restoreWindow(id)
    }
  },

  moveWindow: (id, x, y) => {
    set((s) => ({
      windows: { ...s.windows, [id]: { ...s.windows[id], x, y } },
    }))
  },

  resizeWindow: (id, patch) => {
    set((s) => ({
      windows: { ...s.windows, [id]: { ...s.windows[id], ...patch } },
    }))
  },
}))

export function resetWindowStoreForTests(): void {
  useWindowStore.setState({
    windows: createInitialWindows(),
    topZ: 2,
    startMenuOpen: true,
  })
}
