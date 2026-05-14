import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { SegmentedControl } from '@/components/molecules/segmented-control.tsx'

const meta = {
  title: 'Molecules/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
  args: {
    value: 'left',
    onValueChange: () => {},
    options: [
      { value: 'left', icon: 'tabler:armchair', label: 'Left' },
      { value: 'right', icon: 'tabler:armchair', label: 'Right' },
    ],
  },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('left')
    return (
      <SegmentedControl
        value={value}
        onValueChange={setValue}
        aria-label="Arm"
        options={[
          { value: 'left', icon: 'tabler:armchair', label: 'Left' },
          { value: 'right', icon: 'tabler:armchair', label: 'Right' },
        ]}
      />
    )
  },
}

export const Playground: Story = {
  render: () => {
    const [value, setValue] = useState('yes')
    return (
      <SegmentedControl
        value={value}
        onValueChange={setValue}
        aria-label="Fasting confirmed"
        options={[
          { value: 'yes', icon: 'tabler:check', label: 'Yes' },
          { value: 'no', icon: 'tabler:x', label: 'No' },
        ]}
      />
    )
  },
}

export const LabelOnly: Story = {
  render: () => {
    const [value, setValue] = useState('day')
    return (
      <SegmentedControl
        value={value}
        onValueChange={setValue}
        aria-label="Shift"
        options={[
          { value: 'day', label: 'Day' },
          { value: 'swing', label: 'Swing' },
          { value: 'night', label: 'Night' },
        ]}
      />
    )
  },
}

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState('left')
    return (
      <div className="grid gap-4">
        <SegmentedControl
          value={value}
          onValueChange={setValue}
          disabled
          aria-label="Arm (whole control disabled)"
          options={[
            { value: 'left', icon: 'tabler:armchair', label: 'Left' },
            { value: 'right', icon: 'tabler:armchair', label: 'Right' },
          ]}
        />
        <SegmentedControl
          value={value}
          onValueChange={setValue}
          aria-label="Arm (right option disabled)"
          options={[
            { value: 'left', icon: 'tabler:armchair', label: 'Left' },
            { value: 'right', icon: 'tabler:armchair', label: 'Right', disabled: true },
          ]}
        />
      </div>
    )
  },
}
