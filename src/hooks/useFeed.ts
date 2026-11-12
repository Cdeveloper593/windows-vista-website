import { useEffect, useState } from 'react'
import { FALLBACK_FEED, type FeedHeadline, type FeedResponse } from '../api/feed'

type FeedState = { status: 'loading'; feed: FeedResponse } | { status: 'ready'; feed: FeedResponse }

/**
 * Loads /api/feed, falling back to static sample headlines when the
 * backend is not reachable (static hosting) or returns an error.
 */
export function useFeed(): FeedState {
  const [state, setState] = useState<FeedState>({ status: 'loading', feed: FALLBACK_FEED })

  useEffect(() => {
    const controller = new AbortController()

    async function load(): Promise<void> {
      try {
        const response = await fetch('/api/feed', {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })
        if (!response.ok) throw new Error(`Feed request failed: ${String(response.status)}`)
        const data: unknown = await response.json()
        if (typeof data !== 'object' || data === null)
          throw new Error('Feed response not an object')
        const raw = data as { source?: unknown; headlines?: unknown }
        if (!Array.isArray(raw.headlines) || raw.headlines.length === 0) {
          throw new Error('Feed response missing headlines')
        }
        const headlines = raw.headlines.map((item: unknown) => {
          const h = (typeof item === 'object' && item !== null ? item : {}) as Partial<FeedHeadline>
          return {
            title: typeof h.title === 'string' ? h.title : 'Untitled headline',
            link: typeof h.link === 'string' ? h.link : null,
            pubDate: typeof h.pubDate === 'string' ? h.pubDate : null,
          }
        })
        setState({
          status: 'ready',
          feed: {
            source: typeof raw.source === 'string' ? raw.source : 'Live feed',
            headlines,
            isFallback: false,
          },
        })
      } catch {
        // Graceful degradation — keep the sample headlines on screen.
        if (!controller.signal.aborted) {
          setState({ status: 'ready', feed: FALLBACK_FEED })
        }
      }
    }

    void load()
    return () => {
      controller.abort()
    }
  }, [])

  return state
}
