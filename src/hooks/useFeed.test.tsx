import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useFeed } from './useFeed'
import { FALLBACK_FEED } from '../api/feed'

function Probe() {
  const state = useFeed()
  return (
    <div>
      <span data-testid="status">{state.status}</span>
      <span data-testid="source">{state.feed.source}</span>
      <span data-testid="first">{state.feed.headlines[0]?.title ?? ''}</span>
    </div>
  )
}

describe('useFeed', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses live headlines when /api/feed responds successfully', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          source: 'BBC News',
          headlines: [
            { title: 'Live headline one', link: 'https://example.com/1', pubDate: null },
            { title: 'Live headline two', link: 'https://example.com/2', pubDate: null },
          ],
          isFallback: false,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    render(<Probe />)
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))
    expect(screen.getByTestId('source')).toHaveTextContent('BBC News')
    expect(screen.getByTestId('first')).toHaveTextContent('Live headline one')
  })

  it('falls back to static sample headlines when the API fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))
    render(<Probe />)
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))
    expect(screen.getByTestId('source')).toHaveTextContent(FALLBACK_FEED.source)
    expect(screen.getByTestId('first')).toHaveTextContent(FALLBACK_FEED.headlines[0].title)
  })

  it('falls back when the API returns an error status', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('oops', { status: 503 }))
    render(<Probe />)
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))
    expect(screen.getByTestId('source')).toHaveTextContent(FALLBACK_FEED.source)
  })
})
