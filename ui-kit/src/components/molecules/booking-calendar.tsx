import { useEffect, useRef, type ComponentProps } from 'react'
import {
  DayPicker,
  type DateRange,
  type DayButton,
  type Matcher,
} from 'react-day-picker'

import { Icon } from '../atoms/icon.tsx'
import { cn } from '../../lib/cn.ts'

type BookingCalendarProps = {
  /** Currently displayed month. */
  month: Date
  /** Called when the user navigates to a different month. */
  onMonthChange: (date: Date) => void
  /** Selected date (single-select mode). */
  selected: Date | undefined
  /** Called when the user selects a date. Receives `undefined` when deselected. */
  onSelect: (date: Date | undefined) => void
  /** Day-picker matcher — Date | Date[] | { from, to } | DayOfWeek | predicate. */
  disabled?: Matcher | Matcher[]
  /** Outer container className override. */
  className?: string
}

/**
 * Single-date booking calendar. Wraps `react-day-picker` directly (rather than the kit's shadcn
 * `<Calendar>`) so the day cell styling can match the canonical story exactly — shadcn's
 * `CalendarDayButton` applies its own data-attribute styles that can't be cleanly overridden
 * via `classNames` alone.
 *
 * Brand decision: "today" uses brand-50/brand-200/brand-700 (NOT warn-*) — warn carries
 * inappropriate semantic weight for a temporal marker.
 *
 * @kuraModules receptionist, phlebo
 */
function BookingCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  disabled,
  className,
}: BookingCalendarProps) {
  return (
    <DayPicker
      mode="single"
      month={month}
      onMonthChange={onMonthChange}
      selected={selected}
      onSelect={(date: Date | DateRange | Date[] | undefined) => {
        // Single-select mode always yields Date | undefined; the union is the library's catch-all.
        onSelect(date instanceof Date ? date : undefined)
      }}
      disabled={disabled}
      showOutsideDays
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-4',
        className,
      )}
      classNames={{
        months: 'relative flex flex-col gap-4',
        month: 'flex w-full flex-col gap-2',
        month_caption: 'flex h-9 items-center justify-center px-9',
        caption_label:
          'min-w-[120px] text-center text-[15px] font-bold text-[var(--ink-900)]',
        nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
        button_previous:
          'inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]',
        button_next:
          'inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]',
        month_grid: 'w-full border-collapse',
        weekdays: 'mt-2 grid grid-cols-7 gap-y-3',
        weekday:
          'text-center text-k-xs font-bold uppercase tracking-[0.1em] text-[var(--ink-400)]',
        week: 'mt-3 grid grid-cols-7 gap-y-3',
        day: 'aspect-square p-0',
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...props }) => {
          const name =
            orientation === 'left'
              ? 'tabler:chevron-left'
              : orientation === 'right'
                ? 'tabler:chevron-right'
                : 'tabler:chevron-down'
          return <Icon name={name} size={16} className={cn(chevronClassName)} {...props} />
        },
        DayButton: BookingDayButton,
      }}
    />
  )
}

function BookingDayButton({
  className,
  day,
  modifiers,
  ...props
}: ComponentProps<typeof DayButton>) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString()}
      className={cn(
        'mx-auto flex h-9 w-full max-w-[156px] items-center justify-center rounded-[var(--radius)] text-k-body font-bold tabular-nums transition-colors',
        'text-[var(--ink-800)] hover:bg-[var(--surface-2)]',
        'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
        modifiers.outside && 'text-[var(--ink-300)]',
        modifiers.today &&
          'border border-[var(--brand-200)] bg-[var(--brand-50)] text-[var(--brand-700)] hover:bg-[var(--brand-100)]',
        modifiers.disabled &&
          'cursor-not-allowed bg-[var(--ink-50)] text-[var(--ink-300)] line-through opacity-70 hover:bg-[var(--ink-50)]',
        modifiers.selected &&
          'bg-[var(--ink-900)] text-[var(--ink-0)] hover:bg-[var(--ink-900)] border-0',
        className,
      )}
      {...props}
    />
  )
}

export { BookingCalendar, type BookingCalendarProps }
