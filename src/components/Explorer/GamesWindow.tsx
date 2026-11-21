import { useState, type ComponentType } from 'react'
import { ExplorerWindow } from './ExplorerWindow'
import { GamesIcon } from '../icons'
import {
  ChessArt,
  FreeCellArt,
  HeartsArt,
  InkBallArt,
  MahjongArt,
  MinesweeperArt,
  PurbleArt,
  SolitaireArt,
  SpiderArt,
} from './GameArt'
import styles from './GamesWindow.module.css'

interface Game {
  name: string
  genre: string
  art: ComponentType<{ size?: number }>
}

const GAMES: Game[] = [
  { name: 'Chess Titans', genre: 'Chess', art: ChessArt },
  { name: 'Mahjong Titans', genre: 'Mahjong', art: MahjongArt },
  { name: 'Minesweeper', genre: 'Puzzle', art: MinesweeperArt },
  { name: 'Solitaire', genre: 'Card', art: SolitaireArt },
  { name: 'Spider Solitaire', genre: 'Card', art: SpiderArt },
  { name: 'FreeCell', genre: 'Card', art: FreeCellArt },
  { name: 'Hearts', genre: 'Card', art: HeartsArt },
  { name: 'Purble Place', genre: 'Kids', art: PurbleArt },
  { name: 'InkBall', genre: 'Puzzle', art: InkBallArt },
]

/**
 * Vista Games Explorer: a tile gallery of the inbox games with the preview
 * pane on the RIGHT (artwork, metadata, ESRB badge) — a different shell
 * from the folder windows, with no navigation pane and no bottom pane.
 */
export function GamesWindow() {
  const [selected, setSelected] = useState(0)
  const game = GAMES[selected]
  const SelectedArt = game.art

  return (
    <ExplorerWindow
      id="games"
      title="Games"
      addressIcon={<GamesIcon size={16} />}
      crumbs={['Games']}
      commands={[
        { label: 'Organize', dropdown: true },
        { label: 'Views', dropdown: true },
        { label: 'Options' },
        { label: 'Tools', dropdown: true },
      ]}
      showNavPane={false}
    >
      <div className={styles.shell}>
        <ul className={styles.gallery}>
          {GAMES.map((g, i) => {
            const Art = g.art
            return (
              <li key={g.name}>
                <button
                  type="button"
                  className={`${styles.tile} ${i === selected ? styles.tileSelected : ''}`}
                  onClick={() => {
                    setSelected(i)
                  }}
                  aria-pressed={i === selected}
                >
                  <Art size={48} />
                  <span className={styles.tileText}>
                    <span className={styles.tileName}>{g.name}</span>
                    <span className={styles.tileGenre}>{g.genre}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <aside className={styles.preview} aria-label="Game details">
          <div className={styles.previewArt}>
            <SelectedArt size={92} />
          </div>
          <h2 className={styles.previewName}>{game.name}</h2>
          <dl className={styles.meta}>
            <div>
              <dt>Publisher</dt>
              <dd>Microsoft</dd>
            </div>
            <div>
              <dt>Developer</dt>
              <dd>Microsoft</dd>
            </div>
            <div>
              <dt>Genre</dt>
              <dd>{game.genre}</dd>
            </div>
            <div>
              <dt>Last played</dt>
              <dd>Never</dd>
            </div>
          </dl>
          <div className={styles.esrb} aria-label="ESRB rating: Everyone">
            <span className={styles.esrbLetter}>E</span>
            <span className={styles.esrbText}>
              EVERYONE
              <span className={styles.esrbSub}>ESRB CONTENT RATING</span>
            </span>
          </div>
        </aside>
      </div>
    </ExplorerWindow>
  )
}
