import { useState } from 'react'
import { useFeed } from '../../hooks/useFeed'
import { RssIcon } from '../icons'
import styles from './Sidebar.module.css'

/**
 * Feed headlines gadget. Collapsed it shows the orange RSS icon + "RSS";
 * clicking expands the live headline list fetched from /api/feed (with
 * static fallback).
 */
export function FeedGadget() {
  const { feed } = useFeed()
  const [expanded, setExpanded] = useState(false)
  const headlines = feed.headlines.slice(0, 3)

  return (
    <section className={styles.feedGadget} aria-label="Feed headlines">
      <button
        type="button"
        className={styles.feedButton}
        aria-expanded={expanded}
        onClick={() => {
          setExpanded((v) => !v)
        }}
      >
        <RssIcon size={46} />
        <span className={styles.feedTitle}>RSS</span>
        {expanded ? <span className={styles.feedSource}>{feed.source}</span> : null}
      </button>

      {expanded ? (
        <>
          <div className={styles.feedDivider} aria-hidden="true" />
          <ul className={styles.feedList}>
            {headlines.map((item, i) => (
              <li key={`${String(i)}-${item.title}`} className={styles.feedItem}>
                {item.link ? (
                  <a
                    className={styles.feedLink}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {item.title}
                  </a>
                ) : (
                  <span className={styles.feedText}>{item.title}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  )
}
