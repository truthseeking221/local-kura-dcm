import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { FilterChip, type FilterChipTone } from '@/components/molecules/filter-chip.tsx'
import {
  CommandPalette as KitCommandPalette,
  CommandSection,
} from '@/components/organisms'
import { CommandItem } from '@/components/ui/command'

const meta = {
  title: 'Molecules/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
  args: {
    value: 'all',
    label: 'All',
    active: false,
    onClick: () => {},
  },
  argTypes: {
    tone: {
      control: 'select',
      options: [undefined, 'neutral', 'info', 'success', 'warning', 'danger', 'ai'],
    },
    count: { control: { type: 'number', min: 0 } },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FilterChip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    value: 'needs-attention',
    label: 'Needs attention',
    tone: 'danger',
    count: 3,
    active: true,
  },
}

const TONES: FilterChipTone[] = ['neutral', 'info', 'success', 'warning', 'danger', 'ai']

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {TONES.map((t) => (
        <FilterChip
          key={t}
          value={t}
          label={t[0]!.toUpperCase() + t.slice(1)}
          tone={t}
          onClick={() => {}}
        />
      ))}
    </div>
  ),
}

export const Active: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip value="all" label="All" onClick={() => {}} />
        {TONES.map((t) => (
          <FilterChip
            key={t}
            value={t}
            label={t[0]!.toUpperCase() + t.slice(1)}
            tone={t}
            onClick={() => {}}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip value="all" label="All" active onClick={() => {}} />
        {TONES.map((t) => (
          <FilterChip
            key={t}
            value={t}
            label={t[0]!.toUpperCase() + t.slice(1)}
            tone={t}
            active
            onClick={() => {}}
          />
        ))}
      </div>
    </div>
  ),
}

export const WithCount: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <FilterChip value="all" label="All" onClick={() => {}} />
      <FilterChip
        value="needs-attention"
        label="Needs attention"
        tone="danger"
        count={3}
        onClick={() => {}}
      />
      <FilterChip
        value="in-progress"
        label="In progress"
        tone="info"
        count={1}
        onClick={() => {}}
      />
      <FilterChip value="done" label="Done" tone="success" count={1} onClick={() => {}} />
      <FilterChip
        value="empty"
        label="Empty filter"
        tone="neutral"
        count={0}
        onClick={() => {}}
      />
    </div>
  ),
}

type CommandFilter = 'all' | 'needs-attention' | 'in-progress' | 'done'

const COMMAND_COUNTS: Record<CommandFilter, number | undefined> = {
  all: undefined,
  'needs-attention': 3,
  'in-progress': 1,
  done: 1,
}

const COMMAND_ITEMS: { value: CommandFilter; label: string; tone?: FilterChipTone }[] = [
  { value: 'all', label: 'All' },
  { value: 'needs-attention', label: 'Needs attention', tone: 'danger' },
  { value: 'in-progress', label: 'In progress', tone: 'info' },
  { value: 'done', label: 'Done', tone: 'success' },
]

function CommandPaletteFilterRow() {
  const [filter, setFilter] = useState<CommandFilter>('all')
  return (
    <KitCommandPalette
      open
      onOpenChange={() => {}}
      placeholder="Search patient, phone, VID, booking"
      filters={
        <>
          {COMMAND_ITEMS.map((it) => (
            <FilterChip
              key={it.value}
              value={it.value}
              label={it.label}
              tone={it.tone}
              count={COMMAND_COUNTS[it.value]}
              active={filter === it.value}
              onClick={() => setFilter(it.value)}
            />
          ))}
        </>
      }
      emptyText="Start typing to search."
    >
      <CommandSection heading="Patients">
        <CommandItem value="placeholder">No results yet — story is filter-only.</CommandItem>
      </CommandSection>
    </KitCommandPalette>
  )
}

export const InCommandPalette: Story = {
  render: () => <CommandPaletteFilterRow />,
}
