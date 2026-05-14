import type { Meta, StoryObj } from '@storybook/react-vite'

import { SpecialtyBadge } from '@/components/atoms/specialty-badge.tsx'

const meta = {
  title: 'Atoms/SpecialtyBadge',
  component: SpecialtyBadge,
  tags: ['autodocs', 'module:receptionist'],
  args: {
    tone: 'haem',
    children: 'HAEM',
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['haem', 'biochem', 'urine', 'vitals', 'popular'],
    },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SpecialtyBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  name: 'All tones',
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <SpecialtyBadge tone="haem">HAEM</SpecialtyBadge>
      <SpecialtyBadge tone="biochem">BIOCHEM</SpecialtyBadge>
      <SpecialtyBadge tone="urine">URINE</SpecialtyBadge>
      <SpecialtyBadge tone="vitals">VITALS</SpecialtyBadge>
      <SpecialtyBadge tone="popular">POPULAR</SpecialtyBadge>
    </div>
  ),
}

export const PairedInRow: Story = {
  name: 'POPULAR alongside category (verify no collision)',
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <SpecialtyBadge tone="haem">HAEM</SpecialtyBadge>
        <SpecialtyBadge tone="popular">POPULAR</SpecialtyBadge>
      </div>
      <div className="flex items-center gap-1">
        <SpecialtyBadge tone="biochem">BIOCHEM</SpecialtyBadge>
        <SpecialtyBadge tone="popular">POPULAR</SpecialtyBadge>
      </div>
      <div className="flex items-center gap-1">
        <SpecialtyBadge tone="urine">URINE</SpecialtyBadge>
        <SpecialtyBadge tone="popular">POPULAR</SpecialtyBadge>
      </div>
    </div>
  ),
}

export const Playground: Story = {}
