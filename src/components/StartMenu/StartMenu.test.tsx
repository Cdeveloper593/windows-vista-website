import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StartMenu } from './StartMenu'
import { resetWindowStoreForTests, useWindowStore } from '../../store/windowStore'

describe('StartMenu', () => {
  beforeEach(() => {
    resetWindowStoreForTests()
  })

  it('renders the reference configuration: pinned items, programs, right pane', () => {
    render(<StartMenu onPowerAction={() => undefined} />)

    // pinned
    expect(screen.getByText('Internet')).toBeInTheDocument()
    expect(screen.getByText('Internet Explorer')).toBeInTheDocument()
    expect(screen.getByText('E-mail')).toBeInTheDocument()
    expect(screen.getByText('Windows Mail')).toBeInTheDocument()

    // program list
    expect(screen.getByText('Welcome Center')).toBeInTheDocument()
    expect(screen.getByText('Windows Media Center')).toBeInTheDocument()
    expect(screen.getByText('Windows Ultimate Extras')).toBeInTheDocument()
    expect(screen.getByText('Windows Media Player')).toBeInTheDocument()
    expect(screen.getByText('Windows Photo Gallery')).toBeInTheDocument()
    expect(screen.getByText('Windows Live Messenger Download')).toBeInTheDocument()
    expect(screen.getByText('Windows DVD Maker')).toBeInTheDocument()
    expect(screen.getByText('Windows Meeting Space')).toBeInTheDocument()

    // All Programs + Start Search
    expect(screen.getByText('All Programs')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Start Search')).toBeInTheDocument()

    // right pane — the avatar's <title> also carries the name, so allow multiple matches
    expect(screen.getAllByText('John Doe').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Pictures')).toBeInTheDocument()
    expect(screen.getByText('Music')).toBeInTheDocument()
    expect(screen.getByText('Games')).toBeInTheDocument()
    expect(screen.getByText('Recent Items')).toBeInTheDocument()
    expect(screen.getByText('Computer')).toBeInTheDocument()
    expect(screen.getByText('Network')).toBeInTheDocument()
    expect(screen.getByText('Connect To')).toBeInTheDocument()
    expect(screen.getByText('Control Panel')).toBeInTheDocument()
    expect(screen.getByText('Default Programs')).toBeInTheDocument()
    expect(screen.getByText('Help and Support')).toBeInTheDocument()
  })

  it('exposes the menu role with menuitem children', () => {
    render(<StartMenu onPowerAction={() => undefined} />)
    const menu = screen.getByRole('menu', { name: 'Start menu' })
    expect(menu).toBeInTheDocument()
    const items = within(menu).getAllByRole('menuitem')
    expect(items.length).toBeGreaterThanOrEqual(23)
  })

  it('Escape closes the Start menu', async () => {
    const user = userEvent.setup()
    render(<StartMenu onPowerAction={() => undefined} />)
    expect(useWindowStore.getState().startMenuOpen).toBe(true)
    await user.keyboard('{Escape}')
    expect(useWindowStore.getState().startMenuOpen).toBe(false)
  })

  it('Start Search filters the program list live', async () => {
    const user = userEvent.setup()
    render(<StartMenu onPowerAction={() => undefined} />)
    const search = screen.getByPlaceholderText('Start Search')
    await user.type(search, 'dvd')
    expect(screen.getByText('Windows DVD Maker')).toBeInTheDocument()
    expect(screen.queryByText('Windows Media Player')).not.toBeInTheDocument()
    expect(screen.getByText('Programs')).toBeInTheDocument()
  })

  it('Start Search shows an empty state when nothing matches', async () => {
    const user = userEvent.setup()
    render(<StartMenu onPowerAction={() => undefined} />)
    await user.type(screen.getByPlaceholderText('Start Search'), 'zzz-no-such-app')
    expect(screen.getByText('No programs found')).toBeInTheDocument()
  })

  it('Recent Items toggles its submenu flyout', async () => {
    const user = userEvent.setup()
    render(<StartMenu onPowerAction={() => undefined} />)
    const recent = screen.getByRole('menuitem', { name: /Recent Items/ })
    expect(screen.queryByRole('menu', { name: 'Recent Items' })).not.toBeInTheDocument()
    await user.click(recent)
    expect(screen.getByRole('menu', { name: 'Recent Items' })).toBeInTheDocument()
    expect(screen.getByText('Budget 2007.xlsx')).toBeInTheDocument()
  })

  it('power button triggers the shutdown action and closes the menu', async () => {
    const onPowerAction = vi.fn()
    const user = userEvent.setup()
    render(<StartMenu onPowerAction={onPowerAction} />)
    await user.click(screen.getByRole('button', { name: 'Shut down' }))
    expect(onPowerAction).toHaveBeenCalledWith('shutdown')
    expect(useWindowStore.getState().startMenuOpen).toBe(false)
  })

  it('lock button triggers the lock action', async () => {
    const onPowerAction = vi.fn()
    const user = userEvent.setup()
    render(<StartMenu onPowerAction={onPowerAction} />)
    await user.click(screen.getByRole('button', { name: 'Lock' }))
    expect(onPowerAction).toHaveBeenCalledWith('lock')
  })

  it('clicking a program closes the menu', async () => {
    const user = userEvent.setup()
    render(<StartMenu onPowerAction={() => undefined} />)
    await user.click(screen.getByRole('menuitem', { name: /Windows Media Player/ }))
    expect(useWindowStore.getState().startMenuOpen).toBe(false)
  })
})
