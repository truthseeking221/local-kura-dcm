import type { Meta, StoryObj } from '@storybook/react-vite'

import { LabelSeparator } from '@/components/atoms/label-separator.tsx'
import { Separator } from '@/components/ui/separator.tsx'

const meta = {
  title: 'Atoms/Separator',
  component: Separator,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="w-80 space-y-3">
      <p className="text-sm">Booking / referral code</p>
      <Separator />
      <p className="text-sm text-muted-foreground">
        Start here when the patient already has a booking, prescription, or teleconsult code.
      </p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-12 items-center gap-4">
      <span className="text-sm">PSC-01</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Shift: Morning</span>
      <Separator orientation="vertical" />
      <span className="text-sm">2 items</span>
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <p className="text-sm">Booking / referral code field above</p>
      <LabelSeparator>or capture new</LabelSeparator>
      <p className="text-sm">Capture-method cards below</p>
    </div>
  ),
}
