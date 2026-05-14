import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type MetaPillProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** Optional leading icon. Rendered muted-foreground at 14px to match `text-xs` x-height. */
  icon?: ReactNode
  /** Pill body. */
  children: ReactNode
}

/**
 * Compact icon + text chip for inline metadata (DOB, sex, phone, etc.).
 * Decorative — not a button, not a status indicator. For status tones
 * see StatusPill; for variant-driven labels see Badge.
 *
 * No `@kuraModules` tag — universal.
 */
function MetaPill({ icon, children, className, ...props }: MetaPillProps) {
  return (
    <span
      data-slot="meta-pill"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)]',
        'border border-border bg-card px-2.5 py-1 text-xs',
        className,
      )}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden
          className="-ml-0.5 inline-flex text-muted-foreground [&>svg]:size-3.5"
        >
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  )
}

export { MetaPill }
