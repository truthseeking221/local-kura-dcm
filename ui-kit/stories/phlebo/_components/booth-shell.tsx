import type { ReactNode } from 'react'

import { Icon } from '@/components/atoms/icon.tsx'
import { Kbd } from '@/components/atoms/kbd.tsx'
import { MetaPill } from '@/components/atoms/meta-pill.tsx'
import { AppHeader } from '@/components/organisms/app-header.tsx'
import { AppSidebar, SidebarNavItem, useSidebar } from '@/components/organisms/app-sidebar.tsx'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'

import type { BoothSection } from '../_fixtures/phlebo.ts'

type PhleboBoothShellProps = {
  active: BoothSection
  patientLoaded?: boolean
  queueCount?: number
  children: ReactNode
}

const NAV: {
  id: BoothSection
  label: string
  icon: string
}[] = [
  { id: 'vitals', label: 'Vital Signs', icon: 'tabler:heart' },
  { id: 'phlebotomy', label: 'Phlebotomy', icon: 'tabler:flask' },
  { id: 'inspector', label: 'Tube Inspector', icon: 'tabler:scan' },
]

function roleLabel(section: BoothSection) {
  if (section === 'vitals') return 'Vital Signs'
  if (section === 'phlebotomy') return 'Phlebotomy'
  return 'Tube Inspector'
}

function profileRole(section: BoothSection) {
  if (section === 'phlebotomy') return 'Phlebotomist'
  return 'Nurse'
}

function Wordmark() {
  const { collapsed } = useSidebar()
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="inline-flex size-8 items-center justify-center rounded-[var(--radius)] bg-[var(--brand-50)] text-base font-black text-[var(--brand-700)]"
      >
        K
      </span>
      {!collapsed ? (
        <span className="min-w-0 text-sm font-bold text-[var(--ink-900)]">
          Kura <span className="font-medium text-[var(--ink-500)]">Booth</span>
        </span>
      ) : null}
    </div>
  )
}

function SidebarFooter() {
  const { collapsed } = useSidebar()
  return (
    <div className="grid gap-2">
      <button
        type="button"
        className="inline-flex h-9 items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-2 text-k-body font-medium text-[var(--ink-700)]"
        title={collapsed ? 'English' : undefined}
      >
        <Icon name="tabler:world" size={14} className="text-[var(--ink-500)]" />
        {!collapsed ? (
          <>
            <span className="flex-1 text-left">English</span>
            <Icon name="tabler:chevron-down" size={14} className="text-[var(--ink-400)]" />
          </>
        ) : null}
      </button>
    </div>
  )
}

function PillButton({ children }: { children: ReactNode }) {
  return (
    <Button variant="outline" size="sm" className="h-9 gap-2 bg-[var(--surface)] px-3">
      {children}
      <Icon name="tabler:chevron-down" size={14} className="text-[var(--ink-400)]" />
    </Button>
  )
}

function QueueButton({ count }: { count?: number }) {
  return (
    <Button variant="outline" size="sm" className="h-9 gap-2 bg-[var(--surface)] px-3">
      <Icon name="tabler:users" size={14} />
      Queue
      <Badge variant="info" className="px-1.5">
        {count ?? 0}
      </Badge>
    </Button>
  )
}

function NotificationsButton() {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="relative text-[var(--ink-500)]"
      aria-label="Notifications, 3 unread"
    >
      <Icon name="tabler:bell" size={16} />
      <span className="absolute right-0 top-0 inline-flex size-4 items-center justify-center rounded-full bg-[var(--danger-500)] text-k-xs font-bold leading-none text-[var(--ink-0)]">
        3
      </span>
    </Button>
  )
}

function ProfileButton({ section }: { section: BoothSection }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] py-1 pl-1 pr-3 text-left transition-colors hover:bg-[var(--surface-2)]"
    >
      <Avatar className="size-8">
        <AvatarFallback className="bg-[var(--brand-500)] text-k-xs font-bold text-[var(--ink-0)]">
          LN
        </AvatarFallback>
      </Avatar>
      <span className="flex flex-col leading-tight">
        <span className="text-k-sm font-bold text-[var(--ink-900)]">Linh Nguyen</span>
        <span className="text-k-xs text-[var(--ink-500)]">{profileRole(section)}</span>
      </span>
    </button>
  )
}

function HeaderLeft({ active, patientLoaded }: { active: BoothSection; patientLoaded?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {patientLoaded ? (
        <Button variant="outline" size="sm" className="h-9 bg-[var(--surface)]">
          <Icon name="tabler:chevron-left" size={16} />
          Scan another
        </Button>
      ) : null}
      <div className="min-w-28">
        <div className="text-k-xs font-semibold uppercase tracking-k-caps text-[var(--ink-500)]">
          Booth
        </div>
        <div className="text-k-body font-black leading-none text-[var(--ink-900)]">
          {roleLabel(active)}
        </div>
      </div>
      <PillButton>PSC-01</PillButton>
      <PillButton>Shift: Morning</PillButton>
    </div>
  )
}

export function PhleboBoothShell({
  active,
  patientLoaded = false,
  queueCount,
  children,
}: PhleboBoothShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--ink-900)]">
      <AppSidebar header={<Wordmark />} footer={<SidebarFooter />} expandedWidth={232}>
        {NAV.map((item) => (
          <SidebarNavItem
            key={item.id}
            icon={<Icon name={item.icon} />}
            label={item.label}
            active={active === item.id}
          />
        ))}
      </AppSidebar>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          left={<HeaderLeft active={active} patientLoaded={patientLoaded} />}
          right={
            <>
              {active !== 'inspector' ? <QueueButton count={queueCount} /> : null}
              <NotificationsButton />
              <ProfileButton section={active} />
            </>
          }
          className="h-16 px-6"
        />
        <main className="min-h-0 flex-1 overflow-auto bg-[var(--bg)]">
          {children}
        </main>
      </div>
    </div>
  )
}

export function ShortcutHint() {
  return (
    <p className="text-center text-k-xs text-[var(--ink-500)]">
      <Kbd>Enter</Kbd> submit / <Kbd>Esc</Kbd> clear / scanner sends both for you
    </p>
  )
}

export function ActiveRoleMeta({ section }: { section: BoothSection }) {
  return <MetaPill icon={<Icon name="tabler:building-hospital" />}>{roleLabel(section)}</MetaPill>
}
