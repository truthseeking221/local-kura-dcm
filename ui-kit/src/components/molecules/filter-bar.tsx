import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type FilterBarProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Typically multiple `<FilterGroup>` children. */
  children: ReactNode
}

/**
 * FilterBar — a named anchor for the horizontal-row-of-FilterGroups pattern.
 * Pairs with `<FilterGroup>` from this layer.
 *
 * The shape is intentionally thin (a flex container) so the visual contract
 * is consolidated under one named primitive rather than re-spelled inline
 * across every catalog page.
 *
 * Universal — orders catalog, patient list filters, lab worklist, every
 * clinic module surfaces a horizontal filter-row pattern.
 */
function FilterBar({ children, className, ...props }: FilterBarProps) {
  return (
    <div
      data-slot="filter-bar"
      className={cn('flex items-center gap-4 text-xs', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { FilterBar, type FilterBarProps }
