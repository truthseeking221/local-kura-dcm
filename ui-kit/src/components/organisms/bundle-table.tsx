import { ChevronDown } from 'lucide-react'
import {
  Fragment,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'

import { cn } from '../../lib/cn.ts'
import { IconBadge } from '../molecules/icon-badge.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table.tsx'

type BundleTableItem = {
  id: string
  /** Leading icon content. Wrapped internally in `<IconBadge tone="brand" size="md">`. Pass a Lucide icon or `<Icon>` element. */
  icon: ReactNode
  name: ReactNode
  description?: ReactNode
  /** Right-side member-count label, e.g. "7 tests". Plain text. */
  countText?: ReactNode
  /** Pre-formatted total price text, e.g. "$45.00". Caller owns currency formatting. */
  totalText: ReactNode
  /** Trailing action slot — typically a `<Button>`. */
  action: ReactNode
  /** Expansion content rendered in a sub-row when the chevron is toggled open.
   *  If omitted, the chevron button is not rendered. */
  expansion?: ReactNode
  /** Default-open state for this item's expansion. Default `false`. */
  defaultOpen?: boolean
}

type BundleTableProps = Omit<ComponentProps<'div'>, 'children'> & {
  items: BundleTableItem[]
  /** Show the column header row. Default `true`. */
  showHeader?: boolean
  /** Column header labels (i18n). */
  nameHeader?: ReactNode
  countHeader?: ReactNode
  totalHeader?: ReactNode
  /** Rendered when `items.length === 0`. Defaults to a minimal muted message. */
  emptyState?: ReactNode
}

/**
 * BundleTable — flat 5-column table for displaying a list of bundles (each a
 * package of tests). Per-row chevron button toggles an expansion sub-row that
 * holds member-test chips or any other detail content. Internal `useState`
 * tracks the open set; each item may declare `defaultOpen`.
 *
 * Columns: chevron (8) · icon + name + description · count (20) · total (24) ·
 * action (32). Default-collapsed.
 *
 * Universal — every clinic module could reasonably surface a bundle picker
 * (receptionist orders, phlebo verify, patient self-service).
 *
 * Currency formatting is the caller's responsibility — `totalText` and
 * `countText` accept pre-formatted ReactNode.
 */
function BundleTable({
  items,
  showHeader = true,
  nameHeader,
  countHeader,
  totalHeader,
  emptyState,
  className,
  ...props
}: BundleTableProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(items.filter((i) => i.defaultOpen).map((i) => i.id)),
  )

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (items.length === 0) {
    return (
      <div data-slot="bundle-table" className={cn(className)} {...props}>
        {emptyState ?? (
          <p className="px-5 py-6 text-center text-sm text-muted-foreground">
            No bundles available.
          </p>
        )}
      </div>
    )
  }

  return (
    <div data-slot="bundle-table" className={cn(className)} {...props}>
      <Table>
        {showHeader ? (
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>{nameHeader ?? 'Bundle'}</TableHead>
              <TableHead className="w-20 text-right">
                {countHeader ?? 'Tests'}
              </TableHead>
              <TableHead className="w-24 text-right">
                {totalHeader ?? 'Total'}
              </TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
        ) : null}
        <TableBody>
          {items.map((item) => {
            const isOpen = openIds.has(item.id)
            const hasExpansion = !!item.expansion
            return (
              <Fragment key={item.id}>
                <TableRow data-state={isOpen ? 'open' : 'closed'}>
                  <TableCell className="w-8 align-top">
                    {hasExpansion ? (
                      <button
                        type="button"
                        aria-label={isOpen ? 'Collapse bundle' : 'Expand bundle'}
                        aria-expanded={isOpen}
                        onClick={() => toggle(item.id)}
                        className="inline-flex size-6 items-center justify-center rounded-[var(--radius-sm)] text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <ChevronDown
                          size={14}
                          strokeWidth={1.75}
                          className={cn(
                            'transition-transform',
                            !isOpen && '-rotate-90',
                          )}
                        />
                      </button>
                    ) : null}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex items-start gap-3">
                      <IconBadge tone="brand" size="md">
                        {item.icon}
                      </IconBadge>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold leading-tight">
                          {item.name}
                        </div>
                        {item.description ? (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top text-right text-xs text-muted-foreground">
                    {item.countText}
                  </TableCell>
                  <TableCell className="align-top text-right font-mono text-sm tabular-nums">
                    {item.totalText}
                  </TableCell>
                  <TableCell className="align-top text-right">
                    {item.action}
                  </TableCell>
                </TableRow>
                {isOpen && item.expansion ? (
                  <TableRow data-row-expansion>
                    <TableCell colSpan={5} className="bg-muted/30 px-5 py-3">
                      {item.expansion}
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export { BundleTable, type BundleTableItem, type BundleTableProps }
