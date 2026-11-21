import { useRef, useState } from 'react'
import { Window } from '../Window/Window'
import { ShellNavControls } from '../ShellToolbar/ShellNavControls'
import { InternetExplorerIcon, TrayGlobeIcon } from '../icons'
import styles from './InternetExplorer.module.css'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const HOME_URL = 'about:home'
const MAX_TABS = 5

/**
 * Search engine: Wiby (https://wiby.me/?q=…). Verified 2026-11-21 with
 * curl: its results page sends no X-Frame-Options and no CSP
 * frame-ancestors, so it may be framed. DuckDuckGo (SAMEORIGIN), Ecosia
 * (SAMEORIGIN), Brave (frame-ancestors 'self'), Mojeek (frame-ancestors
 * 'none') and Startpage (SAMEORIGIN) all refuse framing.
 */
const searchUrl = (query: string) => `https://wiby.me/?q=${encodeURIComponent(query)}`

interface Bookmark {
  name: string
  url: string
  description: string
}

/**
 * Quick links — every one verified frame-friendly with curl on 2026-11-21
 * (no X-Frame-Options DENY/SAMEORIGIN and no CSP frame-ancestors that
 * excludes this site). Wikipedia *articles* are NOT frameable
 * (frame-ancestors 'self' *.wikimedia.org), so the portal is used instead;
 * MDN (XFO: DENY) and openstreetmap.org itself (SAMEORIGIN) were dropped —
 * the OSM embed endpoint explicitly allows framing.
 */
const BOOKMARKS: Bookmark[] = [
  {
    name: 'Wikipedia',
    url: 'https://www.wikipedia.org',
    description: 'The free encyclopedia — portal',
  },
  {
    name: 'Internet Archive',
    url: 'https://archive.org',
    description: 'Digital library of free books, movies and music',
  },
  {
    name: 'OpenStreetMap',
    url: 'https://www.openstreetmap.org/export/embed.html?bbox=-0.1357%2C51.5055%2C-0.0957%2C51.5255&layer=mapnik',
    description: 'A map of London, ready to explore',
  },
  {
    name: 'xkcd',
    url: 'https://xkcd.com',
    description: 'A webcomic of romance, sarcasm, math and language',
  },
  {
    name: 'Wiktionary',
    url: 'https://www.wiktionary.org',
    description: 'The free dictionary — portal',
  },
  {
    name: 'Example Domain',
    url: 'https://example.com',
    description: 'The classic example.com placeholder page',
  },
]

/* ------------------------------------------------------------------ */
/*  Small inline SVG glyphs (IE8 toolbar)                              */
/* ------------------------------------------------------------------ */

function BackGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path
        d="M20 10.6H8.4l4.1-4.1L10.9 4.9 4.2 11.6a1.15 1.15 0 0 0 0 1.6l6.7 6.7 1.6-1.6-4.1-4.1H20z"
        fill="#2c4a5e"
      />
    </svg>
  )
}

function ForwardGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path
        d="M4 10.6h11.6l-4.1-4.1 1.6-1.6 6.7 6.7a1.15 1.15 0 0 1 0 1.6l-6.7 6.7-1.6-1.6 4.1-4.1H4z"
        fill="#2c4a5e"
      />
    </svg>
  )
}

function RefreshGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M12 4.5a7.5 7.5 0 1 1-6.9 4.6"
        fill="none"
        stroke="#1d7a3a"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path d="M4.4 3.6v5.6h5.6z" fill="#1d7a3a" />
    </svg>
  )
}

function StopGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path
        d="M5.5 4 12 10.5 18.5 4 20 5.5 13.5 12l6.5 6.5-1.5 1.5L12 13.5 5.5 20 4 18.5 10.5 12 4 5.5z"
        fill="#c0272d"
      />
    </svg>
  )
}

function HomeGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M12 3.2 2.8 11h2.6v8.4h5.1v-5.6h3v5.6h5.1V11h2.6z"
        fill="#7a5a14"
        stroke="#5d430d"
        strokeWidth="0.8"
      />
    </svg>
  )
}

function ExternalGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        d="M13.5 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.5h-2.4V18H6.4V6.4h7.1zM16.2 3v2.3h3.1L12 12.6l1.7 1.7 7.3-7.3v3.1H23V3z"
        fill="#2c4a5e"
      />
    </svg>
  )
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 10 10" width="8" height="8" aria-hidden="true">
      <path
        d="M1.5 1 9 8.5M9 1 1.5 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  URL helpers                                                        */
/* ------------------------------------------------------------------ */

/** Turn whatever the user typed into a navigable URL (or a search). */
function resolveAddressInput(raw: string): string {
  const text = raw.trim()
  if (text === '' || text.toLowerCase() === HOME_URL) return HOME_URL
  if (/^https?:\/\//i.test(text)) return text
  const looksLikeAddress = !/\s/.test(text) && text.includes('.')
  if (looksLikeAddress) return `https://${text}`
  return searchUrl(text)
}

function tabLabel(url: string): string {
  if (url === HOME_URL) return 'New Tab'
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'New Tab'
  }
}

/* ------------------------------------------------------------------ */
/*  Tabs state                                                         */
/* ------------------------------------------------------------------ */

interface TabState {
  id: number
  history: string[]
  index: number
  loading: boolean
  reloadKey: number
}

interface BrowserState {
  tabs: TabState[]
  activeTabId: number
}

let nextTabId = 1

function createTab(url: string = HOME_URL): TabState {
  const tab: TabState = {
    id: nextTabId,
    history: [url],
    index: 0,
    loading: url !== HOME_URL,
    reloadKey: 0,
  }
  nextTabId += 1
  return tab
}

function createBrowserState(): BrowserState {
  const tab = createTab()
  return { tabs: [tab], activeTabId: tab.id }
}

const currentUrlOf = (tab: TabState): string => tab.history[tab.index] ?? HOME_URL

/* ------------------------------------------------------------------ */
/*  Start page (about:home)                                            */
/* ------------------------------------------------------------------ */

function StartPage({
  onNavigate,
  onSearch,
}: {
  onNavigate: (url: string) => void
  onSearch: (query: string) => void
}) {
  const [query, setQuery] = useState('')
  return (
    <div className={styles.startPage}>
      <div className={styles.liveBand}>
        <p className={styles.liveWordmark}>
          Windows Live<span className={styles.liveTm}>™</span>{' '}
          <span className={styles.liveSearch}>Search</span>
        </p>
        <form
          className={styles.liveForm}
          onSubmit={(e) => {
            e.preventDefault()
            if (query.trim()) onSearch(query)
          }}
        >
          <input
            type="text"
            className={styles.liveInput}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
            }}
            placeholder="Search the web"
            aria-label="Search the web"
            spellCheck={false}
            autoComplete="off"
          />
          <button type="submit" className={styles.liveButton}>
            Search
          </button>
        </form>
        <p className={styles.liveHint}>
          Wiby — the search engine for the old web, framed live in this window.
        </p>
      </div>

      <div className={styles.favourites}>
        <h2 className={styles.favouritesTitle}>Favourites</h2>
        <div className={styles.tileGrid}>
          {BOOKMARKS.map((bookmark) => (
            <button
              key={bookmark.url}
              type="button"
              className={styles.tile}
              onClick={() => {
                onNavigate(bookmark.url)
              }}
            >
              <span className={styles.tileIcon}>
                <TrayGlobeIcon size={30} />
              </span>
              <span className={styles.tileText}>
                <span className={styles.tileName}>{bookmark.name}</span>
                <span className={styles.tileDescription}>{bookmark.description}</span>
              </span>
            </button>
          ))}
        </div>
        <p className={styles.favouritesNote}>
          These sites allow themselves to be shown inside Internet Explorer here. Many big sites
          (Google, Facebook, X) refuse, and will stay blank — use the ↗ button to open those in a
          real browser tab instead.
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Internet Explorer window                                           */
/* ------------------------------------------------------------------ */

