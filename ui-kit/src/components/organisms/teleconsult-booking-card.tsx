import { type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type TeleconsultBookingCardProps = {
  /** Optional notice strip rendered above the controls (e.g., "No TAT-bound tests in cart"). */
  noticeBanner?: ReactNode
  /** Specialty control slot — caller passes pre-wired `<Label>` + `<Select>`. */
  specialtyControl: ReactNode
  /** Calendar slot — caller passes `<BookingCalendar>`. */
  calendar: ReactNode
  /** Day heading content — typically icon + formatted date string. */
  dayHeading: ReactNode
  /** Time-slot picker slot — caller passes `<TimeSlotPicker>`. */
  timeSlots: ReactNode
  /** Action row — caller passes Skip + Confirm `<Button>`s. */
  actions: ReactNode
  /** Outer container className override. */
  className?: string
}

/**
 * Step 5 teleconsult booking panel. Workflow card with optional notice strip, a specialty control row,
 * a calendar slot, a day-heading band wrapping the time-slot picker, and an action row.
 *
 * Pure slot factoring: the kit owns layout + spacing only. Callers pass the actual `<Select>` /
 * `<BookingCalendar>` / `<TimeSlotPicker>` / `<Button>` instances pre-wired to their state.
 *
 * @kuraModules receptionist
 */
function TeleconsultBookingCard({
  noticeBanner,
  specialtyControl,
  calendar,
  dayHeading,
  timeSlots,
  actions,
  className,
}: TeleconsultBookingCardProps) {
  return (
    <section
      data-slot="teleconsult-booking-card"
      className={cn(
        'space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]',
        className,
      )}
    >
      {noticeBanner ? (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-k-body font-medium text-[var(--ink-700)]">
          {noticeBanner}
        </div>
      ) : null}

      {specialtyControl}
      {calendar}

      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <div className="mb-3 flex items-center gap-2 text-k-h font-bold text-[var(--ink-900)]">
          {dayHeading}
        </div>
        <div className="overflow-x-auto">{timeSlots}</div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>
    </section>
  )
}

export { TeleconsultBookingCard, type TeleconsultBookingCardProps }
