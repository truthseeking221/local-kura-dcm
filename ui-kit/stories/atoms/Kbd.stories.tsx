import type { Meta, StoryObj } from '@storybook/react-vite'

import { Kbd } from '@/components/atoms/kbd.tsx'

const meta = {
  title: 'Atoms/Kbd',
  component: Kbd,
  tags: ['autodocs'],
  args: { children: '⌘K' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Set: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Kbd>⌘K</Kbd>
      <Kbd>F1</Kbd>
      <Kbd>F6</Kbd>
      <Kbd>Ctrl+N</Kbd>
      <Kbd>Space</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>/</Kbd>
      <Kbd>↑</Kbd>
      <Kbd>↓</Kbd>
    </div>
  ),
}

export const InContext: Story = {
  render: () => (
    <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card px-4 py-2 text-sm">
      <span className="text-muted-foreground">Search</span>
      <span className="flex-1" />
      <Kbd>⌘K</Kbd>
    </div>
  ),
}
