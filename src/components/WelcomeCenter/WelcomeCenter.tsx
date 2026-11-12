import type { ReactNode } from 'react'
import { Window } from '../Window/Window'
import { ShellNavControls } from '../ShellToolbar/ShellNavControls'
import { ShellToolbar } from '../ShellToolbar/ShellToolbar'
import {
  FlowerAvatarIcon,
  VistaMonitorIcon,
  GreenDiamondIcon,
  TransferFilesIcon,
  AddUsersIcon,
  WhatsNewIcon,
  PersonalizeIcon,
  FindFastIcon,
  ProtectPCIcon,
  ConnectShareIcon,
  ProtectMoreIcon,
  ViewDetailsIcon,
  ConnectInternetIcon,
  CheckUpdatesIcon,
  GetStartedIcon,
} from '../icons'
import styles from './WelcomeCenter.module.css'

interface LinkItem {
  id: string
  icon: ReactNode
  label: string
}

const LEFT_SECTION_1: LinkItem[] = [
  { id: 'details', icon: <ViewDetailsIcon size={42} />, label: 'View computer details' },
  { id: 'internet', icon: <ConnectInternetIcon size={42} />, label: 'Connect to the Internet' },
]
const LEFT_SECTION_2: LinkItem[] = [
  { id: 'updates', icon: <CheckUpdatesIcon size={42} />, label: 'Check for updates' },
  { id: 'started', icon: <GetStartedIcon size={42} />, label: 'Get started with Windows' },
]
const RIGHT_SECTION_1: LinkItem[] = [
  { id: 'transfer', icon: <TransferFilesIcon size={42} />, label: 'Transfer files and settings' },
  { id: 'addusers', icon: <AddUsersIcon size={42} />, label: 'Add new users' },
  { id: 'whatsnew', icon: <WhatsNewIcon size={42} />, label: "What's new in Windows Vista" },
  { id: 'personalize', icon: <PersonalizeIcon size={42} />, label: 'Personalize Windows' },
]
const FIND_FAST: LinkItem = {
  id: 'findfast',
  icon: <FindFastIcon size={42} />,
  label: 'Go online to find it fast with Windows Live',
}
const PROTECT_PC: LinkItem = {
  id: 'protect',
  icon: <ProtectPCIcon size={42} />,
  label: 'Go online to help protect your PC with Windows Live',
}
const CONNECT_SHARE: LinkItem = {
  id: 'connect',
  icon: <ConnectShareIcon size={42} />,
  label: 'Go online to connect and share with Windows Live',
}
const PROTECT_MORE: LinkItem = {
  id: 'protectmore',
  icon: <ProtectMoreIcon size={42} />,
  label: 'Go online to find more ways to help protect your PC',
}
// reference ordering: row = [find it fast | help protect], then [connect and share | find more ways]
const SECTION_2_LEFT: LinkItem[] = [FIND_FAST, CONNECT_SHARE]
const SECTION_2_RIGHT: LinkItem[] = [PROTECT_PC, PROTECT_MORE]

function LinkRow({ item }: { item: LinkItem }) {
  return (
    <button type="button" className={styles.linkRow}>
      <span className={styles.linkIcon}>{item.icon}</span>
      <span className={styles.linkLabel}>{item.label}</span>
    </button>
  )
}

export function WelcomeCenter() {
  return (
    <Window
      id="welcome"
      title="Welcome Center"
      navControls={<ShellNavControls />}
      toolbar={
        <ShellToolbar
          crumbs={['System and Maintenance', 'Welcome Center']}
          searchPlaceholder="Search"
        />
      }
      bodyClassName={styles.body}
    >
      {/* ======= header (teal glass panel) ======= */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.avatarFrame}>
            <FlowerAvatarIcon size={42} />
          </span>
          <h1 className={styles.userName}>John Doe</h1>
          <button type="button" className={styles.detailsLink}>
            <GreenDiamondIcon size={13} />
            <span>Show more details</span>
          </button>
        </div>

        <div className={styles.headerBottom}>
          <VistaMonitorIcon size={96} className={styles.monitor} title="Computer" />
          <div className={styles.specs}>
            <p className={styles.osName}>Windows Vista™ Ultimate</p>
            <p>Intel(R) Core(TM) i5-7200U CPU @ 2.50GHz</p>
            <p>4.00 GB RAM</p>
            <p>VMware SVGA 3D</p>
            <p>Computer Name: WIN-2VUPHEZ0UCS</p>
          </div>
        </div>

        <div className={styles.watermark} aria-hidden="true">
          welcome
        </div>
      </header>

      {/* ======= body (white, two sections) ======= */}
      <div className={styles.sections}>
        <div className={styles.sectionGrid}>
          <div className={styles.column}>
            {LEFT_SECTION_1.map((item) => (
              <LinkRow key={item.id} item={item} />
            ))}
          </div>
          <div className={styles.columnSplit}>
            <div className={styles.subColumn}>
              {RIGHT_SECTION_1.slice(0, 2).map((item) => (
                <LinkRow key={item.id} item={item} />
              ))}
            </div>
            <div className={styles.subColumn}>
              {RIGHT_SECTION_1.slice(2).map((item) => (
                <LinkRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.sectionDivider} role="separator" />

        <div className={styles.sectionGrid}>
          <div className={styles.column}>
            {LEFT_SECTION_2.map((item) => (
              <LinkRow key={item.id} item={item} />
            ))}
          </div>
          <div className={styles.columnSplit}>
            <div className={styles.subColumn}>
              {SECTION_2_LEFT.map((item) => (
                <LinkRow key={item.id} item={item} />
              ))}
            </div>
            <div className={styles.subColumn}>
              {SECTION_2_RIGHT.map((item) => (
                <LinkRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Window>
  )
}
