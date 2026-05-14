import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type CalloutTone = 'info' | 'success' | 'warning' | 'danger'

const TONE_CLASSES: Record<CalloutTone, string> = {
  info: 'bg-[var(--status-info-bg)] text-[var(--status-info-fg)]',
  success: 'bg-[var(--status-success-bg)] text-[var(--status-success-fg)]',
  warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]',
  danger: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]',
}

type CalloutProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Tone — drives bg + fg from `--status-<tone>-bg/fg`. Default `info`. */
  tone?: CalloutTone
  children: ReactNode
}

/**
 * Callout — tone-only padded container for stacked content (typically
 * `<InfoSection>`s). Distinct from `Banner`: Banner is a header-led inline
 * notice (icon + bold title row + body + optional action); Callout is a plain
 * tinted block — use it to wrap stacked content where the children carry their
 * own structure.
 *
 * Universal — every clinic module surfaces tinted info blocks somewhere.
 */
function Callout({
  tone = 'info',
  children,
  className,
  ...props
}: CalloutProps) {
  return (
    <div
      data-slot="callout"
      data-tone={tone}
      className={cn(
        'space-y-3 rounded-[var(--radius-sm)] p-4',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Callout, type CalloutProps, type CalloutTone }
