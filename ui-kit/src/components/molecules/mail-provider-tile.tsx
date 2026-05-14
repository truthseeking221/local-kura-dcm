import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type MailProviderTileProps = Omit<ComponentProps<'a'>, 'children'> & {
  /** Required tile icon — typically `<Icon name="logos:google-gmail" strokeWidth={null} />`. */
  icon: ReactNode
  /** Tile label, e.g. "Open Gmail". */
  label: string
  /** External URL — opens in `_blank` with `noopener noreferrer`. */
  href: string
}

/**
 * MailProviderTile — square tile that deep-links into a webmail provider
 * (Gmail, Outlook). Used by `CheckInboxCard` in a 2-column grid below the
 * email-echo line. Renders as `<a target="_blank" rel="noopener noreferrer">` —
 * caller is free to override `target` / `rel` if their flow demands.
 */
function MailProviderTile({
  icon,
  label,
  href,
  className,
  target,
  rel,
  ...props
}: MailProviderTileProps) {
  return (
    <a
      data-slot="mail-provider-tile"
      href={href}
      target={target ?? '_blank'}
      rel={rel ?? 'noopener noreferrer'}
      className={cn(
        'flex h-[80px] w-full flex-col items-center justify-center gap-1.5 rounded-[var(--radius)] border border-border bg-card text-k-body font-medium text-[var(--ink-700)] transition-colors',
        'hover:bg-[var(--surface-2)] hover:text-[var(--ink-900)]',
        'focus-visible:border-[var(--border-focus)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="inline-flex size-6 shrink-0 items-center justify-center [&>img]:size-6 [&>img]:object-contain [&>svg]:size-6"
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </a>
  )
}

export { MailProviderTile, type MailProviderTileProps }
