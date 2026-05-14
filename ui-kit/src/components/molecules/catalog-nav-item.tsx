import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'
import { CountBadge } from './count-badge.tsx'

type CatalogNavItemProps = Omit<ComponentProps<'button'>, 'children'> & {
  /** Primary label for the catalogue/category row. */
  label: ReactNode
  /** Leading icon slot. Keep icon sizing at the call site for domain-specific glyphs. */
  icon?: ReactNode
  /** Optional numeric count, rendered with the shared CountBadge molecule. */
  count?: number
  /** Optional keyboard shortcut chip, e.g. `1` for Bundles. */
  shortcut?: ReactNode
  /** Controlled selected state. */
  active?: boolean
  /** Slightly stronger default text treatment for high-level entries. */
  emphasized?: boolean
}

/**
 * CatalogNavItem — compact category row for operational catalogues and
 * worklists: icon + label + count + optional shortcut key.
 *
 * Universal. It owns only the visual row contract; callers own category data,
 * active state, and click handling.
 *
 * Chrome exception: the trailing CountBadge digits render at `10.5px` —
 * non-body chrome numerals (see CLAUDE.md body-min-11 carve-out for count
 * badges).
 */
function CatalogNavItem({
  label,
  icon,
  count,
  shortcut,
  active = false,
  emphasized = false,
  className,
  type = 'button',
  ...props
}: CatalogNavItemProps) {
  return (
    <button
      data-slot="catalog-nav-item"
      data-active={active ? 'true' : 'false'}
      aria-pressed={active}
      type={type}
      className={cn(
        'grid w-full grid-cols-[16px_minmax(0,1fr)_auto_auto] items-center gap-2 rounded-[var(--radius-sm)] border border-transparent px-2 py-[7px] text-left text-k-sm font-semibold leading-k-tight text-[var(--ink-700)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--ink-900)] focus-visible:border-[var(--border-focus)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        active &&
          'border-[var(--border)] bg-[var(--surface)] text-[var(--ink-900)] shadow-[var(--shadow-xs)]',
        emphasized && 'text-[var(--ink-800)]',
        className,
      )}
      {...props}
    >
      <span className="grid size-4 place-items-center" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 truncate">{label}</span>
      {typeof count === 'number' ? (
        <CountBadge
          count={count}
          variant={active ? 'accent' : 'default'}
          className="h-[17px] min-w-5 rounded-full px-[7px] font-sans text-[10.5px] leading-k-snug"
        />
      ) : null}
      {shortcut ? (
        <kbd
          className={cn(
            'inline-flex h-4 min-w-4 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border-strong)] border-b-2 bg-[var(--surface)] px-1 font-mono text-k-xs font-bold leading-none text-[var(--ink-500)] opacity-50 shadow-[var(--shadow-xs)]',
            active && 'border-[var(--brand-200)] text-[var(--brand-700)] opacity-100',
          )}
        >
          {shortcut}
        </kbd>
      ) : null}
    </button>
  )
}

export { CatalogNavItem, type CatalogNavItemProps }
