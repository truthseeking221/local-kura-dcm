import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { TimeSlotPicker, type TimeSlot } from '@/components/organisms/time-slot-picker.tsx'

const meta: Meta = {
  title: 'Organisms/TimeSlotPicker',
  component: TimeSlotPicker,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

const SLOTS_HALF_HOUR: TimeSlot[] = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30',
].map((value) => ({ value }))

export const HalfHourGrid: Story = {
  render: () => {
    const [time, setTime] = useState<string>('14:00')
    return (
      <div className="w-[640px]">
        <TimeSlotPicker slots={SLOTS_HALF_HOUR} value={time} onChange={setTime} />
      </div>
    )
  },
}

export const SomeUnavailable: Story = {
  render: () => {
    const [time, setTime] = useState<string>('11:30')
    const slots: TimeSlot[] = SLOTS_HALF_HOUR.map((s) =>
      ['10:00', '10:30', '15:00'].includes(s.value) ? { ...s, disabled: true } : s,
    )
    return (
      <div className="w-[640px]">
        <TimeSlotPicker slots={slots} value={time} onChange={setTime} />
      </div>
    )
  },
}

export const FourColumns: Story = {
  render: () => {
    const [time, setTime] = useState<string>('11:30')
    return (
      <div className="w-[480px]">
        <TimeSlotPicker
          slots={SLOTS_HALF_HOUR.slice(0, 8)}
          value={time}
          onChange={setTime}
          columns={4}
        />
      </div>
    )
  },
}
