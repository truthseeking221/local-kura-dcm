import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type IconBadgeTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'ai' | 'brand'
type IconBadgeSize = 'sm' | 'md' | 'lg'

const TONE_CLASSES: Record<IconBadgeTone, string> = {
  info: 'bg-[var(--status-info-bg)] text-[var(--status-info-fg)]',
  success: 'bg-[var(--status-success-bg)] text-[var(--status-success-fg)]',
  warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]',
  danger: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]',
  neutral: 'bg-[var(--status-neutral-bg)] text-[var(--status-neutral-fg)]',
  ai: 'bg-[var(--status-ai-bg)] text-[var(--status-ai-fg)]',
  brand: 'bg-[var(--surface-brand)] text-[var(--brand-700)]',
}

const SIZE_CLASSES: Record<IconBadgeSize, string> = {
  sm: 'size-7 rounded-[var(--radius-sm)] [&>svg]:size-4',
  md: 'size-9 rounded-[var(--radius)] [&>svg]:size-[18px]',
  lg: 'size-12 rounded-[var(--radius-lg)] [&>svg]:size-6',
}

type IconBadgeProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** Tone — soft-tint backgrounds paired with `--status-<tone>-fg`. */
  tone?: IconBadgeTone
  /** Box size — `sm` (28px) / `md` (36px) / `lg` (48px). */
  size?: IconBadgeSize
  /** The icon to render. Pass an `<Icon name="..." />` element or any ReactNode. */
  children: ReactNode
}

/**
 * IconBadge — square soft-tinted container for a leading icon. Backs
 * notification type icons, capture-method card icons, address/refund-account
 * section icons, and the intake-form phone icon.
 *
 * The icon child renders at a size locked by the `size` prop, so a single
 * `IconBadge` works for any Iconify icon without per-call sizing.
 */
function IconBadge({ tone = 'neutral', size = 'md', children, className, ...props }: IconBadgeProps) {
  return (
    <span
      data-slot="icon-badge"
      data-tone={tone}
      data-size={size}
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        SIZE_CLASSES[size],
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { IconBadge, type IconBadgeTone, type IconBadgeSize }
