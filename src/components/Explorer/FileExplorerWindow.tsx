import { ExplorerWindow, type ExplorerGroup } from './ExplorerWindow'
import { ComputerIcon, DvdDriveIcon, HardDriveIcon } from '../icons'

/**
 * Vista "Computer" view: drive groups only — personal folders live in the
 * navigation pane / user folder, not at the Computer root. The hard drive
 * carries the Tiles-view capacity gauge; the empty optical drive has none.
 */
const COMPUTER_GROUPS: ExplorerGroup[] = [
  {
    label: 'Hard Disk Drives',
    items: [
      {
        label: 'Local Disk (C:)',
        icon: <HardDriveIcon size={40} title="Local Disk (C:)" />,
        capacity: { usedPercent: 50, text: '37.2 GB free of 74.5 GB' },
      },
    ],
  },
  {
    label: 'Devices with Removable Storage',
    items: [
      {
        label: 'DVD RW Drive (D:)',
        icon: <DvdDriveIcon size={40} title="DVD RW Drive (D:)" />,
      },
    ],
  },
]

export function FileExplorerWindow() {
  return (
    <ExplorerWindow
      id="file-explorer"
      title="Computer"
      addressIcon={<ComputerIcon size={16} />}
      crumbs={['Computer']}
      commands={[
        { label: 'Organize', dropdown: true },
        { label: 'Views', dropdown: true },
        { label: 'System properties' },
        { label: 'Uninstall or change a program' },
        { label: 'Map network drive' },
      ]}
      details={{
        icon: <ComputerIcon size={48} title="Computer" />,
        title: 'Computer',
      }}
      groups={COMPUTER_GROUPS}
    />
  )
}
