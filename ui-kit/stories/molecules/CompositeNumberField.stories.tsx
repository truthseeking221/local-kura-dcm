import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { CompositeNumberField } from '@/components/molecules/composite-number-field.tsx'

const meta = {
  title: 'Molecules/CompositeNumberField',
  component: CompositeNumberField,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
  args: {
    label: 'Blood Pressure',
    fields: [
      { name: 'systolic', 'aria-label': 'Systolic' },
      { name: 'diastolic', 'aria-label': 'Diastolic' },
    ],
    separator: '/',
    unit: 'mmHg',
  },
} satisfies Meta<typeof CompositeNumberField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <CompositeNumberField {...args} />
    </div>
  ),
}

export const Required: Story = {
  args: {
    required: true,
    hint: '80-200 / 40-130',
    fields: [
      { name: 'systolic', 'aria-label': 'Systolic', defaultValue: 120 },
      { name: 'diastolic', 'aria-label': 'Diastolic', defaultValue: 80 },
    ],
  },
  render: (args) => (
    <div className="w-80">
      <CompositeNumberField {...args} />
    </div>
  ),
}

export const Playground: Story = {
  render: () => {
    const [sys, setSys] = useState('120')
    const [dia, setDia] = useState('80')
    return (
      <div className="w-80">
        <CompositeNumberField
          label="Blood Pressure"
          required
          hint="80-200 / 40-130"
          unit="mmHg"
          separator="/"
          fields={[
            {
              name: 'systolic',
              'aria-label': 'Systolic',
              value: sys,
              onChange: (event) => setSys(event.target.value),
            },
            {
              name: 'diastolic',
              'aria-label': 'Diastolic',
              value: dia,
              onChange: (event) => setDia(event.target.value),
            },
          ]}
        />
      </div>
    )
  },
}

export const ThreeFieldsExample: Story = {
  args: {
    label: 'Duration',
    hint: 'hh : mm : ss',
    unit: undefined,
    separator: ':',
    fields: [
      { name: 'hours', 'aria-label': 'Hours', defaultValue: 1, min: 0, max: 23 },
      { name: 'minutes', 'aria-label': 'Minutes', defaultValue: 30, min: 0, max: 59 },
      { name: 'seconds', 'aria-label': 'Seconds', defaultValue: 0, min: 0, max: 59 },
    ],
  },
  render: (args) => (
    <div className="w-80">
      <CompositeNumberField {...args} />
    </div>
  ),
}
