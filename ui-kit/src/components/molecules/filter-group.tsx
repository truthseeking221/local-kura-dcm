import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'
import { SectionLabel } from '../atoms/section-label.tsx'

type FilterGroupProps = Omit<ComponentProps<'div'>, 'children' | 'title'> & {
  /** Tiny-caps label text. */
  label: ReactNode
  /** Optional leading icon next to the label (e.g. `<SlidersHorizontal size={12} strokeWidth={2}/>`).
   *  12px / 2-stroke icons read well at this scale. The icon inherits
   *  muted-foreground color via `currentColor`. */
  icon?: ReactNode
  /** The control slot — typically a `<ToggleGroup>`. */
  children: ReactNode
}

/**
 * FilterGroup — compact inline filter row: tiny-caps label (optionally with a
 * leading 12px icon) sitting next to a small control such as `<ToggleGroup>`.
 *
 * Mirrors the Price/Coverage filter pair on the orders catalog. Stack multiple
 * `FilterGroup`s horizontally to build a filter strip.
 */
function FilterGroup({ label, icon, children, className, ...props }: FilterGroupProps) {
  return (
    <div
      data-slot="filter-group"
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      <SectionLabel>
        {icon ? (
          <span className="inline-flex items-center gap-1">
            {icon}
            {label}
          </span>
        ) : (
          label
        )}
      </SectionLabel>
      {children}
    </div>
  )
}

export { FilterGroup }