export function InternetExplorerWindow() {
  const [browser, setBrowser] = useState<BrowserState>(createBrowserState)
  const [addressDraft, setAddressDraft] = useState<{
    tabId: number
    url: string
    text: string
  } | null>(null)
  const [infoVisible, setInfoVisible] = useState(true)
  const addressRef = useRef<HTMLInputElement>(null)

  const { tabs, activeTabId } = browser
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]
  const currentUrl = currentUrlOf(activeTab)
  const canGoBack = activeTab.index > 0
  const canGoForward = activeTab.index < activeTab.history.length - 1
  const isLoading = activeTab.loading

  // The address bar shows the user's in-progress typing for this tab/page,
  // otherwise it mirrors the tab's current URL (blank on the start page).
  const draftMatches =
    addressDraft !== null && addressDraft.tabId === activeTab.id && addressDraft.url === currentUrl
  const addressText = draftMatches ? addressDraft.text : currentUrl === HOME_URL ? '' : currentUrl

  const patchTab = (id: number, patch: Partial<TabState>) => {
    setBrowser((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
  }

  const navigate = (url: string) => {
    setAddressDraft(null)
    setBrowser((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => {
        if (t.id !== prev.activeTabId) return t
        const history = [...t.history.slice(0, t.index + 1), url]
        return { ...t, history, index: history.length - 1, loading: url !== HOME_URL }
      }),
    }))
  }

  const goBack = () => {
    if (!canGoBack) return
    const target = activeTab.history[activeTab.index - 1] ?? HOME_URL
    patchTab(activeTab.id, { index: activeTab.index - 1, loading: target !== HOME_URL })
  }

  const goForward = () => {
    if (!canGoForward) return
    const target = activeTab.history[activeTab.index + 1] ?? HOME_URL
    patchTab(activeTab.id, { index: activeTab.index + 1, loading: target !== HOME_URL })
  }

  const refresh = () => {
    if (currentUrl === HOME_URL) return
    patchTab(activeTab.id, { loading: true, reloadKey: activeTab.reloadKey + 1 })
  }

  const stop = () => {
    patchTab(activeTab.id, { loading: false })
  }

  const addTab = () => {
    if (tabs.length >= MAX_TABS) return
    const tab = createTab()
    setBrowser((prev) => ({ tabs: [...prev.tabs, tab], activeTabId: tab.id }))
    addressRef.current?.focus()
  }

  const closeTab = (id: number) => {
    if (tabs.length <= 1) {
      setBrowser(createBrowserState())
      return
    }
    const closedIndex = tabs.findIndex((t) => t.id === id)
    const remaining = tabs.filter((t) => t.id !== id)
    const nextActiveId =
      id === activeTabId
        ? (remaining[Math.min(closedIndex, remaining.length - 1)]?.id ?? activeTabId)
        : activeTabId
    setBrowser({ tabs: remaining, activeTabId: nextActiveId })
  }

  const toolbar = (
    <>
      <button
        type="button"
        className={styles.toolButton}
        onClick={goBack}
        disabled={!canGoBack}
        aria-label="Back"
        title="Back"
      >
        <BackGlyph />
      </button>
      <button
        type="button"
        className={styles.toolButton}
        onClick={goForward}
        disabled={!canGoForward}
        aria-label="Forward"
        title="Forward"
      >
        <ForwardGlyph />
      </button>
      <form
        className={styles.addressField}
        onSubmit={(e) => {
          e.preventDefault()
          navigate(resolveAddressInput(addressText))
          addressRef.current?.blur()
        }}
      >
        <span className={styles.addressIcon} aria-hidden="true">
          <TrayGlobeIcon size={15} />
        </span>
        <input
          ref={addressRef}
          type="text"
          className={styles.addressInput}
          value={addressText}
          onChange={(e) => {
            setAddressDraft({ tabId: activeTab.id, url: currentUrl, text: e.target.value })
          }}
          onFocus={(e) => {
            e.target.select()
          }}
          placeholder="Enter an address, or type to search"
          aria-label="Address"
          spellCheck={false}
          autoComplete="off"
        />
        {isLoading ? <span className={styles.loadingDot} aria-hidden="true" /> : null}
      </form>
      {isLoading ? (
        <button
          type="button"
          className={styles.toolButton}
          onClick={stop}
          aria-label="Stop"
          title="Stop"
        >
          <StopGlyph />
        </button>
      ) : (
        <button
          type="button"
          className={styles.toolButton}
          onClick={refresh}
          aria-label="Refresh"
          title="Refresh"
        >
          <RefreshGlyph />
        </button>
      )}
      <button
        type="button"
        className={styles.toolButton}
        onClick={() => {
          navigate(HOME_URL)
        }}
        aria-label="Home"
        title="Home"
      >
        <HomeGlyph />
      </button>
      <button
        type="button"
        className={styles.toolButton}
        onClick={() => {
          window.open(currentUrl, '_blank', 'noopener,noreferrer')
        }}
        disabled={currentUrl === HOME_URL}
        aria-label="Open in new browser tab"
        title="Open in new browser tab"
      >
        <ExternalGlyph />
      </button>
    </>
  )

  const statusText = isLoading
    ? `Opening ${tabLabel(currentUrl)}…`
    : currentUrl === HOME_URL
      ? 'Done'
      : currentUrl

  return (
    <Window
      id="internet-explorer"
      title="Internet Explorer"
      navControls={<ShellNavControls />}
      toolbar={toolbar}
    >
      <div className={styles.root}>
        {/* ---- tab strip ---- */}
        <div className={styles.tabStrip} role="tablist" aria-label="Browser tabs">
          {tabs.map((tab) => {
            const url = currentUrlOf(tab)
            const isActive = tab.id === activeTab.id
            return (
              <div
                key={tab.id}
                className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setBrowser((prev) => ({ ...prev, activeTabId: tab.id }))
                }}
              >
                <InternetExplorerIcon size={14} />
                <span className={styles.tabLabel}>{tabLabel(url)}</span>
                <button
                  type="button"
                  className={styles.tabClose}
                  aria-label={`Close tab ${tabLabel(url)}`}
                  title="Close tab"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                >
                  <CloseGlyph />
                </button>
              </div>
            )
          })}
          <button
            type="button"
            className={styles.newTabButton}
            onClick={addTab}
            disabled={tabs.length >= MAX_TABS}
            aria-label="New tab"
            title={tabs.length >= MAX_TABS ? `Maximum of ${String(MAX_TABS)} tabs` : 'New tab'}
          >
            +
          </button>
        </div>

        {/* ---- blocked-site info strip ---- */}
        {infoVisible ? (
          <div className={styles.infoStrip} role="note">
            <span>
              Some sites (Google, Facebook, X) block opening inside other pages. If a page stays
              blank, use ↗ to open it in a real tab.
            </span>
            <button
              type="button"
              className={styles.infoClose}
              aria-label="Dismiss"
              onClick={() => {
                setInfoVisible(false)
              }}
            >
              <CloseGlyph />
            </button>
          </div>
        ) : null}

        {/* ---- web view ---- */}
        <div className={styles.webview}>
          {tabs.map((tab) => {
            const url = currentUrlOf(tab)
            if (url === HOME_URL) return null
            return (
              <iframe
                key={`${String(tab.id)}-${String(tab.reloadKey)}`}
                className={styles.frame}
                style={{ display: tab.id === activeTab.id ? 'block' : 'none' }}
                src={url}
                title={tabLabel(url)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                referrerPolicy="no-referrer"
                onLoad={() => {
                  patchTab(tab.id, { loading: false })
                }}
              />
            )
          })}
          {currentUrl === HOME_URL ? (
            <StartPage
              onNavigate={navigate}
              onSearch={(query) => {
                navigate(searchUrl(query))
              }}
            />
          ) : null}
        </div>

        {/* ---- status bar ---- */}
        <div className={styles.statusBar}>
          <span className={styles.statusLeft}>{statusText}</span>
          <span className={styles.statusRight}>Internet | Protected Mode: On</span>
        </div>
      </div>
    </Window>
  )
}
