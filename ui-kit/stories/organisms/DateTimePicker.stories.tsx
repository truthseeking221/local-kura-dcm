import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DateTimePicker } from '@/components/organisms/date-time-picker.tsx'
import { type TimeSlot } from '@/components/organisms/time-slot-picker.tsx'
import { Button } from '@/components/ui/button.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta: Meta = {
  title: 'Organisms/DateTimePicker',
  component: DateTimePicker,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

const SLOTS: TimeSlot[] = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30',
].map((value) => ({ value }))

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function offsetFromToday(days: number) {
  const d = startOfToday()
  d.setDate(d.getDate() + days)
  return d
}

export const TeleconsultBooking: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(offsetFromToday(1))
    const [time, setTime] = useState<string>('14:00')
    return (
      <div className="w-[720px]">
        <DateTimePicker
          date={date}
          onDateChange={setDate}
          time={time}
          onTimeChange={setTime}
          slots={SLOTS}
          disabledDates={{ before: startOfToday() }}
          unavailable={[offsetFromToday(13)]}
          secondaryAction={
            <Button variant="ghost" size="sm">
              Skip teleconsult for this visit
            </Button>
          }
          primaryAction={
            <Button>
              <Icon name="tabler:check" />
              Confirm booking
            </Button>
          }
          helperText={
            <span className="inline-flex items-center gap-1.5">
              <Icon name="tabler:info" size={14} />
              Slots are based on estimated result availability. We'll notify the patient if the lab is delayed.
            </span>
          }
        />
      </div>
    )
  },
}

export const Minimal: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(startOfToday())
    const [time, setTime] = useState<string>('09:00')
    return (
      <div className="w-[640px]">
        <DateTimePicker
          date={date}
          onDateChange={setDate}
          time={time}
          onTimeChange={setTime}
          slots={SLOTS.slice(0, 8)}
          primaryAction={<Button size="sm">Confirm</Button>}
        />
      </div>
    )
  },
}
