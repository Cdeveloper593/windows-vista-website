import { ExplorerWindow } from './ExplorerWindow'
import { RecycleBinIcon } from '../icons'

/**
 * Vista Recycle Bin: a white Details-view shell list (column headers even
 * when empty), the Empty command on the command bar, and the bin identity
 * in the bottom Details pane — no centered empty-folder card.
 */
export function RecycleBinWindow() {
  return (
    <ExplorerWindow
      id="recycle-bin"
      title="Recycle Bin"
      addressIcon={<RecycleBinIcon size={16} />}
      crumbs={['Recycle Bin']}
      commands={[
        { label: 'Organize', dropdown: true },
        { label: 'Views', dropdown: true },
        { label: 'Empty the Recycle Bin' },
      ]}
      details={{
        icon: <RecycleBinIcon size={48} title="Recycle Bin" />,
        title: 'Recycle Bin',
        lines: ['0 items'],
      }}
      listColumns={['Name', 'Original Location', 'Date Deleted', 'Size', 'Item Type']}
    />
  )
}
