import { type ComponentProps } from 'react'

import { cn } from '../../lib/cn.ts'

type CountBadgeVariant = 'default' | 'accent' | 'destructive'

const VARIANT_CLASSES: Record<CountBadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  accent: 'bg-[var(--brand-50)] text-[var(--brand-700)]',
  destructive: 'bg-[var(--danger-500)] text-white',
}

type CountBadgeProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** Number to display. Falsy values still render a "0" — caller decides whether to omit. */
  count: number
  /** Visual treatment. `default` for category counters, `accent` for counts inside accented context, `destructive` for unread/error counts. */
  variant?: CountBadgeVariant
}

/**
 * CountBadge — small numeric chip. Used for category counts ("General Health 7",
 * "Bundles 12") and for cart item counts. Tabular numerals so two-digit
 * counts don't shift their neighbours.
 */
function CountBadge({ count, variant = 'default', className, ...props }: CountBadgeProps) {
  return (
    <span
      data-slot="count-badge"
      data-variant={variant}
      className={cn(
        'inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] px-1 font-mono text-k-xs tabular-nums',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {count}
    </span>
  )
}

export { CountBadge }
