import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'

import { Icon } from '../atoms/icon.tsx'
import { cn } from '../../lib/cn.ts'

type SegmentedControlOption = {
  value: string
  label: string
  icon?: string
  disabled?: boolean
}

type SegmentedControlProps = {
  value: string
  onValueChange: (value: string) => void
  options: SegmentedControlOption[]
  'aria-label'?: string
  disabled?: boolean
  className?: string
}

/**
 * Single-select segmented control with a recessed tray. Each option is rendered
 * as an item with optional leading icon; the active item is filled with brand
 * color, inactive items are transparent and brighten on hover. Wraps Radix's
 * ToggleGroup primitive with type="single".
 *
 * @kuraModules phlebo
 */
function SegmentedControl({
  value,
  onValueChange,
  options,
  'aria-label': ariaLabel,
  disabled,
  className,
}: SegmentedControlProps) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next)
      }}
      disabled={disabled}
      aria-label={ariaLabel}
      data-slot="segmented-control"
      className={cn(
        'inline-flex items-center rounded-[var(--radius)] bg-[var(--surface-2)] p-1',
        className,
      )}
    >
      {options.map((option) => (
        <ToggleGroupPrimitive.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-[var(--radius)] px-3 text-k-sm font-bold transition-colors duration-150 ease-in-out',
            'text-[var(--ink-700)] hover:bg-[var(--surface)]',
            'data-[state=on]:bg-[var(--brand-500)] data-[state=on]:text-[var(--ink-0)] data-[state=on]:shadow-[var(--shadow-xs)] data-[state=on]:hover:bg-[var(--brand-500)]',
            'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-compact)]',
            'disabled:opacity-50 disabled:pointer-events-none',
          )}
        >
          {option.icon ? <Icon name={option.icon} size={14} /> : null}
          {option.label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  )
}

export {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlProps,
}
