import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DatePicker } from '@/components/organisms/date-picker.tsx'

const meta: Meta = {
  title: 'Organisms/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function offsetFromToday(daysAhead: number) {
  const d = startOfToday()
  d.setDate(d.getDate() + daysAhead)
  return d
}

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(offsetFromToday(1))
    return <DatePicker value={date} onChange={setDate} />
  },
}

export const PastDisabled: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(offsetFromToday(1))
    return (
      <DatePicker
        value={date}
        onChange={setDate}
        disabled={{ before: startOfToday() }}
      />
    )
  },
}

export const WithUnavailableDates: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(offsetFromToday(1))
    return (
      <DatePicker
        value={date}
        onChange={setDate}
        disabled={{ before: startOfToday() }}
        unavailable={[
          offsetFromToday(2),
          offsetFromToday(5),
          offsetFromToday(9),
          offsetFromToday(12),
        ]}
      />
    )
  },
}
