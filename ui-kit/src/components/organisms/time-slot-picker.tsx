import { type ComponentProps } from 'react'

import { cn } from '../../lib/cn.ts'

type TimeSlot = {
  /** Stable identifier, e.g. `"14:00"`. */
  value: string
  /** Visible text. Defaults to `value` when omitted. */
  label?: string
  /** Disable selection (e.g. fully booked). */
  disabled?: boolean
}

type TimeSlotPickerProps = Omit<ComponentProps<'div'>, 'children' | 'onChange'> & {
  /** Slot definitions. */
  slots: TimeSlot[]
  /** Currently selected slot's `value`. */
  value?: string
  /** Fires with the next slot's `value`. */
  onChange?: (value: string) => void
  /** Number of grid columns. Defaults to 6. */
  columns?: number
  /** Accessible label for the radiogroup. */
  ariaLabel?: string
}

/**
 * TimeSlotPicker — chip grid of selectable time slots. Single-select, behaves
 * like a radiogroup. Backs the bookings flow's hour-slot row (`09:00`,
 * `09:30`, …, `17:30`).
 */
function TimeSlotPicker({
  slots,
  value,
  onChange,
  columns = 6,
  ariaLabel = 'Time slot',
  className,
  style,
  ...props
}: TimeSlotPickerProps) {
  return (
    <div
      data-slot="time-slot-picker"
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn('grid gap-2', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...style }}
      {...props}
    >
      {slots.map((slot) => {
        const selected = slot.value === value
        return (
          <button
            key={slot.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={slot.disabled}
            onClick={() => !slot.disabled && onChange?.(slot.value)}
            className={cn(
              'inline-flex h-9 items-center justify-center rounded-[var(--radius)] border px-3 text-sm tabular-nums transition-colors',
              'border-border bg-card text-foreground hover:bg-accent',
              'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
              selected && 'border-transparent bg-[var(--ink-900)] text-[var(--ink-0)] hover:bg-[var(--ink-900)]',
              slot.disabled && 'cursor-not-allowed opacity-40 hover:bg-card',
            )}
          >
            {slot.label ?? slot.value}
          </button>
        )
      })}
    </div>
  )
}

export { TimeSlotPicker, type TimeSlot }
