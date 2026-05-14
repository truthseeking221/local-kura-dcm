import { cn } from '../../lib/cn.ts'

type DerivedValueFieldProps = {
  label: string
  hint?: string
  value?: string | number | null
  placeholder?: string
  unit?: string
  className?: string
}

/**
 * Labeled read-only display for a value computed from other inputs. Dashed border
 * + recessed --surface-2 fill visually distinguishes the field as non-interactive;
 * mirrors ClinicalNumberField's header pattern (label + optional right-aligned hint).
 * Bold mono numerals when populated; dimmed placeholder when empty. Does not
 * accept user input.
 *
 * @kuraModules phlebo
 */
function DerivedValueField({
  label,
  hint,
  value,
  placeholder = '—',
  unit,
  className,
}: DerivedValueFieldProps) {
  const isEmpty = value === undefined || value === null || value === ''
  const display = isEmpty ? placeholder : value

  return (
    <div data-slot="derived-value-field" className={cn('grid gap-1.5', className)}>
      <span className="flex items-center justify-between gap-2">
        <span className="text-k-body font-bold text-[var(--ink-900)]">{label}</span>
        {hint ? (
          <span className="text-k-xs font-medium text-[var(--ink-500)]">{hint}</span>
        ) : null}
      </span>
      <div className="flex h-9 items-center justify-between rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-3">
        <span
          className={cn(
            'font-mono text-k-sm font-bold',
            isEmpty ? 'text-[var(--ink-400)]' : 'text-[var(--ink-900)]',
          )}
        >
          {display}
          {unit ? <span className="ml-1 text-[var(--ink-500)]">{unit}</span> : null}
        </span>
      </div>
    </div>
  )
}

export { DerivedValueField, type DerivedValueFieldProps }
