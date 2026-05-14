import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Icon } from '@/components/atoms/icon.tsx'
import { BookingCalendar } from '@/components/molecules/booking-calendar.tsx'
import { TeleconsultBookingCard } from '@/components/organisms/teleconsult-booking-card.tsx'
import { TimeSlotPicker, type TimeSlot } from '@/components/organisms/time-slot-picker.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'

const meta = {
  title: 'Organisms/TeleconsultBookingCard',
  component: TeleconsultBookingCard,
  tags: ['autodocs', 'module:receptionist'],
  args: {
    specialtyControl: null,
    calendar: null,
    dayHeading: 'Tuesday, May 12',
    timeSlots: null,
    actions: null,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TeleconsultBookingCard>

export default meta
type Story = StoryObj<typeof meta>

const SLOTS: TimeSlot[] = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
].map((value) => ({ value }))

const HEADING_FMT = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

export const Default: Story = {
  name: 'Step 5 full booking panel',
  render: () => {
    const [month, setMonth] = useState(new Date(2026, 4, 1))
    const [day, setDay] = useState<Date | undefined>(new Date(2026, 4, 12))
    const [slot, setSlot] = useState('14:00')

    return (
      <div className="w-[820px]">
        <TeleconsultBookingCard
          noticeBanner={
            <span className="inline-flex items-center gap-2">
              <Icon name="tabler:clock" size={15} className="text-[var(--ink-500)]" />
              No TAT-bound tests in cart — book any slot.
            </span>
          }
          specialtyControl={
            <div className="flex flex-wrap items-center gap-3">
              <Label className="text-[12.5px] font-bold text-[var(--ink-800)]">Specialty</Label>
              <Select defaultValue="general-practice">
                <SelectTrigger className="h-9 w-[250px] rounded-[var(--radius)] text-[13px] font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general-practice">General Practice</SelectItem>
                  <SelectItem value="family-medicine">Family Medicine</SelectItem>
                  <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
          calendar={
            <BookingCalendar
              month={month}
              onMonthChange={setMonth}
              selected={day}
              onSelect={setDay}
            />
          }
          dayHeading={
            <>
              <Icon name="tabler:clock" size={15} className="text-[var(--ink-500)]" />
              {day ? HEADING_FMT.format(day) : '—'}
            </>
          }
          timeSlots={
            <TimeSlotPicker
              slots={SLOTS}
              value={slot}
              onChange={setSlot}
              columns={14}
              ariaLabel="Teleconsult slots"
              className="min-w-[960px] gap-2"
            />
          }
          actions={
            <>
              <Button variant="outline" className="h-9 rounded-[var(--radius)] px-4">
                Skip teleconsult for this visit
              </Button>
              <Button className="h-9 rounded-[var(--radius)] px-4">
                <Icon name="tabler:check" size={16} />
                Confirm booking
              </Button>
            </>
          }
        />
      </div>
    )
  },
}

export const NoNotice: Story = {
  name: 'Without notice banner',
  render: () => (
    <div className="w-[820px]">
      <TeleconsultBookingCard
        specialtyControl={
          <div className="flex items-center gap-3">
            <Label>Specialty</Label>
            <Select defaultValue="general-practice">
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general-practice">General Practice</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        calendar={
          <BookingCalendar
            month={new Date(2026, 4, 1)}
            onMonthChange={() => {}}
            selected={new Date(2026, 4, 13)}
            onSelect={() => {}}
          />
        }
        dayHeading="Wednesday, May 13"
        timeSlots={
          <TimeSlotPicker
            slots={SLOTS}
            value="10:00"
            onChange={() => {}}
            columns={8}
            ariaLabel="Slots"
          />
        }
        actions={
          <Button>
            <Icon name="tabler:check" size={16} />
            Confirm
          </Button>
        }
      />
    </div>
  ),
}
