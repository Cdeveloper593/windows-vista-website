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
import Chess from './games/Chess'
import FreeCell from './games/FreeCell'
import Hearts from './games/Hearts'
import InkBall from './games/InkBall'
import Klondike from './games/Klondike'
import Mahjong from './games/Mahjong'
import Minesweeper from './games/Minesweeper'
import Purble from './games/Purble'
import Spider from './games/Spider'
import styles from './GamesWindow.module.css'

interface Game {
  name: string
  genre: string
  art: ComponentType<{ size?: number }>
  play: ComponentType
}

const GAMES: Game[] = [
  { name: 'Chess Titans', genre: 'Chess', art: ChessArt, play: Chess },
  { name: 'Mahjong Titans', genre: 'Mahjong', art: MahjongArt, play: Mahjong },
  { name: 'Minesweeper', genre: 'Puzzle', art: MinesweeperArt, play: Minesweeper },
  { name: 'Solitaire', genre: 'Card', art: SolitaireArt, play: Klondike },
  { name: 'Spider Solitaire', genre: 'Card', art: SpiderArt, play: Spider },
  { name: 'FreeCell', genre: 'Card', art: FreeCellArt, play: FreeCell },
  { name: 'Hearts', genre: 'Card', art: HeartsArt, play: Hearts },
  { name: 'Purble Place', genre: 'Kids', art: PurbleArt, play: Purble },
  { name: 'InkBall', genre: 'Puzzle', art: InkBallArt, play: InkBall },
]

/**
 * Vista Games Explorer: a tile gallery of the inbox games with the preview
 * pane on the RIGHT (artwork, metadata, ESRB badge). Every game is actually
 * playable — Play (or double-clicking a tile) swaps the gallery for the
 * game stage inside the same window.
 */
export function GamesWindow() {
  const [selected, setSelected] = useState(0)
  const [playing, setPlaying] = useState<number | null>(null)
  const [played, setPlayed] = useState<ReadonlySet<string>>(new Set())
  const game = GAMES[selected]
  const SelectedArt = game.art

  const startGame = (index: number) => {
    setSelected(index)
    setPlaying(index)
    setPlayed((prev) => new Set(prev).add(GAMES[index].name))
  }

  const PlayingGame = playing !== null ? GAMES[playing].play : null

  return (
    <ExplorerWindow
      id="games"
      title="Games"
      addressIcon={<GamesIcon size={16} />}
      crumbs={playing !== null ? ['Games', GAMES[playing].name] : ['Games']}
      commands={[
        { label: 'Organize', dropdown: true },
        { label: 'Views', dropdown: true },
        { label: 'Options' },
        { label: 'Tools', dropdown: true },
      ]}
      showNavPane={false}
    >
      {playing !== null && PlayingGame ? (
        <div className={styles.playerShell}>
          <div className={styles.playerBar}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => {
                setPlaying(null)
              }}
            >
              ‹ Games
            </button>
            <span className={styles.playerTitle}>{GAMES[playing].name}</span>
          </div>
          <PlayingGame />
        </div>
      ) : (
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
                    onDoubleClick={() => {
                      startGame(i)
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
            <button
              type="button"
              className={styles.playButton}
              onClick={() => {
                startGame(selected)
              }}
            >
              ▶ Play
            </button>
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
                <dd>{played.has(game.name) ? 'Today' : 'Never'}</dd>
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
      )}
    </ExplorerWindow>
  )
}
