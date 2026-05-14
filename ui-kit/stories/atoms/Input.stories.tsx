import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta = {
  title: 'Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    placeholder: 'First Last',
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <Input {...args} />
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-72 space-y-1.5">
      <Label htmlFor="full-name">
        Full name (Latin) <span className="text-destructive">*</span>
      </Label>
      <Input id="full-name" placeholder="First Last" />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="grid w-72 gap-4">
      <div className="space-y-1.5">
        <Label>Default</Label>
        <Input placeholder="First Last" />
      </div>
      <div className="space-y-1.5">
        <Label>Filled</Label>
        <Input defaultValue="Sok Sreymom" />
      </div>
      <div className="space-y-1.5">
        <Label>Disabled</Label>
        <Input disabled placeholder="Disabled" />
      </div>
      <div className="space-y-1.5">
        <Label>Invalid</Label>
        <Input aria-invalid defaultValue="??" />
      </div>
      <div className="space-y-1.5">
        <Label>Read-only</Label>
        <Input readOnly defaultValue="BC-9X4-2KQ7" />
      </div>
    </div>
  ),
}

export const WithLeadingIcon: Story = {
  render: () => (
    <div className="relative w-72">
      <Icon
        name="tabler:search"
        size={16}
        strokeWidth={1.5}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input className="pl-9" placeholder="Search patient · name, phone, ID, queue" />
    </div>
  ),
}

export const DateMask: Story = {
  render: () => {
    const [dateOfBirth, setDateOfBirth] = useState('')

    return (
      <div className="grid w-72 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="dob-uncontrolled">
            Date of birth <span className="text-destructive">*</span>
          </Label>
          <Input id="dob-uncontrolled" mask="date" placeholder="DD-MM-YYYY" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dob-controlled">Controlled date</Label>
          <Input
            id="dob-controlled"
            mask="date"
            placeholder="DD-MM-YYYY"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.currentTarget.value)}
            aria-invalid={dateOfBirth.length > 0 && dateOfBirth.length < 10}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dob-prefilled">Prefilled date</Label>
          <Input id="dob-prefilled" mask="date" defaultValue="19021984" />
        </div>
      </div>
    )
  },
}
