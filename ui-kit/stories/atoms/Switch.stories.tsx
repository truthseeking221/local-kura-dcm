import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/components/ui/label.tsx'
import { Switch } from '@/components/ui/switch.tsx'

const meta = {
  title: 'Atoms/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="enable-otp" />
      <Label htmlFor="enable-otp">Auto-send OTP</Label>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Switch />
        <Label>Off</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch defaultChecked />
        <Label>On</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch disabled />
        <Label className="text-muted-foreground">Disabled</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch disabled defaultChecked />
        <Label className="text-muted-foreground">Disabled on</Label>
      </div>
    </div>
  ),
}
