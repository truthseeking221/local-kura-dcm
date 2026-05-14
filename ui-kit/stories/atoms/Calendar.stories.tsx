import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Calendar } from '@/components/ui/calendar.tsx'

const meta = {
  title: 'Atoms/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    return <Calendar mode="single" selected={date} onSelect={setDate} />
  },
}

export const WithDisabledPast: Story = {
  render: () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [date, setDate] = useState<Date | undefined>(today)
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabled={{ before: today }}
      />
    )
  },
}
