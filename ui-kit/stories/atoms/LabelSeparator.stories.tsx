import type { Meta, StoryObj } from '@storybook/react-vite'

import { LabelSeparator } from '@/components/atoms/label-separator.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'

const meta = {
  title: 'Atoms/LabelSeparator',
  component: LabelSeparator,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof LabelSeparator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-96">
      <LabelSeparator>or capture new</LabelSeparator>
    </div>
  ),
}

export const BetweenFields: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ref-code">Booking / referral code</Label>
        <Input id="ref-code" placeholder="BC-9X4-2KQ7" />
      </div>
      <LabelSeparator>or capture new</LabelSeparator>
      <div className="space-y-1.5">
        <Label htmlFor="walk-in">Walk-in name</Label>
        <Input id="walk-in" placeholder="First Last" />
      </div>
    </div>
  ),
}

export const ShortLabel: Story = {
  render: () => (
    <div className="w-96">
      <LabelSeparator>or</LabelSeparator>
    </div>
  ),
}

export const LongLabel: Story = {
  render: () => (
    <div className="w-96">
      <LabelSeparator>continue without booking code</LabelSeparator>
    </div>
  ),
}
