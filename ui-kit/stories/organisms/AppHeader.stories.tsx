import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ReactNode } from 'react'

import { AppHeader } from '@/components/organisms/app-header.tsx'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx'
import { Button } from '@/components/ui/button.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta: Meta = {
  title: 'Organisms/AppHeader',
  component: AppHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

// ─── Header chrome pieces — receptionist composition ──────────────────────
// All chrome below uses kit tokens (`--surface`, `--surface-2`, `--border`,
// `--brand-200`, `--brand-700`, `--ink-400`, `--ink-500`, `--ink-700`,
// `--ink-900`, `--danger-500`). No hardcoded hex.

function PillButton({
  children,
  trailing,
  className = '',
}: {
  children: ReactNode
  trailing?: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      className={
        'inline-flex h-[34px] items-center gap-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[12.5px] font-semibold text-[var(--ink-700)] transition-colors hover:bg-[var(--surface-2)] ' +
        className
      }
    >
      {children}
      {trailing}
    </button>
  )
}

function HeaderSearch() {
  return (
    <div className="flex h-[34px] w-full max-w-[690px] items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3">
      <Icon name="tabler:search" size={15} aria-hidden className="text-[var(--ink-400)]" />
      <input
        type="search"
        placeholder="Search patient, phone, VID, booking"
        className="h-full flex-1 bg-transparent text-[13px] text-[var(--ink-700)] outline-none placeholder:text-[var(--ink-400)]"
      />
      <span
        aria-hidden
        className="inline-flex h-[18px] items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface-2)] px-1.5 font-mono text-[11px] font-bold leading-none tracking-wide text-[var(--ink-700)]"
      >
        ⌘ K
      </span>
    </div>
  )
}

function NotificationsButton({ count }: { count: number }) {
  return (
    <button
      type="button"
      aria-label={`Notifications (${count} unread)`}
      className="relative inline-flex size-[34px] items-center justify-center rounded-[var(--radius-xs)] text-[var(--ink-400)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink-700)]"
    >
      <Icon name="tabler:bell" size={16} />
      {count > 0 ? (
        <span
          aria-hidden
          className="absolute right-0.5 top-0.5 inline-flex size-[18px] items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--danger-500)] text-[10px] font-bold leading-none text-[var(--ink-0)]"
        >
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </button>
  )
}

function ProfileButton({
  initials,
  name,
  role,
}: {
  initials: string
  name: string
  role: string
}) {
  return (
    <button
      type="button"
      className="inline-flex h-[38px] items-center gap-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] py-1 pl-1 pr-2.5 transition-colors hover:bg-[var(--surface-2)]"
    >
      <Avatar className="size-7">
        <AvatarFallback className="bg-[var(--brand-500)] text-[11px] font-bold text-[var(--ink-0)]">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[12.5px] font-semibold text-[var(--ink-900)]">{name}</span>
        <span className="text-[11px] text-[var(--ink-500)]">{role}</span>
      </span>
    </button>
  )
}

function NewWalkInButton() {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-2 rounded-[var(--radius)] border border-[var(--brand-200)] bg-[var(--surface)] px-3.5 text-[13px] font-semibold text-[var(--brand-700)] transition-colors hover:bg-[var(--brand-50)]"
    >
      <Icon name="tabler:plus" size={16} />
      <span>New walk-in</span>
      <span
        aria-hidden
        className="inline-flex h-5 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-1.5 text-[10px] font-extrabold leading-none text-[var(--ink-500)]"
      >
        Ctrl+N
      </span>
    </button>
  )
}

export const ReceptionistChrome: Story = {
  render: () => (
    <AppHeader
      left={
        <>
          <PillButton trailing={<Icon name="tabler:chevron-down" size={14} className="text-[var(--ink-400)]" />}>
            PSC-01
          </PillButton>
          <PillButton trailing={<Icon name="tabler:chevron-down" size={14} className="text-[var(--ink-400)]" />}>
            Shift: Morning
          </PillButton>
        </>
      }
      center={<HeaderSearch />}
      right={
        <>
          <NotificationsButton count={3} />
          <ProfileButton initials="LN" name="Linh Nguyen" role="Receptionist" />
          <NewWalkInButton />
        </>
      }
    />
  ),
}

export const Minimal: Story = {
  render: () => (
    <AppHeader
      leading={<span className="font-semibold text-[var(--ink-900)]">Kura</span>}
      right={<Button>Sign in</Button>}
    />
  ),
}
