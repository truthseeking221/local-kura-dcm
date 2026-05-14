import { type ComponentProps } from 'react'

import { Icon } from '../atoms/icon.tsx'
import { Input } from '../ui/input.tsx'
import { cn } from '../../lib/cn.ts'

type ClinicalNumberFieldState = 'default' | 'info' | 'success' | 'warning' | 'danger'

type ClinicalNumberFieldProps = Omit<ComponentProps<typeof Input>, 'type'> & {
  /** Field label shown above the input. */
  label: string
  /** Optional clinical reference range, e.g. `30-250 bpm`. */
  range?: string
  /** Unit rendered inside the trailing edge of the input. */
  unit?: string
  /** Marks the field as required in the visible label. */
  required?: boolean
  /** Helper text below the input. Required by convention when state is not default. */
  helperText?: string
  /** Status tone for clinical validation. Color is always paired with an icon and label. */
  state?: ClinicalNumberFieldState
}

const STATE_CLASS: Record<ClinicalNumberFieldState, string> = {
  default: '',
  info: 'text-[var(--status-info-fg)]',
  success: 'text-[var(--status-success-fg)]',
  warning: 'text-[var(--status-warning-fg)]',
  danger: 'text-[var(--status-danger-fg)]',
}

const STATE_ICON: Record<Exclude<ClinicalNumberFieldState, 'default'>, string> = {
  info: 'tabler:info-circle',
  success: 'tabler:circle-check',
  warning: 'tabler:alert-triangle',
  danger: 'tabler:alert-circle',
}

/**
 * Labeled numeric input for clinical measurements with range and unit slots.
 *
 * @kuraModules phlebo
 */
function ClinicalNumberField({
  label,
  range,
  unit,
  required,
  helperText,
  state = 'default',
  className,
  ...props
}: ClinicalNumberFieldProps) {
  const stateIcon = state === 'default' ? null : STATE_ICON[state]

  return (
    <label data-slot="clinical-number-field" className={cn('grid gap-1.5', className)}>
      <span className="flex items-center justify-between gap-2">
        <span className="text-k-body font-bold text-[var(--ink-900)]">
          {label}
          {required ? (
            <span className="ml-1 text-[var(--status-danger-fg)]" aria-label="required">
              *
            </span>
          ) : null}
        </span>
        {range ? <span className="text-k-xs font-medium text-[var(--ink-500)]">{range}</span> : null}
      </span>
      <span className="relative">
        <Input
          type="number"
          className={cn(unit && 'pr-16', state !== 'default' && 'border-current', STATE_CLASS[state])}
          {...props}
        />
        {unit ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-k-xs font-bold text-[var(--ink-500)]">
            {unit}
          </span>
        ) : null}
      </span>
      {helperText ? (
        <span className={cn('inline-flex items-center gap-1 text-k-xs font-medium', STATE_CLASS[state])}>
          {stateIcon ? <Icon name={stateIcon} size={12} /> : null}
          {helperText}
        </span>
      ) : null}
    </label>
  )
}

export { ClinicalNumberField, type ClinicalNumberFieldProps, type ClinicalNumberFieldState }
