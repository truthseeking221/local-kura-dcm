import type { Meta, StoryObj } from '@storybook/react-vite'

import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Label } from '@/components/ui/label.tsx'

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="consent" />
      <Label htmlFor="consent">I consent to the digital intake form.</Label>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="s1" />
        <Label htmlFor="s1">Unchecked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="s2" defaultChecked />
        <Label htmlFor="s2">Checked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="s3" defaultChecked="indeterminate" />
        <Label htmlFor="s3">Indeterminate</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="s4" disabled />
        <Label htmlFor="s4" className="text-muted-foreground">Disabled</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="s5" disabled defaultChecked />
        <Label htmlFor="s5" className="text-muted-foreground">Disabled checked</Label>
      </div>
    </div>
  ),
}
