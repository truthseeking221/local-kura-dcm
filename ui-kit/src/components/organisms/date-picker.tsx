import { type ComponentProps } from 'react'

import { Calendar } from '../ui/calendar.tsx'

type DatePickerProps = Omit<ComponentProps<typeof Calendar>, 'mode' | 'selected' | 'onSelect'> & {
  /** Single selected date. */
  value?: Date
  /** Fires when the user picks a date. */
  onChange?: (next: Date | undefined) => void
  /** Dates that should render with a strike-through (visible but not selectable). */
  unavailable?: Date[]
}

/**
 * DatePicker — single-date Calendar with Kura modifier conventions:
 * - `today` cell shows the cream-border highlight (Calendar default).
 * - `unavailable` dates render with a line-through and reduced opacity but
 *   stay visible (different from `disabled`, which removes them visually).
 * - Past dates should be passed to `disabled={{ before: today }}` by the
 *   caller — the kit doesn't make assumptions about what's bookable.
 *
 * For booking flows that combine date + time-slot selection, use
 * `<DateTimePicker>` instead.
 */
function DatePicker({ value, onChange, unavailable, modifiers, modifiersClassNames, ...props }: DatePickerProps) {
  return (
    <Calendar
      mode="single"
      selected={value}
      onSelect={onChange}
      modifiers={{ ...modifiers, unavailable: unavailable ?? [] }}
      modifiersClassNames={{
        ...modifiersClassNames,
        unavailable: 'line-through opacity-50 pointer-events-none',
      }}
      {...props}
    />
  )
}

export { DatePicker }
