import { Fragment, type ComponentProps, type ReactNode } from 'react'

import { Input } from '../ui/input.tsx'
import { cn } from '../../lib/cn.ts'

type CompositeNumberFieldField = Omit<ComponentProps<typeof Input>, 'type' | 'className'> & {
  name: string
  'aria-label': string
}

type CompositeNumberFieldProps = {
  label: string
  required?: boolean
  hint?: ReactNode
  fields: CompositeNumberFieldField[]
  separator?: string
  unit?: string
  className?: string
}

/**
 * Multiple numeric inputs sharing one bordered shell, separated by a string
 * (default '/'). Used for paired clinical values like blood pressure
 * (systolic / diastolic). The shell carries a focus-within ring so keyboard
 * focus is visible across the pair even though the individual inputs are
 * stripped of their own focus rings. Forwards all standard <Input> props per
 * field via the spread on each <Input>.
 *
 * @kuraModules phlebo
 */
function CompositeNumberField({
  label,
  required,
  hint,
  fields,
  separator = '/',
  unit,
  className,
}: CompositeNumberFieldProps) {
  return (
    <div data-slot="composite-number-field" className={cn('grid gap-1.5', className)}>
      <span className="flex items-center justify-between gap-2">
        <span className="text-k-body font-bold text-[var(--ink-900)]">
          {label}
          {required ? (
            <span className="ml-1 text-[var(--status-danger-fg)]" aria-label="required">
              *
            </span>
          ) : null}
        </span>
        {hint ? (
          <span className="text-k-xs font-medium text-[var(--ink-500)]">{hint}</span>
        ) : null}
      </span>
      <div
        className={cn(
          'flex h-9 items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 transition-shadow',
          'focus-within:border-[var(--border-focus)] focus-within:shadow-[var(--shadow-focus)]',
        )}
      >
        {fields.map((field, index) => {
          const { name, ...rest } = field
          return (
            <Fragment key={name}>
              {index > 0 ? (
                <span aria-hidden className="font-bold text-[var(--ink-500)]">
                  {separator}
                </span>
              ) : null}
              <Input
                {...rest}
                name={name}
                type="number"
                className="flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </Fragment>
          )
        })}
        {unit ? (
          <span className="text-k-xs font-bold text-[var(--ink-500)]">{unit}</span>
        ) : null}
      </div>
    </div>
  )
}

export {
  CompositeNumberField,
  type CompositeNumberFieldField,
  type CompositeNumberFieldProps,
}
