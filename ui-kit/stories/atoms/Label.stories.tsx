import type { Meta, StoryObj } from '@storybook/react-vite'

import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Switch } from '@/components/ui/switch.tsx'

const meta = {
  title: 'Atoms/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-72 space-y-1.5">
      <Label htmlFor="mrn">MRN</Label>
      <Input id="mrn" placeholder="MRN-001-K" />
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="w-72 space-y-1.5">
      <Label htmlFor="full-name">
        Full name (Latin) <span className="text-destructive">*</span>
      </Label>
      <Input id="full-name" placeholder="First Last" />
    </div>
  ),
}

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="consent" />
      <Label htmlFor="consent">I confirm consent has been collected verbally</Label>
    </div>
  ),
}

export const WithSwitch: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="notifications" />
      <Label htmlFor="notifications">Send SMS reminders</Label>
    </div>
  ),
}

export const PeerDisabled: Story = {
  render: () => (
    <div className="w-72 space-y-1.5">
      <Input id="peer-input" className="peer" disabled placeholder="Disabled input" />
      <Label htmlFor="peer-input">Linked label dims via peer-disabled</Label>
    </div>
  ),
}

export const GroupDisabled: Story = {
  render: () => (
    <div className="group w-72 space-y-1.5" data-disabled="true">
      <Label htmlFor="group-input">Booking / referral code</Label>
      <Input id="group-input" disabled placeholder="BC-9X4-2KQ7" />
      <p className="text-xs text-muted-foreground">
        Wrap field group with <code>data-disabled=&quot;true&quot;</code> — label dims automatically.
      </p>
    </div>
  ),
}
