import { type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'
import { Badge } from '../ui/badge.tsx'

type SpecialtyBadgeTone = 'haem' | 'biochem' | 'urine' | 'vitals' | 'popular'

type SpecialtyBadgeProps = {
  /** Tone — drives the tinted bg / border / fg trio. */
  tone: SpecialtyBadgeTone
  /** Tag label (typically uppercase 3–8 char specialty code). */
  children: ReactNode
  /** Outer className override. */
  className?: string
}

const TONE_CLASSES: Record<SpecialtyBadgeTone, string> = {
  haem: 'border-[var(--danger-100)] bg-[var(--danger-50)] text-[var(--danger-600)]',
  biochem: 'border-[var(--brand-100)] bg-[var(--brand-50)] text-[var(--brand-600)]',
  urine: 'border-[var(--warn-100)] bg-[var(--warn-50)] text-[var(--warn-600)]',
  vitals: 'border-[var(--warn-100)] bg-[var(--warn-50)] text-[var(--warn-600)]',
  // POPULAR is a discoverability cue, not a category — use neutral ink tint so it does not
  // visually collide with brand-tinted category tones like `biochem`.
  popular: 'border-[var(--ink-100)] bg-[var(--ink-50)] text-[var(--ink-700)]',
}

/**
 * Tone-coded category badge for the receptionist orders catalog.
 *
 * Brand rule satisfied: the badge always carries its own text label (e.g., "HAEM") paired
 * with the tone color — never status-by-color-alone.
 *
 * Chrome exception: text is `9.5px` uppercase — non-body decorative chrome (see CLAUDE.md
 * "Body text never below 11 px" carve-out for badges / pill markers).
 *
 * @kuraModules receptionist
 */
function SpecialtyBadge({ tone, children, className }: SpecialtyBadgeProps) {
  return (
    <Badge
      variant="outline"
      data-slot="specialty-badge"
      data-tone={tone}
      className={cn(
        'rounded-[var(--radius-xs)] px-[5px] py-px text-[9.5px] font-bold uppercase leading-k-base tracking-k-wider',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </Badge>
  )
}

export { SpecialtyBadge, type SpecialtyBadgeTone }
