import { type HTMLAttributes, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type SectionLabelElement = 'span' | 'div' | 'dt'

type SectionLabelProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  /** Render element — defaults to `<span>`. Use `'dt'` inside a definition list,
   *  `'div'` for block layout. */
  as?: SectionLabelElement
  children: ReactNode
}

/**
 * SectionLabel — the tiny-caps chrome label observed across the kit
 * (`DataPoint`, `CollapsibleSection`) and the receptionist orders flow
 * (catalog filter labels, the sidebar "Panels" heading, TestInfoExpansion's
 * section headers). Density-aware via `text-k-xs` (resolves to 11px at cozy /
 * 10.5px at compact / 11px at comfortable). Uppercase, `tracking-k-caps`,
 * font-semibold, muted-foreground.
 *
 * Brand note: snapped from a fixed 10px to density-aware `text-k-xs` to
 * satisfy the 11px body-text floor at cozy/comfortable while still rendering
 * tight chrome at compact density.
 */
function SectionLabel({ as = 'span', children, className, ...props }: SectionLabelProps) {
  const Tag = as
  return (
    <Tag
      data-slot="section-label"
      className={cn(
        'text-k-xs font-semibold uppercase tracking-k-caps text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export { SectionLabel }
