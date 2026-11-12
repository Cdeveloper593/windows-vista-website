import { ExplorerWindow, type ExplorerGroup } from './ExplorerWindow'
import {
  DocumentsFolderIcon,
  DownloadsFolderIcon,
  DvdDriveIcon,
  FileExplorerIcon,
  GamesFolderIcon,
  HardDriveIcon,
  MusicFolderIcon,
  PicturesFolderIcon,
  VideosFolderIcon,
} from '../icons'

/** Vista "Computer" view: the drives and user folders a fresh File Explorer opens to. */
const COMPUTER_GROUPS: ExplorerGroup[] = [
  {
    label: 'Hard Disk Drives',
    items: [
      {
        label: 'Local Disk (C:)',
        icon: <HardDriveIcon size={40} title="Local Disk (C:)" />,
        description: '37.2 GB free of 74.5 GB',
      },
    ],
  },
  {
    label: 'Devices with Removable Storage',
    items: [
      {
        label: 'DVD RW Drive (D:)',
        icon: <DvdDriveIcon size={40} title="DVD RW Drive (D:)" />,
        description: 'CD/DVD',
      },
    ],
  },
  {
    label: 'Folders',
    items: [
      {
        label: 'Documents',
        icon: <DocumentsFolderIcon size={40} title="Documents" />,
        description: 'File folder',
      },
      {
        label: 'Pictures',
        icon: <PicturesFolderIcon size={40} title="Pictures" />,
        description: 'File folder',
      },
      {
        label: 'Music',
        icon: <MusicFolderIcon size={40} title="Music" />,
        description: 'File folder',
      },
      {
        label: 'Videos',
        icon: <VideosFolderIcon size={40} title="Videos" />,
        description: 'File folder',
      },
      {
        label: 'Downloads',
        icon: <DownloadsFolderIcon size={40} title="Downloads" />,
        description: 'File folder',
      },
      {
        label: 'Games',
        icon: <GamesFolderIcon size={40} title="Games" />,
        description: 'File folder',
      },
    ],
  },
]

export function FileExplorerWindow() {
  return (
    <ExplorerWindow
      id="file-explorer"
      title="File Explorer"
      icon={<FileExplorerIcon size={118} title="File Explorer" />}
      statusNote="Computer"
      crumbs={['Computer']}
      groups={COMPUTER_GROUPS}
    />
  )
}
