import type { Meta, StoryObj } from '@storybook/react-vite'
import { SlidersHorizontal } from 'lucide-react'

import { SectionLabel } from '@/components/atoms/section-label.tsx'

const meta = {
  title: 'Atoms/SectionLabel',
  component: SectionLabel,
  tags: ['autodocs'],
  args: { children: 'All orders' },
  argTypes: {
    as: { control: 'inline-radio', options: ['span', 'div', 'dt'] },
    children: { control: 'text' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SectionLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithIcon: Story = {
  render: () => (
    <SectionLabel>
      <span className="inline-flex items-center gap-1">
        <SlidersHorizontal size={12} strokeWidth={2} aria-hidden />
        Price
      </span>
    </SectionLabel>
  ),
}

export const AsDt: Story = {
  render: () => (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-[var(--radius-lg)] border border-border bg-card px-5 py-4">
      <SectionLabel as="dt">Member name</SectionLabel>
      <dd className="text-sm">Sok Sreymom</dd>
      <SectionLabel as="dt">Coverage</SectionLabel>
      <dd className="text-sm">Both</dd>
      <SectionLabel as="dt">Active until</SectionLabel>
      <dd className="text-sm">12/2027</dd>
    </dl>
  ),
}

export const Playground: Story = {
  args: { children: 'Panels' },
}
