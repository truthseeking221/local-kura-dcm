import type { Meta, StoryObj } from '@storybook/react-vite'

import { LockableField } from '@/components/atoms/lockable-field.tsx'
import { Label } from '@/components/ui/label.tsx'

const meta = {
  title: 'Atoms/LockableField',
  component: LockableField,
  tags: ['autodocs', 'module:receptionist', 'module:phlebo'],
  args: {
    locked: false,
    placeholder: 'Latin name',
  },
  argTypes: {
    locked: { control: 'boolean' },
    value: { control: 'text' },
    placeholder: { control: 'text' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof LockableField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <LockableField {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    locked: true,
    value: 'Maya Tran',
  },
  render: (args) => (
    <div className="w-80">
      <LockableField {...args} />
    </div>
  ),
}

export const Locked: Story = {
  args: {
    locked: true,
    value: 'Maya Tran',
    placeholder: 'Latin name',
  },
  render: (args) => (
    <div className="w-80">
      <LockableField {...args} readOnly />
    </div>
  ),
}

export const LockedAndUnlocked: Story = {
  render: () => (
    <div className="flex w-[640px] gap-6">
      <div className="flex-1 space-y-2">
        <Label className="text-xs text-muted-foreground">Unlocked</Label>
        <LockableField placeholder="Latin name" defaultValue="Maya Tran" />
      </div>
      <div className="flex-1 space-y-2">
        <Label className="text-xs text-muted-foreground">Locked</Label>
        <LockableField locked value="Maya Tran" readOnly />
      </div>
    </div>
  ),
}

export const WithIdentityForm: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <form className="grid w-[480px] gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="latin-name" className="text-xs text-muted-foreground">
          Latin name
        </Label>
        <LockableField id="latin-name" locked value="Maya Tran" readOnly />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dob" className="text-xs text-muted-foreground">
          Date of birth
        </Label>
        <LockableField id="dob" locked value="14 Feb 1996" readOnly />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="id-number" className="text-xs text-muted-foreground">
          ID number
        </Label>
        <LockableField id="id-number" locked value="012-345-6789" readOnly />
      </div>
      <p className="text-xs text-muted-foreground">
        All fields locked from a QR scan. Tab through to confirm focusability.
      </p>
    </form>
  ),
}
