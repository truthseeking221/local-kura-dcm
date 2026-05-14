import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { StatusDot } from '@/components/atoms/status-dot.tsx'
import { CommandPalette, CommandSection } from '@/components/organisms/command-palette.tsx'
import { Button } from '@/components/ui/button.tsx'
import { CommandItem, CommandShortcut } from '@/components/ui/command.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta: Meta = {
  title: 'Organisms/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

function FilterChip({
  active,
  tone,
  count,
  children,
  onClick,
}: {
  active?: boolean
  tone?: 'danger' | 'info' | 'success' | 'neutral'
  count?: number
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active || undefined}
      className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-muted px-2.5 py-1 text-xs transition-colors data-[active]:border-[var(--brand-500)] data-[active]:bg-[var(--ink-900)] data-[active]:text-[var(--ink-0)]"
    >
      {tone ? <StatusDot tone={tone} /> : null}
      <span>{children}</span>
      {typeof count === 'number' ? (
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{count}</span>
      ) : null}
    </button>
  )
}

export const ReceptionistSearch: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    const [filter, setFilter] = useState<'all' | 'attention' | 'progress' | 'done'>('all')

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open command palette</Button>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          placeholder="Search patient, phone, VID, booking"
          filters={
            <>
              <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
                All
              </FilterChip>
              <FilterChip
                active={filter === 'attention'}
                tone="danger"
                count={0}
                onClick={() => setFilter('attention')}
              >
                Needs attention
              </FilterChip>
              <FilterChip
                active={filter === 'progress'}
                tone="info"
                count={1}
                onClick={() => setFilter('progress')}
              >
                In progress
              </FilterChip>
              <FilterChip
                active={filter === 'done'}
                tone="success"
                count={1}
                onClick={() => setFilter('done')}
              >
                Done
              </FilterChip>
            </>
          }
        >
          <CommandSection heading="Recent searches">
            <CommandItem>
              <Icon name="tabler:clock" />
              Sok Sreymom
              <span className="ml-auto text-xs text-muted-foreground">Q-001 · Done</span>
            </CommandItem>
            <CommandItem>
              <Icon name="tabler:user" />
              Bao Nguyen
              <span className="ml-auto text-xs text-muted-foreground">Q-014 · In progress</span>
            </CommandItem>
          </CommandSection>
          <CommandSection heading="Quick action" separated>
            <CommandItem>
              <Icon name="tabler:plus" />
              New walk-in
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Icon name="tabler:calendar" />
              Open today's queue
              <CommandShortcut>⌘Q</CommandShortcut>
            </CommandItem>
          </CommandSection>
        </CommandPalette>
      </>
    )
  },
}

export const NoFilters: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <CommandPalette open={open} onOpenChange={setOpen} placeholder="Type a command…">
          <CommandSection heading="Quick action">
            <CommandItem>
              <Icon name="tabler:plus" />
              New walk-in
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
          </CommandSection>
        </CommandPalette>
      </>
    )
  },
}
