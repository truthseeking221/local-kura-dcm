import { Info } from 'lucide-react'
import { useState, type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type ExpandableItemRowProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Primary row content (typically the name + tags + price + action button). */
  children: ReactNode
  /** Content shown in the slotted expansion area when open. */
  expansion?: ReactNode
  /** Uncontrolled initial open state. Default `false`. */
  defaultOpen?: boolean
  /** Controlled open state. */
  open?: boolean
  /** Fires whenever the open state would change — required for fully
   *  controlled mode, optional for uncontrolled mode (acts as a change hook). */
  onOpenChange?: (open: boolean) => void
  /** A11y label for the info-toggle button when closed. Default
   *  "Show details". */
  expandLabel?: string
  /** A11y label for the info-toggle button when open. Default "Hide details". */
  collapseLabel?: string
}

/**
 * ExpandableItemRow — row layout with a trailing info-toggle button that
 * reveals an expansion slot below the row. Distinct from
 * `CollapsibleSection` (page-level: chevron + section title + body) —
 * `ExpandableItemRow` is row-level: primary row content + trailing info-button
 * + below expansion.
 *
 * Supports controlled and uncontrolled state. The button uses Lucide `Info`
 * at 14px, stroke 1.75 (matches kit chevron precedent in `SearchInput`).
 * Padding is fixed at `px-3 py-2.5` to match the kit's row rhythm; callers can
 * tint the outer element via `className` with a concrete status-token utility.
 *
 * Universal — orders catalog, lab worklist, payment line items, every clinic
 * module has a "row with details" pattern.
 */
function ExpandableItemRow({
  children,
  expansion,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  expandLabel,
  collapseLabel,
  className,
  ...props
}: ExpandableItemRowProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  function handleToggle() {
    const next = !isOpen
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <div
      data-slot="expandable-item-row"
      data-state={isOpen ? 'open' : 'closed'}
      className={cn(
        'rounded-[var(--radius)] transition-colors',
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3 px-3 py-2.5">
        {children}
        <button
          type="button"
          aria-label={
            isOpen ? (collapseLabel ?? 'Hide details') : (expandLabel ?? 'Show details')
          }
          aria-expanded={isOpen}
          onClick={handleToggle}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Info size={14} strokeWidth={1.75} />
        </button>
      </div>
      {isOpen && expansion ? (
        <div className="px-3 pb-3">{expansion}</div>
      ) : null}
    </div>
  )
}

export { ExpandableItemRow, type ExpandableItemRowProps }
