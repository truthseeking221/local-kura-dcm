import { type ComponentProps } from 'react'

import { cn } from '../../lib/cn.ts'

type StatusDotTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'ai'

const TONE_BG: Record<StatusDotTone, string> = {
  success: 'var(--status-success-fg)',
  warning: 'var(--status-warning-fg)',
  danger: 'var(--status-danger-fg)',
  info: 'var(--status-info-fg)',
  neutral: 'var(--status-neutral-fg)',
  ai: 'var(--status-ai-fg)',
}

type StatusDotProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** Tone — pulls the matching `--status-<tone>-fg` token. Defaults to `neutral`. */
  tone?: StatusDotTone
  /** Pixel diameter. Defaults to 8. */
  size?: number
}

/**
 * StatusDot — single coloured dot for category indicators (filter chips like
 * `● Needs attention 0`, `● In progress 1`, `● Done 1`). Decorative by
 * default — semantics live on the surrounding label.
 */
function StatusDot({ tone = 'neutral', size = 8, className, style, ...props }: StatusDotProps) {
  return (
    <span
      data-slot="status-dot"
      data-tone={tone}
      aria-hidden
      className={cn('inline-block shrink-0 rounded-full', className)}
      style={{ width: size, height: size, background: TONE_BG[tone], ...style }}
      {...props}
    />
  )
}

export { StatusDot, type StatusDotTone }
