import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type BannerTone = 'info' | 'success' | 'warning' | 'danger' | 'ai'

const TONE_CLASSES: Record<BannerTone, string> = {
  info: 'bg-[var(--status-info-bg)] text-[var(--status-info-fg)]',
  success: 'bg-[var(--status-success-bg)] text-[var(--status-success-fg)]',
  warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]',
  danger: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]',
  ai: 'bg-[var(--status-ai-bg)] text-[var(--status-ai-fg)]',
}

type BannerProps = Omit<ComponentProps<'div'>, 'children' | 'title'> & {
  /** Tone — drives bg + fg from `--status-<tone>-bg/fg`. */
  tone?: BannerTone
  /** Optional leading icon. Sized 16px. */
  icon?: ReactNode
  /** Optional bold title row. */
  title?: ReactNode
  /** Body content. */
  children?: ReactNode
  /** Optional trailing action (button / link). */
  action?: ReactNode
}

/**
 * Banner — inline notice with leading icon, bold title, body, and optional
 * trailing action. Tone-driven with the canonical `--status-<tone>` pairs.
 *
 * Backs:
 * - "Filling on behalf of patient" (info, with edit pencil + Done action)
 * - "No TAT-bound tests in cart — book any slot" (info)
 * - "No payment due / This order has a $0 patient balance." (success)
 * - "Full name required" (warning)
 * - "Consent declined — counter-sign required" (danger)
 */
function Banner({ tone = 'info', icon, title, children, action, className, role, ...props }: BannerProps) {
  return (
    <div
      data-slot="banner"
      data-tone={tone}
      role={role ?? (tone === 'danger' || tone === 'warning' ? 'alert' : 'status')}
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius)] px-3 py-2.5 text-sm',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {icon ? (
        <span aria-hidden className="mt-0.5 inline-flex shrink-0 [&>svg]:size-4">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        {title ? <div className="font-semibold leading-snug">{title}</div> : null}
        {children ? <div className="text-k-body opacity-90">{children}</div> : null}
      </div>
      {action ? <div className="ml-2 shrink-0">{action}</div> : null}
    </div>
  )
}

export { Banner, type BannerTone }
