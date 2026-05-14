import { type ComponentProps, type ReactNode } from 'react'

import { StatusDot } from '../atoms/status-dot.tsx'
import { cn } from '../../lib/cn.ts'

type FilterChipTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'ai'

type FilterChipProps = Omit<ComponentProps<'button'>, 'value'> & {
  /** The filter's value/key. Echoed via `data-value` for testing/devtools introspection. */
  value: string
  /** Label text. */
  label: ReactNode
  /** Optional dot tone — when set, prepends a `<StatusDot tone={tone} />`. */
  tone?: FilterChipTone
  /** Optional count badge. Rendered when `typeof count === 'number'` (so `0` is shown). */
  count?: number
  /** Active/selected state — flips to the ink-inverted dark fill with brand border. */
  active?: boolean
  /** Click handler — typically toggles the filter. */
  onClick: () => void
}

/**
 * FilterChip — toggleable filter pill for command palettes, worklist filter rows,
 * and any "category + count" filter UI. Composes `<StatusDot>` for the optional
 * leading tone indicator; renders an optional trailing tabular-num count.
 *
 * Two states only — inactive (muted surface) and active (brand-bordered + ink-inverted).
 * One size — designed for clinic-PC keyboard-first workflows (hit target intentionally
 * below the 44×44 touch floor; not a touch-target component).
 *
 * Accessibility: renders as `<button type="button" aria-pressed={active}>`. StatusDot is
 * decorative (`aria-hidden` via its own implementation); the label carries all semantics.
 */
function FilterChip({
  value,
  label,
  tone,
  count,
  active = false,
  onClick,
  className,
  type,
  ...props
}: FilterChipProps) {
  return (
    <button
      type={type ?? 'button'}
      data-value={value}
      data-active={active || undefined}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-transparent px-3 py-1.5 text-k-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-compact)]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        active
          ? 'border-[var(--brand-500)] bg-[var(--ink-900)] text-[var(--ink-0)]'
          : 'bg-muted text-muted-foreground hover:bg-accent',
        className,
      )}
      {...props}
    >
      {tone ? <StatusDot tone={tone} /> : null}
      <span>{label}</span>
      {typeof count === 'number' ? (
        <span className="font-mono text-k-xs tabular-nums opacity-80">{count}</span>
      ) : null}
    </button>
  )
}

export { FilterChip, type FilterChipProps, type FilterChipTone }
