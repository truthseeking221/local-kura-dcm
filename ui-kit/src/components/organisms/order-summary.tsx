import { BadgePercent, Receipt } from 'lucide-react'
import { Fragment, type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'
import { SectionLabel } from '../atoms/section-label.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from '../ui/table.tsx'

type OrderSummaryItem = {
  id: string
  name: ReactNode
  /** Pre-formatted price text. Caller decides format ("$8.00", "—", "Free",
   *  "8,000 ៛"). Kit does not own currency formatting. */
  priceText: ReactNode
}

type OrderSummaryGroup = {
  id: string
  /** Group header label (e.g. "Vitals", "Lab tests", "Teleconsultation"). */
  label: ReactNode
  items: OrderSummaryItem[]
}

type OrderSummaryAdjustment = {
  id: string
  /** Left-side label (e.g. "Promo SAVE10"). */
  label: ReactNode
  /** Pre-formatted right-side value (e.g. "−$10.00"). */
  valueText: ReactNode
  /** Visual emphasis — `'success'` renders the row in success-foreground
   *  PAIRED with a small `<BadgePercent>` icon (status-by-color-alone rule).
   *  `'neutral'` is the default. */
  tone?: 'success' | 'neutral'
  /** When provided, a small inline Remove link button appears next to the
   *  label. */
  onRemove?: () => void
}

type OrderSummaryProps = Omit<ComponentProps<'section'>, 'children' | 'title'> & {
  groups: OrderSummaryGroup[]
  /** Pre-formatted subtotal. Omit to hide the subtotal row. */
  subtotalText?: ReactNode
  /** Adjustment rows rendered between subtotal and total. */
  adjustments?: OrderSummaryAdjustment[]
  /** Pre-formatted total. Required. */
  totalText: ReactNode
  /** Title — defaults to "Order summary". */
  title?: ReactNode
  /** Leading icon — defaults to a Lucide `<Receipt size={14} strokeWidth={1.75}/>`.
   *  Pass any ReactNode to override. */
  icon?: ReactNode
  /** Right-aligned item-count label in the header. Computed from `groups` by
   *  default ("12 items" / "1 item"). Pass any ReactNode to override
   *  (e.g. for i18n). */
  itemCountLabel?: ReactNode
  /** Subtotal-row label text. Default "Subtotal". */
  subtotalLabel?: ReactNode
  /** Total-row label text. Default "Total due". */
  totalLabel?: ReactNode
  /** Empty-state slot when no groups have items. Defaults to a minimal muted
   *  message. */
  emptyState?: ReactNode
}

/**
 * OrderSummary — read-only, receipt-style order breakdown:
 * header (icon + title + item count) → grouped table body (per-category
 * sub-header rows + item rows with right-aligned price text) → footer
 * (subtotal + adjustments + total).
 *
 * Universal — serves receptionist (review/summary), phlebo (draw list), and
 * patient (own orders). Apps own the cart-store-to-props wiring shell.
 *
 * Currency formatting is the caller's responsibility — all price/total/value
 * fields accept pre-formatted ReactNode so the kit does not hard-code USD or
 * any locale.
 */
function OrderSummary({
  groups,
  subtotalText,
  adjustments,
  totalText,
  title = 'Order summary',
  icon = <Receipt size={14} strokeWidth={1.75} aria-hidden />,
  itemCountLabel,
  subtotalLabel = 'Subtotal',
  totalLabel = 'Total due',
  emptyState,
  className,
  ...props
}: OrderSummaryProps) {
  const nonEmptyGroups = groups.filter((g) => g.items.length > 0)
  const totalItemCount = nonEmptyGroups.reduce((sum, g) => sum + g.items.length, 0)
  const resolvedItemCountLabel =
    itemCountLabel ?? `${totalItemCount} ${totalItemCount === 1 ? 'item' : 'items'}`
  const hasAnyItems = nonEmptyGroups.length > 0

  return (
    <section
      data-slot="order-summary"
      className={cn(
        'rounded-[var(--radius-lg)] border border-border bg-card',
        className,
      )}
      {...props}
    >
      <header className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span aria-hidden className="text-muted-foreground [&>svg]:size-3.5">
          {icon}
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {resolvedItemCountLabel}
        </span>
      </header>

      {hasAnyItems ? (
        <Table>
          <TableBody>
            {nonEmptyGroups.map((g) => (
              <Fragment key={g.id}>
                <TableRow data-group-header className="border-0 hover:bg-transparent">
                  <TableHead colSpan={2} className="h-auto px-5 py-2">
                    <SectionLabel>
                      {g.label} · {g.items.length}
                    </SectionLabel>
                  </TableHead>
                </TableRow>
                {g.items.map((item) => (
                  <TableRow key={item.id} className="border-0 hover:bg-transparent">
                    <TableCell className="px-5 py-1 text-sm">{item.name}</TableCell>
                    <TableCell className="px-5 py-1 text-right font-mono text-sm tabular-nums text-muted-foreground">
                      {item.priceText}
                    </TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
          <TableFooter className="bg-transparent">
            {subtotalText !== undefined && subtotalText !== null ? (
              <TableRow className="border-t border-border hover:bg-transparent">
                <TableCell className="px-5 py-1.5 text-sm text-muted-foreground">
                  {subtotalLabel}
                </TableCell>
                <TableCell className="px-5 py-1.5 text-right font-mono text-sm tabular-nums">
                  {subtotalText}
                </TableCell>
              </TableRow>
            ) : null}
            {adjustments?.map((adj) => (
              <TableRow
                key={adj.id}
                className={cn(
                  'border-0 hover:bg-transparent',
                  adj.tone === 'success' ? 'text-[var(--success-700)]' : undefined,
                )}
              >
                <TableCell className="px-5 py-1.5 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    {adj.tone === 'success' ? (
                      <BadgePercent size={12} strokeWidth={1.75} aria-hidden />
                    ) : null}
                    {adj.label}
                    {adj.onRemove ? (
                      <button
                        type="button"
                        onClick={adj.onRemove}
                        className="ml-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </button>
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-1.5 text-right font-mono text-sm tabular-nums">
                  {adj.valueText}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t border-dashed border-border hover:bg-transparent">
              <TableCell className="px-5 py-2 text-base font-semibold">
                {totalLabel}
              </TableCell>
              <TableCell className="px-5 py-2 text-right font-mono text-base font-semibold tabular-nums">
                {totalText}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      ) : (
        emptyState ?? (
          <p className="px-5 py-6 text-center text-sm text-muted-foreground">
            No items in this order yet.
          </p>
        )
      )}
    </section>
  )
}

export {
  OrderSummary,
  type OrderSummaryAdjustment,
  type OrderSummaryGroup,
  type OrderSummaryItem,
  type OrderSummaryProps,
}
