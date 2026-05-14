import { type ReactNode } from 'react'

import { DatePicker } from '../organisms/date-picker.tsx'
import { TimeSlotPicker, type TimeSlot } from '../organisms/time-slot-picker.tsx'
import { cn } from '../../lib/cn.ts'

import { Icon } from '../atoms/icon.tsx'
type DateTimePickerProps = {
  /** Currently selected date. */
  date?: Date
  /** Currently selected time-slot value (e.g. `"14:00"`). */
  time?: string
  /** Fires when the date changes. */
  onDateChange?: (date: Date | undefined) => void
  /** Fires when the time changes. */
  onTimeChange?: (time: string) => void
  /** Slots for the chosen date. The consumer is responsible for re-keying when `date` changes. */
  slots: TimeSlot[]
  /** Dates that should render with a line-through in the calendar. */
  unavailable?: Date[]
  /** Forwards to `<Calendar disabled>`. */
  disabledDates?: Parameters<typeof DatePicker>[0]['disabled']
  /** Optional secondary action below the time slots, e.g. `Skip teleconsult for this visit`. */
  secondaryAction?: ReactNode
  /** Required primary action below the time slots, e.g. `<Icon name="tabler:check" /> Confirm booking`. */
  primaryAction?: ReactNode
  /** Helper text below the action row. */
  helperText?: ReactNode
  /** Override the time-row heading (e.g. "Saturday, May 9"). Defaults to a formatted date. */
  timeHeading?: ReactNode
  /** Number of time-slot grid columns. Defaults to 6. */
  timeColumns?: number
  /** Container class. */
  className?: string
}

const DAY_HEADING_FMT = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

/**
 * DateTimePicker — `DatePicker` above a `TimeSlotPicker`, framed by an
 * action row with optional secondary + primary CTAs and a helper text
 * footer. Backs the receptionist's teleconsult booking step:
 *
 *   [calendar grid]
 *   [time-icon] Saturday, May 9
 *   [09:00] [09:30] … [17:30]
 *   ─────────────────────────
 *   Skip teleconsult        [check-icon] Confirm booking
 *   [info-icon] Slots are based on estimated result availability.
 */
function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  slots,
  unavailable,
  disabledDates,
  secondaryAction,
  primaryAction,
  helperText,
  timeHeading,
  timeColumns = 6,
  className,
}: DateTimePickerProps) {
  const heading = timeHeading ?? (date ? DAY_HEADING_FMT.format(date) : null)

  return (
    <div data-slot="date-time-picker" className={cn('flex flex-col gap-4', className)}>
      <div className="rounded-[var(--radius-lg)] border border-border bg-card p-3">
        <DatePicker
          value={date}
          onChange={onDateChange}
          disabled={disabledDates}
          unavailable={unavailable}
          className="w-full"
        />
      </div>

      {heading ? (
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="tabler:clock" size={16} className="text-muted-foreground" aria-hidden />
          {heading}
        </div>
      ) : null}

      <TimeSlotPicker
        slots={slots}
        value={time}
        onChange={onTimeChange}
        columns={timeColumns}
        ariaLabel="Available time slots"
      />

      {secondaryAction || primaryAction ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div>{secondaryAction}</div>
          <div>{primaryAction}</div>
        </div>
      ) : null}

      {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  )
}

export { DateTimePicker }
