import type { IconProps } from './types'
import { Sheet } from './Sheet'

export type { IconProps }

export const InternetExplorerIcon = (props: IconProps) => (
  <Sheet name="internetExplorer" {...props} />
)
export const WindowsMailIcon = (props: IconProps) => <Sheet name="windowsMail" {...props} />
export const MediaCenterIcon = (props: IconProps) => <Sheet name="mediaCenter" {...props} />
export const UltimateExtrasIcon = (props: IconProps) => <Sheet name="ultimateExtras" {...props} />
export const MediaPlayerIcon = (props: IconProps) => <Sheet name="mediaPlayer" {...props} />
export const PhotoGalleryIcon = (props: IconProps) => <Sheet name="photoGallery" {...props} />
export const MessengerIcon = (props: IconProps) => <Sheet name="messenger" {...props} />
export const DVDMakerIcon = (props: IconProps) => <Sheet name="dvdMaker" {...props} />
export const MeetingSpaceIcon = (props: IconProps) => <Sheet name="meetingSpace" {...props} />
export const WelcomeCenterIcon = (props: IconProps) => <Sheet name="welcomeCenter" {...props} />
