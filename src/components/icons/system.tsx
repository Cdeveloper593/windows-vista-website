import type { IconProps } from './types'
import { Sheet } from './Sheet'

export const DocumentsIcon = (props: IconProps) => <Sheet name="documents" {...props} />
export const FileExplorerIcon = (props: IconProps) => <Sheet name="explorer" {...props} />
export const PicturesIcon = (props: IconProps) => <Sheet name="pictures" {...props} />
export const MusicIcon = (props: IconProps) => <Sheet name="music" {...props} />
export const GamesIcon = (props: IconProps) => <Sheet name="games" {...props} />
export const RecentItemsIcon = (props: IconProps) => <Sheet name="recentItems" {...props} />
export const ComputerIcon = (props: IconProps) => <Sheet name="computer" {...props} />
export const NetworkIcon = (props: IconProps) => <Sheet name="network" {...props} />
export const ConnectToIcon = (props: IconProps) => <Sheet name="connectTo" {...props} />
export const ControlPanelIcon = (props: IconProps) => <Sheet name="controlPanel" {...props} />
export const DefaultProgramsIcon = (props: IconProps) => <Sheet name="defaultPrograms" {...props} />
export const HelpIcon = (props: IconProps) => <Sheet name="help" {...props} />
export const MagnifierIcon = (props: IconProps) => <Sheet name="magnifier" {...props} />
export const HardDriveIcon = (props: IconProps) => <Sheet name="hardDrive" {...props} />
export const DvdDriveIcon = (props: IconProps) => <Sheet name="dvdDrive" {...props} />
export const DocumentsFolderIcon = (props: IconProps) => <Sheet name="documentsFolder" {...props} />
export const PicturesFolderIcon = (props: IconProps) => <Sheet name="picturesFolder" {...props} />
export const MusicFolderIcon = (props: IconProps) => <Sheet name="musicFolder" {...props} />
export const VideosFolderIcon = (props: IconProps) => <Sheet name="videosFolder" {...props} />
export const DownloadsFolderIcon = (props: IconProps) => <Sheet name="downloadsFolder" {...props} />
export const GamesFolderIcon = (props: IconProps) => <Sheet name="gamesFolder" {...props} />

/* ---------------- Welcome Center taskbar capsule (SVG — matches the reference) ---------------- */
export function WelcomeCapsuleIcon({ size = 18, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id="wc-capsule" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8ff0f4" />
          <stop offset="35%" stopColor="#2fb7c2" />
          <stop offset="75%" stopColor="#12808c" />
          <stop offset="100%" stopColor="#0a4a54" />
        </linearGradient>
      </defs>
      <rect
        x="6"
        y="2"
        width="12"
        height="20"
        rx="6"
        fill="url(#wc-capsule)"
        stroke="#04262c"
        strokeWidth="1.2"
      />
      <ellipse cx="11" cy="5.6" rx="3.1" ry="1.3" fill="#ffffff" opacity="0.65" />
      <path
        d="M9.2 5c-1.6 4.6-1.6 9.6 0 14.5"
        stroke="#e8feff"
        strokeOpacity="0.6"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/* ---------------- All Programs: green sphere arrow (SVG — sheet has no match) ---------------- */
export function AllProgramsIcon({ size = 20, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <radialGradient id="ap-orb" cx="42%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#c8f580" />
          <stop offset="50%" stopColor="#46a62c" />
          <stop offset="100%" stopColor="#124f0a" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="18" fill="url(#ap-orb)" stroke="#0b3a06" strokeWidth="1.6" />
      <path
        d="M19 15l11 9-11 9z"
        fill="#ffffff"
        stroke="#0b3a06"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ---------------- Green diamond (Show more details) ---------------- */
export function GreenDiamondIcon({ size = 12, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id="gd-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c2ff8a" />
          <stop offset="55%" stopColor="#3fae2a" />
          <stop offset="100%" stopColor="#115c04" />
        </linearGradient>
      </defs>
      <path
        d="M24 2l12 14-12 30L12 16z"
        fill="url(#gd-grad)"
        stroke="#0a3d00"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M24 6L17 17h14z" fill="#ffffff" opacity="0.5" />
    </svg>
  )
}

/* ---------------- Refresh ---------------- */
export function RefreshIcon({ size = 14, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        d="M34 18a14 14 0 1 0 2 12"
        fill="none"
        stroke="#1c4a56"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M37 6v12h-12"
        fill="none"
        stroke="#1c4a56"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ---------------- Chevron (breadcrumb / submenu) ---------------- */
export function ChevronIcon({ size = 10, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        d="M16 8l16 16-16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ---------------- Power glyph (SVG) ---------------- */
export function PowerGlyph({ size = 18, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d="M24 6v19" stroke="currentColor" strokeWidth="4.6" strokeLinecap="round" />
      <path
        d="M13.5 14.5a15 15 0 1 0 21 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ---------------- Padlock (SVG) ---------------- */
export function LockGlyph({ size = 16, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect x="9" y="20" width="30" height="21" rx="3.4" fill="currentColor" />
      <path
        d="M15 20v-4.5a9 9 0 0 1 18 0V20"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ---------------- RSS feed icon (SVG — matches the reference gadget exactly) ---------------- */
export function RssIcon({ size = 48, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id="rss-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffc069" />
          <stop offset="45%" stopColor="#f08c25" />
          <stop offset="100%" stopColor="#b3500a" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="9"
        fill="url(#rss-bg)"
        stroke="#5e2a04"
        strokeWidth="1.6"
      />
      <circle cx="13" cy="35" r="4.6" fill="#ffffff" />
      <path
        d="M8 23a17 17 0 0 1 17 17"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M8 12.5a27.5 27.5 0 0 1 27.5 27.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}
