import { type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'
import { RadioGroupItem } from '../ui/radio-group.tsx'

type RadioCardLayout = 'tile' | 'pill'

type RadioCardProps = {
  /** RadioGroup value bound to this card. */
  value: string
  /** Primary label. */
  label: string
  /** Leading icon. Pass a sized Lucide / `<Icon>` element. */
  icon: ReactNode
  /** Optional caption — secondary text. Renders below the label in `tile` layout. */
  caption?: string
  /** Visual layout. `tile` = vertical block with icon top-left; `pill` = horizontal pill with icon + label inline. Defaults to `tile`. */
  layout?: RadioCardLayout
  /** When true, the inner RadioGroupItem dot is visually hidden (`sr-only`). Use for layouts where the entire label IS the visible affordance. Defaults to `false` (dot visible). */
  hideRadioControl?: boolean
  /** Outer label className override. */
  className?: string
}

/**
 * Radio-bound clickable card. Designed for use inside a controlling `<RadioGroup>`.
 * Two visual layouts:
 * - `tile` — vertical block with icon top-left, label above caption (Step 6 Payer pattern).
 * - `pill` — horizontal pill with icon + label inline (Step 2 ContactChannel pattern; Step 6 Method pattern).
 *
 * The selected state is detected via the inner `<RadioGroupItem>`'s `data-state="checked"` attribute,
 * surfaced to the wrapping `<label>` via Tailwind's `has-[[data-state=checked]]:` modifier.
 *
 * @kuraModules receptionist, phlebo, patient
 */
function RadioCard({
  value,
  label,
  icon,
  caption,
  layout = 'tile',
  hideRadioControl = false,
  className,
}: RadioCardProps) {
  if (layout === 'pill') {
    return (
      <label
        data-slot="radio-card"
        data-layout="pill"
        className={cn(
          'flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-[var(--radius)] border px-3 text-k-body font-bold transition-colors',
          'border-[var(--border)] bg-[var(--surface)] text-[var(--ink-700)] hover:bg-[var(--surface-2)]',
          'has-[[data-state=checked]]:border-[var(--brand-300)] has-[[data-state=checked]]:bg-[var(--brand-50)] has-[[data-state=checked]]:text-[var(--brand-700)]',
          className,
        )}
      >
        <RadioGroupItem
          value={value}
          aria-label={label}
          className={cn(hideRadioControl ? 'sr-only' : '')}
        />
        {icon}
        {label}
      </label>
    )
  }

  return (
    <label
      data-slot="radio-card"
      data-layout="tile"
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors hover:border-[var(--brand-500)]',
        'has-[[data-state=checked]]:border-[var(--brand-200)] has-[[data-state=checked]]:bg-[var(--brand-50)] has-[[data-state=checked]]:text-[var(--brand-700)]',
        className,
      )}
    >
      <RadioGroupItem
        value={value}
        aria-label={label}
        className={cn('mt-0.5', hideRadioControl ? 'sr-only' : '')}
      />
      <span className="mt-0.5 shrink-0 text-[var(--ink-500)]">{icon}</span>
      <div className="space-y-0.5">
        <div className="text-k-body font-bold">{label}</div>
        {caption ? <div className="text-[11.5px] text-[var(--ink-500)]">{caption}</div> : null}
      </div>
    </label>
  )
}

export { RadioCard, type RadioCardProps, type RadioCardLayout }
