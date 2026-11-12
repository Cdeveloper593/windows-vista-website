/**
 * Sprite map: real Vista icon artwork sliced from the provided sheet.
 * Every tile is a local asset — no hotlinking, no external icon packs.
 * See scripts/slice.mjs for how tiles were cut out of the sheet.
 */
import tileInternetExplorer from '../../assets/icons/tile_R6C10.png'
import tileWindowsMail from '../../assets/icons/tile_R12C4.png'
import tileMediaCenter from '../../assets/icons/tile_R2C0.png'
import tileUltimateExtras from '../../assets/icons/tile_R7C20.png'
import tileMediaPlayer from '../../assets/icons/tile_R9C17.png'
import tilePhotoGallery from '../../assets/icons/tile_R1C17.png'
import tileMessenger from '../../assets/icons/tile_R2C1.png'
import tileDVDMaker from '../../assets/icons/tile_R11C7.png'
import tileMeetingSpace from '../../assets/icons/tile_R13C8.png'
import tileWelcomeCenter from '../../assets/icons/tile_R10C23.png'
import tileDocuments from '../../assets/icons/tile_R8C12.png'
import tileExplorer from '../../assets/icons/tile_R8C12.png'
import tilePictures from '../../assets/icons/tile_R1C17.png'
import tileMusic from '../../assets/icons/tile_R13C0.png'
import tileGames from '../../assets/icons/tile_R3C13.png'
import tileRecentItems from '../../assets/icons/tile_R0C7.png'
import tileComputer from '../../assets/icons/tile_R4C6.png'
import tileNetwork from '../../assets/icons/tile_R6C15.png'
import tileConnectTo from '../../assets/icons/tile_R2C22.png'
import tileControlPanel from '../../assets/icons/tile_R1C14.png'
import tileDefaultPrograms from '../../assets/icons/tile_R10C18.png'
import tileHelp from '../../assets/icons/tile_R5C2.png'
import tileShowDesktop from '../../assets/icons/tile_R4C8.png'
import tileSwitchWindows from '../../assets/icons/tile_R6C15.png'
import tileMagnifier from '../../assets/icons/tile_R8C1.png'
import tileRecycleBin from '../../assets/icons/tile_R0C22.png'
import tileSecurityFlag from '../../assets/icons/tile_R0C11.png'
import tileUsb from '../../assets/icons/tile_R4C25.png'
import tileNetworkTray from '../../assets/icons/tile_R6C23.png'
import tileVolume from '../../assets/icons/tile_R3C19.png'
import tileDaisy from '../../assets/icons/tile_R1C20.png'
import tileViewDetails from '../../assets/icons/tile_R4C20.png'
import tileConnectInternet from '../../assets/icons/tile_R8C3.png'
import tileCheckUpdates from '../../assets/icons/tile_R9C23.png'
import tileGetStarted from '../../assets/icons/tile_R10C23.png'
import tileTransferFiles from '../../assets/icons/tile_R7C9.png'
import tileAddUsers from '../../assets/icons/tile_R7C18.png'
import tileWhatsNew from '../../assets/icons/tile_R7C21.png'
import tilePersonalize from '../../assets/icons/tile_R3C7.png'
import tileFindFast from '../../assets/icons/tile_R7C24.png'
import tileProtectPC from '../../assets/icons/tile_R4C0.png'
import tileConnectShare from '../../assets/icons/tile_R8C18.png'
import tileProtectMore from '../../assets/icons/tile_R9C12.png'
import tileFlag from '../../assets/icons/tile_R0C11.png'
import tileHardDrive from '../../assets/icons/tile_R3C1.png'
import tileDvdDrive from '../../assets/icons/tile_R0C15.png'
import tileDocumentsFolder from '../../assets/icons/tile_R7C2.png'
import tilePicturesFolder from '../../assets/icons/tile_R11C2.png'
import tileMusicFolder from '../../assets/icons/tile_R8C12.png'
import tileVideosFolder from '../../assets/icons/tile_R8C11.png'
import tileDownloadsFolder from '../../assets/icons/tile_R8C8.png'
import tileGamesFolder from '../../assets/icons/tile_R8C10.png'

export const SPRITE = {
  internetExplorer: tileInternetExplorer,
  windowsMail: tileWindowsMail,
  mediaCenter: tileMediaCenter,
  ultimateExtras: tileUltimateExtras,
  mediaPlayer: tileMediaPlayer,
  photoGallery: tilePhotoGallery,
  messenger: tileMessenger,
  dvdMaker: tileDVDMaker,
  meetingSpace: tileMeetingSpace,
  welcomeCenter: tileWelcomeCenter,
  documents: tileDocuments,
  explorer: tileExplorer,
  pictures: tilePictures,
  music: tileMusic,
  games: tileGames,
  recentItems: tileRecentItems,
  computer: tileComputer,
  network: tileNetwork,
  connectTo: tileConnectTo,
  controlPanel: tileControlPanel,
  defaultPrograms: tileDefaultPrograms,
  help: tileHelp,
  showDesktop: tileShowDesktop,
  switchWindows: tileSwitchWindows,
  magnifier: tileMagnifier,
  recycleBin: tileRecycleBin,
  securityFlag: tileSecurityFlag,
  usb: tileUsb,
  networkTray: tileNetworkTray,
  volume: tileVolume,
  daisy: tileDaisy,
  viewDetails: tileViewDetails,
  connectInternet: tileConnectInternet,
  checkUpdates: tileCheckUpdates,
  getStarted: tileGetStarted,
  transferFiles: tileTransferFiles,
  addUsers: tileAddUsers,
  whatsNew: tileWhatsNew,
  personalize: tilePersonalize,
  findFast: tileFindFast,
  protectPC: tileProtectPC,
  connectShare: tileConnectShare,
  protectMore: tileProtectMore,
  flag: tileFlag,
  hardDrive: tileHardDrive,
  dvdDrive: tileDvdDrive,
  documentsFolder: tileDocumentsFolder,
  picturesFolder: tilePicturesFolder,
  musicFolder: tileMusicFolder,
  videosFolder: tileVideosFolder,
  downloadsFolder: tileDownloadsFolder,
  gamesFolder: tileGamesFolder,
} as const

export type SpriteName = keyof typeof SPRITE
