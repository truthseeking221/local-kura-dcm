import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type StatusPillTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'ai'

const TONE_CLASSES: Record<StatusPillTone, string> = {
  info: 'bg-[var(--status-info-bg)] text-[var(--status-info-fg)]',
  success: 'bg-[var(--status-success-bg)] text-[var(--status-success-fg)]',
  warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]',
  danger: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]',
  neutral: 'bg-[var(--status-neutral-bg)] text-[var(--status-neutral-fg)]',
  ai: 'bg-[var(--status-ai-bg)] text-[var(--status-ai-fg)]',
}

type StatusPillProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** Tone — drives the bg + fg pair from `--status-<tone>-bg/fg`. */
  tone?: StatusPillTone
  /** Optional leading icon. Sized 14px to match `text-xs` x-height. */
  icon?: ReactNode
  /** Pill content. */
  children: ReactNode
}

/**
 * StatusPill — slightly larger than a Badge, with optional leading icon. Used
 * for the wizard-header status (`Capture identity` → `Verify patient` →
 * `Choose insurance` → `Book teleconsult` → `Ready to check in`) and any
 * persistent status indicator that needs to read at chrome distance.
 *
 * For inline tags (HAEM, POPULAR, ELIGIBLE), use `<Badge>` instead.
 */
function StatusPill({ tone = 'neutral', icon, children, className, ...props }: StatusPillProps) {
  return (
    <span
      data-slot="status-pill"
      data-tone={tone}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium [&>svg]:size-3.5 [&>svg]:shrink-0',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {icon ? <span aria-hidden className="-ml-0.5 inline-flex">{icon}</span> : null}
      {children}
    </span>
  )
}

export { StatusPill, type StatusPillTone }
