import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { BookingCalendar } from '@/components/molecules/booking-calendar.tsx'

const meta = {
  title: 'Molecules/BookingCalendar',
  component: BookingCalendar,
  tags: ['autodocs', 'module:receptionist', 'module:phlebo'],
  args: {
    month: new Date(2026, 4, 1),
    selected: new Date(2026, 4, 12),
    onMonthChange: () => {},
    onSelect: () => {},
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BookingCalendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'May 2026 — single-select',
  render: () => {
    const [month, setMonth] = useState(new Date(2026, 4, 1))
    const [selected, setSelected] = useState<Date | undefined>(new Date(2026, 4, 12))
    return (
      <div className="w-[420px]">
        <BookingCalendar
          month={month}
          onMonthChange={setMonth}
          selected={selected}
          onSelect={setSelected}
        />
      </div>
    )
  },
}

export const WithDisabledDays: Story = {
  name: 'With explicit disabled dates',
  render: () => {
    const [month, setMonth] = useState(new Date(2026, 4, 1))
    const [selected, setSelected] = useState<Date | undefined>()
    return (
      <div className="w-[420px]">
        <BookingCalendar
          month={month}
          onMonthChange={setMonth}
          selected={selected}
          onSelect={setSelected}
          disabled={[new Date(2026, 4, 8), new Date(2026, 4, 22)]}
        />
      </div>
    )
  },
}

export const DisablePast: Story = {
  name: 'Disable past via predicate',
  render: () => {
    const [month, setMonth] = useState(new Date(2026, 4, 1))
    const [selected, setSelected] = useState<Date | undefined>()
    return (
      <div className="w-[420px]">
        <BookingCalendar
          month={month}
          onMonthChange={setMonth}
          selected={selected}
          onSelect={setSelected}
          disabled={(date) => date < new Date(2026, 4, 11)}
        />
      </div>
    )
  },
}
