import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Kbd } from '@/components/atoms/kbd.tsx'
import { SearchInput } from '@/components/molecules/search-input.tsx'

const meta = {
  title: 'Molecules/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SearchInput>

export default meta
type Story = StoryObj<typeof meta>

export const GlobalSearch: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className="w-[480px]">
        <SearchInput
          placeholder="Search patient, phone, VID, booking"
          trailing={<Kbd>⌘K</Kbd>}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onClear={() => setValue('')}
        />
      </div>
    )
  },
}

export const CatalogSearch: Story = {
  render: () => {
    const [value, setValue] = useState('CBC')
    return (
      <div className="w-[480px]">
        <SearchInput
          placeholder="Search test, service, package"
          trailing={<Kbd>/</Kbd>}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onClear={() => setValue('')}
        />
      </div>
    )
  },
}

export const PlainNoTrailing: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className="w-80">
        <SearchInput
          placeholder="Search patient · name, phone, ID, queue"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onClear={() => setValue('')}
        />
      </div>
    )
  },
}

export const Compact: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className="w-[280px] rounded-[var(--radius-lg)] border border-border bg-card p-3">
        <SearchInput
          density="compact"
          placeholder="Search tests…"
          trailing={<Kbd>⌘K</Kbd>}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onClear={() => setValue('')}
        />
      </div>
    )
  },
}
