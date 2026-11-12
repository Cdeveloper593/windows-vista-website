export interface FeedHeadline {
  title: string
  link: string | null
  pubDate: string | null
}

export interface FeedResponse {
  source: string
  headlines: FeedHeadline[]
  /** true when these are the baked-in sample headlines */
  isFallback: boolean
}

/**
 * Static sample headlines used when /api/feed is unavailable
 * (e.g. when the site is deployed as a pure static build).
 */
export const FALLBACK_HEADLINES: FeedHeadline[] = [
  {
    title: 'Windows Vista review: Microsoft’s most ambitious OS yet',
    link: null,
    pubDate: '2007-01-30',
  },
  {
    title: 'Aero Glass brings translucent windows to the desktop',
    link: null,
    pubDate: '2007-01-30',
  },
  {
    title: 'Windows Sidebar gadgets: clock, slideshow and headlines',
    link: null,
    pubDate: '2007-01-30',
  },
  {
    title: 'BitLocker and Windows Defender headline Ultimate edition',
    link: null,
    pubDate: '2007-01-30',
  },
]

export const FALLBACK_FEED: FeedResponse = {
  source: 'Sample headlines (offline)',
  headlines: FALLBACK_HEADLINES,
  isFallback: true,
}
