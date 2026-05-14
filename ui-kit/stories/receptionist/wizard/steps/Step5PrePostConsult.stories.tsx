import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'

import { Icon } from '@/components/atoms/icon.tsx'
import { BookingCalendar } from '@/components/molecules/booking-calendar.tsx'
import {
  ChecklistItem,
  type ChecklistItemStatus,
} from '@/components/molecules/checklist-item.tsx'
import { IconBadge } from '@/components/molecules/icon-badge.tsx'
import { StatusPill } from '@/components/molecules/status-pill.tsx'
import { WizardStepBody } from '@/components/molecules/wizard-step-body.tsx'
import { WorkflowHeading } from '@/components/molecules/workflow-heading.tsx'
import { IntakeCard } from '@/components/organisms/intake-card.tsx'
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
import { cn } from '@/lib/cn.ts'

import { CAPTURED_PATIENT } from '../../_fixtures/patient.ts'

import { StepShell } from './_scaffold.tsx'

const meta: Meta = {
  title: 'Receptionist/Wizard/Steps/Step5 Pre & post consult',
  tags: ['autodocs', 'module:receptionist'],
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

type IntakeTask = {
  title: string
  status: ChecklistItemStatus
  meta: ReactNode
}

const INTAKE_TASKS: IntakeTask[] = [
  { title: "Today's visit", status: 'pending', meta: 'PENDING' },
  { title: 'Pre-test prep', status: 'pending', meta: 'PENDING' },
  { title: 'Medications & supplements', status: 'pending', meta: 'PENDING' },
  { title: "Women's health", status: 'pending', meta: 'PENDING' },
  { title: 'Recent health events', status: 'pending', meta: 'PENDING' },
  { title: 'Lifestyle snapshot', status: 'pending', meta: 'PENDING' },
  { title: 'Sample comfort', status: 'pending', meta: 'PENDING' },
  { title: 'Consent & sensitive tests', status: 'done', meta: 'No sensitive tests' },
]

const TELECONSULT_SLOTS: TimeSlot[] = [
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

const DAY_HEADING_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

function formatMay2026Day(day: number) {
  return DAY_HEADING_FORMATTER.format(new Date(2026, 4, day))
}

function IntakeCardSlot() {
  return (
    <IntakeCard
      title="Visit Details"
      statusPill={
        <StatusPill
          tone="neutral"
          icon={<Icon name="tabler:clock" />}
          className="h-7 rounded-[var(--radius)] px-2.5 font-bold"
        >
          1/8 · Not started
        </StatusPill>
      }
      cta={
        <div className="flex flex-wrap items-center gap-3">
          <IconBadge tone="brand" size="md">
            <Icon name="tabler:device-mobile" />
          </IconBadge>
          <div className="min-w-[240px] flex-1">
            <h5 className="text-k-body font-bold leading-tight text-[var(--ink-900)]">
              Patient intake form
            </h5>
            <p className="mt-0.5 text-k-sm leading-k-snug text-[var(--ink-500)]">
              Your patient can complete their visit details on their phone.
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button variant="outline" className="h-8 gap-1.5 rounded-[var(--radius)] px-3">
              <Icon name="tabler:pencil" size={14} />
              Fill on behalf of patient
            </Button>
            <Button className="h-8 gap-1.5 rounded-[var(--radius)] px-3">
              <Icon name="tabler:send" size={14} />
              Send intake link
            </Button>
          </div>
        </div>
      }
    >
      {INTAKE_TASKS.map((item, index) => (
        <ChecklistItem
          key={item.title}
          status={item.status}
          title={item.title}
          meta={
            <span
              className={cn(
                'font-bold uppercase tracking-k-wider',
                item.status === 'done' ? 'normal-case tracking-normal' : undefined,
              )}
            >
              {item.meta}
            </span>
          }
          className={cn(
            'rounded-none px-2.5 py-[7px] text-[12.5px] font-bold',
            index < INTAKE_TASKS.length - 1 && 'border-b border-[var(--border)]',
          )}
        />
      ))}
    </IntakeCard>
  )
}

function TeleconsultCardSlot() {
  const [month, setMonth] = useState(new Date(2026, 4, 1))
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2026, 4, 12))
  const [selectedTime, setSelectedTime] = useState('14:00')

  return (
    <TeleconsultBookingCard
      noticeBanner={
        <span className="inline-flex items-center gap-2">
          <Icon name="tabler:clock" size={15} className="text-[var(--ink-500)]" aria-hidden />
          No TAT-bound tests in cart — book any slot.
        </span>
      }
      specialtyControl={
        <div className="flex flex-wrap items-center gap-3">
          <Label className="text-[12.5px] font-bold text-[var(--ink-800)]">Specialty</Label>
          <Select defaultValue="general-practice">
            <SelectTrigger className="h-9 w-[250px] rounded-[var(--radius)] bg-[var(--surface)] text-k-body font-medium">
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
          selected={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date)
            setSelectedTime(date?.getDate() === 12 ? '14:00' : '09:00')
          }}
          disabled={[new Date(2026, 4, 8), new Date(2026, 4, 22)]}
        />
      }
      dayHeading={
        <>
          <Icon name="tabler:clock" size={15} className="text-[var(--ink-500)]" aria-hidden />
          {selectedDate ? formatMay2026Day(selectedDate.getDate()) : '—'}
        </>
      }
      timeSlots={
        <TimeSlotPicker
          slots={TELECONSULT_SLOTS}
          value={selectedTime}
          onChange={setSelectedTime}
          columns={14}
          ariaLabel="Teleconsultation time slots"
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
  )
}

function ResultTimingNote() {
  return (
    <p className="inline-flex items-start gap-2 text-k-sm leading-k-base text-[var(--ink-500)]">
      <Icon name="tabler:info-circle" size={14} className="mt-0.5 shrink-0" aria-hidden />
      Slots are based on estimated result availability. We'll notify the patient if the lab is
      delayed.
    </p>
  )
}

function Step5Body() {
  return (
    <WizardStepBody
      title="Pre & post consultation"
      subtitle="Fill intake now · book a follow-up call after."
      gap="md"
    >
      <WorkflowHeading
        eyebrow="Pre-consultation"
        title="Visit details"
        subtitle="Fill while patient is still in the queue."
      />
      <IntakeCardSlot />

      <div className="border-t border-[var(--border)] pt-4">
        <WorkflowHeading
          eyebrow="Post-consultation"
          title="Teleconsultation"
          subtitle="Book a call to review test results."
        />
      </div>
      <TeleconsultCardSlot />
      <ResultTimingNote />
    </WizardStepBody>
  )
}

export const Default: Story = {
  name: 'Step 5 — Pre & post consultation',
  render: () => (
    <StepShell
      patient={CAPTURED_PATIENT}
      currentStep={5}
      doneThroughStep={4}
      continueLabel="Continue"
    >
      <Step5Body />
    </StepShell>
  ),
}
