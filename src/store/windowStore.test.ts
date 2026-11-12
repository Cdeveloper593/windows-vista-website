import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialWindows, resetWindowStoreForTests, useWindowStore } from './windowStore'

describe('windowStore', () => {
  beforeEach(() => {
    resetWindowStoreForTests()
  })

  it('boots with the reference configuration: Start menu open, Welcome Center open', () => {
    const s = useWindowStore.getState()
    expect(s.startMenuOpen).toBe(true)
    expect(s.windows.welcome.isOpen).toBe(true)
    expect(s.windows.welcome.isMinimized).toBe(false)
    expect(s.windows['recycle-bin'].isOpen).toBe(false)
  })

  it('toggles the Start menu', () => {
    useWindowStore.getState().toggleStartMenu()
    expect(useWindowStore.getState().startMenuOpen).toBe(false)
    useWindowStore.getState().toggleStartMenu()
    expect(useWindowStore.getState().startMenuOpen).toBe(true)
  })

  it('closes the Start menu explicitly', () => {
    useWindowStore.getState().setStartMenuOpen(false)
    expect(useWindowStore.getState().startMenuOpen).toBe(false)
  })

  it('openWindow marks the window visible and raises z-index above other windows', () => {
    const store = useWindowStore.getState()
    store.openWindow('recycle-bin')
    const s = useWindowStore.getState()
    expect(s.windows['recycle-bin'].isOpen).toBe(true)
    expect(s.windows['recycle-bin'].zIndex).toBeGreaterThan(s.windows.welcome.zIndex)
  })

  it('close flow: closeWindow sets isClosing, finishClose hides the window', () => {
    const store = useWindowStore.getState()
    store.closeWindow('welcome')
    expect(useWindowStore.getState().windows.welcome.isClosing).toBe(true)
    expect(useWindowStore.getState().windows.welcome.isOpen).toBe(true)

    useWindowStore.getState().finishClose('welcome')
    const s = useWindowStore.getState()
    expect(s.windows.welcome.isOpen).toBe(false)
    expect(s.windows.welcome.isClosing).toBe(false)
  })

  it('reopening a closed window restores it with the top z-index', () => {
    const store = useWindowStore.getState()
    store.closeWindow('welcome')
    store.finishClose('welcome')
    useWindowStore.getState().openWindow('welcome')
    const s = useWindowStore.getState()
    expect(s.windows.welcome.isOpen).toBe(true)
    expect(s.windows.welcome.zIndex).toBe(s.topZ)
  })

  it('minimize hides the window, restore brings it back', () => {
    useWindowStore.getState().minimizeWindow('welcome')
    expect(useWindowStore.getState().windows.welcome.isMinimized).toBe(true)
    useWindowStore.getState().restoreWindow('welcome')
    expect(useWindowStore.getState().windows.welcome.isMinimized).toBe(false)
  })

  it('toggleMaximize flips between maximized and restored', () => {
    expect(useWindowStore.getState().windows.welcome.isMaximized).toBe(false)
    useWindowStore.getState().toggleMaximize('welcome')
    expect(useWindowStore.getState().windows.welcome.isMaximized).toBe(true)
    useWindowStore.getState().toggleMaximize('welcome')
    expect(useWindowStore.getState().windows.welcome.isMaximized).toBe(false)
  })

  it('focusWindow raises the clicked window to the top', () => {
    const store = useWindowStore.getState()
    store.openWindow('recycle-bin')
    const binZ = useWindowStore.getState().windows['recycle-bin'].zIndex

    useWindowStore.getState().focusWindow('welcome')
    const s = useWindowStore.getState()
    expect(s.windows.welcome.zIndex).toBeGreaterThan(binZ)
    expect(s.windows.welcome.zIndex).toBe(s.topZ)
  })

  it('toggleTaskbarWindow minimizes the focused window and restores a hidden one', () => {
    // welcome starts focused (top z)
    useWindowStore.getState().toggleTaskbarWindow('welcome')
    expect(useWindowStore.getState().windows.welcome.isMinimized).toBe(true)

    // clicking the taskbar button again restores it
    useWindowStore.getState().toggleTaskbarWindow('welcome')
    const s = useWindowStore.getState()
    expect(s.windows.welcome.isMinimized).toBe(false)
    expect(s.windows.welcome.zIndex).toBe(s.topZ)
  })

  it('toggleTaskbarWindow on a minimized background window restores and focuses it', () => {
    const store = useWindowStore.getState()
    store.openWindow('recycle-bin') // bin becomes focused
    useWindowStore.getState().minimizeWindow('recycle-bin')
    expect(useWindowStore.getState().windows['recycle-bin'].isMinimized).toBe(true)

    useWindowStore.getState().toggleTaskbarWindow('recycle-bin')
    const s = useWindowStore.getState()
    expect(s.windows['recycle-bin'].isMinimized).toBe(false)
    expect(s.windows['recycle-bin'].zIndex).toBe(s.topZ)
  })

  it('toggleTaskbarWindow opens a closed window', () => {
    useWindowStore.getState().toggleTaskbarWindow('recycle-bin')
    expect(useWindowStore.getState().windows['recycle-bin'].isOpen).toBe(true)
  })

  it('moveWindow and resizeWindow update geometry', () => {
    useWindowStore.getState().moveWindow('welcome', 100, 120)
    useWindowStore.getState().resizeWindow('welcome', { width: 700, height: 500 })
    const s = useWindowStore.getState().windows.welcome
    expect([s.x, s.y, s.width, s.height]).toEqual([100, 120, 700, 500])
  })

  it('initial windows match the 2x reference placement', () => {
    const windows = createInitialWindows()
    expect(windows.welcome.x).toBe(222)
    expect(windows.welcome.y).toBe(168)
    expect(windows.welcome.width).toBe(806)
    expect(windows.welcome.height).toBe(652)
  })
})
