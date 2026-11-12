import type { IconProps } from './types'
import { Sheet } from './Sheet'

/* ---------------- Recycle Bin / avatar / shell artwork (real tiles) ---------------- */
export const RecycleBinIcon = (props: IconProps) => <Sheet name="recycleBin" {...props} />
export const ShowDesktopIcon = (props: IconProps) => <Sheet name="showDesktop" {...props} />
export const SwitchWindowsIcon = (props: IconProps) => <Sheet name="switchWindows" {...props} />
export const FlowerAvatarIcon = (props: IconProps) => <Sheet name="daisy" {...props} />
export const VistaMonitorIcon = (props: IconProps) => <Sheet name="whatsNew" {...props} />

/* ============ Welcome Center link icons (real tiles) ============ */
export const TransferFilesIcon = (props: IconProps) => <Sheet name="transferFiles" {...props} />
export const AddUsersIcon = (props: IconProps) => <Sheet name="addUsers" {...props} />
export const WhatsNewIcon = (props: IconProps) => <Sheet name="whatsNew" {...props} />
export const PersonalizeIcon = (props: IconProps) => <Sheet name="personalize" {...props} />
export const FindFastIcon = (props: IconProps) => <Sheet name="findFast" {...props} />
export const ProtectPCIcon = (props: IconProps) => <Sheet name="protectPC" {...props} />
export const ConnectShareIcon = (props: IconProps) => <Sheet name="connectShare" {...props} />
export const ProtectMoreIcon = (props: IconProps) => <Sheet name="protectMore" {...props} />
export const ViewDetailsIcon = (props: IconProps) => <Sheet name="viewDetails" {...props} />
export const ConnectInternetIcon = (props: IconProps) => <Sheet name="connectInternet" {...props} />
export const CheckUpdatesIcon = (props: IconProps) => <Sheet name="checkUpdates" {...props} />
export const GetStartedIcon = (props: IconProps) => <Sheet name="getStarted" {...props} />

/* ============ System tray glyphs (real tiles) ============ */
export const TrayNetworkIcon = (props: IconProps) => <Sheet name="networkTray" {...props} />
export const TraySecurityIcon = (props: IconProps) => <Sheet name="securityFlag" {...props} />
export const TrayVolumeIcon = (props: IconProps) => <Sheet name="volume" {...props} />
export const TrayUsbIcon = (props: IconProps) => <Sheet name="usb" {...props} />

/* ---------------- Tiny tray chevron (SVG) ---------------- */
export function TrayChevronUpIcon({ size = 10, className, title }: IconProps) {
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
        d="M8 30l16-15 16 15"
        fill="none"
        stroke="#e8f4f6"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ---------------- Global globe (SVG) ---------------- */
export function TrayGlobeIcon({ size = 16, className, title }: IconProps) {
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
      <circle cx="24" cy="24" r="16" fill="#2f8fd0" stroke="#061e30" strokeWidth="2" />
      <ellipse
        cx="24"
        cy="24"
        rx="7.2"
        ry="16"
        fill="none"
        stroke="#bfe6ff"
        strokeWidth="1.8"
        opacity="0.9"
      />
      <path
        d="M8 24h32M24 8a22.5 22.5 0 0 1 0 32"
        stroke="#bfe6ff"
        strokeWidth="1.8"
        opacity="0.9"
        fill="none"
      />
    </svg>
  )
}

/* ---------------- Minimize / maximize / restore / close glyphs (SVG) ---------------- */
export function MinimizeGlyph({ size = 12, className, title }: IconProps) {
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
      <path d="M8 32h32" stroke="#e8f4f6" strokeWidth="4.6" strokeLinecap="round" />
    </svg>
  )
}

export function MaximizeGlyph({ size = 12, className, title }: IconProps) {
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
      <rect
        x="8"
        y="8"
        width="32"
        height="32"
        rx="2.5"
        fill="none"
        stroke="#e8f4f6"
        strokeWidth="4"
      />
    </svg>
  )
}

export function RestoreGlyph({ size = 12, className, title }: IconProps) {
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
      <rect
        x="6"
        y="14"
        width="24"
        height="24"
        rx="2.2"
        fill="none"
        stroke="#e8f4f6"
        strokeWidth="3.6"
      />
      <path
        d="M16 14V6h26v24h-6"
        fill="none"
        stroke="#e8f4f6"
        strokeWidth="3.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CloseGlyph({ size = 12, className, title }: IconProps) {
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
      <path d="M10 10l28 28M38 10L10 38" stroke="#fff4ee" strokeWidth="4.4" strokeLinecap="round" />
    </svg>
  )
}
