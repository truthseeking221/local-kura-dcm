import {
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'

import { cn } from '../../lib/cn.ts'
import { Icon } from '../atoms/icon.tsx'
import { SectionLabel } from '../atoms/section-label.tsx'
import { IconBadge } from '../molecules/icon-badge.tsx'
import { Button } from '../ui/button.tsx'

// ── Types ────────────────────────────────────────────────────────────────

type OrderCartItemKind = 'vitals' | 'telecon' | 'lab'

type OrderCartItem = {
  id: string
  kind: OrderCartItemKind
  name: ReactNode
  /** Pre-formatted price text. Pass null to render a dash placeholder. Caller owns currency formatting. */
  priceText: ReactNode | null
  /** Optional subtitle (e.g. "HDL, LDL, Total cholesterol, …"). */
  subtitle?: ReactNode
  /** Per-row remove handler. When omitted, the remove button is not rendered. */
  onRemove?: () => void
}

type OrderCartGroupKey = 'vitals' | 'telecon' | 'lab'

type OrderCartGroup = {
  key: OrderCartGroupKey
  label: ReactNode
  count: number
  /** Pre-formatted subtotal text. */
  subtotalText: ReactNode
  items: OrderCartItem[]
}

type OrderCartBundle = {
  id: string
  title: ReactNode
  subtitle: ReactNode
  ordersCount: number
  defaultExpanded?: boolean
  /** Member items shown when the bundle is expanded. */
  children?: OrderCartItem[]
  /** Per-bundle cancel handler. When omitted, the cancel button is not rendered. */
  onCancel?: () => void
}

type OrderCartResultPillTone = 'first' | 'last' | 'all'

type OrderCartResultPill = {
  id: string
  tone: OrderCartResultPillTone
  iconName: 'tabler:zap' | 'tabler:hourglass' | 'tabler:alert-circle'
  label: ReactNode
  /** Pre-formatted ETA text, e.g. "~ 2h". */
  etaText: ReactNode
  /** Free-text meta column (e.g. "internal lab" or "external: HbA1c, Kidney\nFunction"). */
  meta: ReactNode
}

type OrderCartExternalLab = {
  /** Iconify name for the country flag, e.g. "circle-flags:vn". Replaces the previous emoji glyph. */
  flagIcon: string
  /** Label, e.g. "VN lab". */
  label: ReactNode
  /** Pre-formatted ETA text, e.g. "ETA 1d". */
  etaText: ReactNode
}

type OrderCartProps = Omit<ComponentProps<'aside'>, 'children'> & {
  itemCount: number
  bundles?: OrderCartBundle[]
  groups: OrderCartGroup[]
  /** Pre-formatted "Patient pays" amount. */
  patientPaysText: ReactNode
  /** When true, expose the promo + split-bill section. The caller provides `promoSlot` for the promo control. */
  showPromoSplit?: boolean
  /** Pre-formatted subtotal text shown in the promo section above the promo input. */
  promoSubtotalText?: ReactNode
  /** App-supplied promo control (typically a `<PromoCodeForm>`). Rendered inside the promo+split-bill section. */
  promoSlot?: ReactNode
  /** App-supplied split-bill action (typically a kit `<Button>`). Rendered below the promo control. */
  splitBillSlot?: ReactNode
  /** "Still needed" checklist items — short string labels. */
  stillNeeded: string[]
  /** Optional Results-turnaround pills. When empty/omitted, a muted placeholder renders. */
  resultsPills?: OrderCartResultPill[]
  /** Optional external-lab chip in the results section. */
  externalLab?: OrderCartExternalLab
  /** Top-right Clear action handler. When omitted, the Clear button is hidden. */
  onClear?: () => void
  /** Top-right Expand action handler. When omitted, the Expand button is hidden. */
  onExpand?: () => void
  /** Empty-cart action. Apps usually open the Add tab. */
  onAddFirst?: () => void
  /** Bottom CTA — disabled when `false`. */
  ctaEnabled?: boolean
  /** Bottom CTA label. Default "Check in & confirm order". */
  ctaLabel?: ReactNode
  /** Bottom CTA handler. */
  onCta?: () => void
}

// ── Private atoms ────────────────────────────────────────────────────────

const GROUP_BADGE_TONE: Record<OrderCartItemKind, 'info' | 'success' | 'warning'> = {
  vitals: 'info',
  lab: 'success',
  telecon: 'warning',
}

const GROUP_FG_VAR: Record<OrderCartItemKind, string> = {
  vitals: 'var(--status-info-fg)',
  lab: 'var(--status-success-fg)',
  telecon: 'var(--status-warning-fg)',
}

const GROUP_ICON_NAME: Record<OrderCartItemKind, string> = {
  vitals: 'tabler:activity',
  telecon: 'tabler:video',
  lab: 'tabler:flask',
}

const PILL_TONE_VAR: Record<
  OrderCartResultPillTone,
  { bg: string; border: string; fg: string }
> = {
  first: {
    bg: 'var(--status-info-bg)',
    border: 'var(--border)',
    fg: 'var(--status-info-fg)',
  },
  last: {
    bg: 'var(--surface-2)',
    border: 'var(--border)',
    fg: 'var(--muted-foreground)',
  },
  all: {
    bg: 'var(--status-warning-bg)',
    border: 'var(--status-warning-bg)',
    fg: 'var(--status-warning-fg)',
  },
}

/** Visually distinct from `<CountBadge>` — bordered white pill, not a muted chip.
 *  Internal to OrderCart only. Promote separately if a second consumer appears. */
function CountBadgeKit({ count }: { count: number }) {
  return (
    <span className="inline-flex h-[17px] min-w-[18px] items-center justify-center rounded-[var(--radius-xs)] border border-border bg-card px-1.5 text-k-xs font-semibold leading-none tabular-nums text-muted-foreground">
      {count}
    </span>
  )
}

function PriceCell({ value }: { value: ReactNode | null }) {
  if (value === null || value === undefined) {
    return (
      <span className="text-k-sm font-bold text-foreground">
        —
      </span>
    )
  }
  return (
    <span className="text-k-sm font-bold tabular-nums text-foreground">
      {value}
    </span>
  )
}

function GroupTileIcon({ kind }: { kind: OrderCartItemKind }) {
  return (
    <IconBadge tone={GROUP_BADGE_TONE[kind]} size="sm" aria-hidden>
      <Icon name={GROUP_ICON_NAME[kind]} size={16} strokeWidth={1.5} />
    </IconBadge>
  )
}

// ── Sections ─────────────────────────────────────────────────────────────

function CartHeader({
  itemCount,
  onClear,
  onExpand,
}: {
  itemCount: number
  onClear?: () => void
  onExpand?: () => void
}) {
  return (
    <div className="flex h-[46px] items-center gap-2.5 border-b border-border px-3.5 pb-2.5 pt-2.5">
      <Icon name="tabler:shopping-cart" size={16} className="text-[var(--brand-500)]" />
      <span className="flex-1 text-k-h font-bold text-foreground">
        Order Cart
      </span>
      {itemCount > 0 ? (
        <span className="text-k-xs leading-none text-muted-foreground">
          {itemCount} items
        </span>
      ) : null}
      {onClear ? (
        <button
          type="button"
          aria-label="Clear all removable items"
          onClick={onClear}
          className="inline-flex h-6 items-center gap-1 rounded-[var(--radius-xs)] px-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon name="tabler:trash" size={12} />
          <span className="text-k-xs font-semibold">Clear</span>
        </button>
      ) : null}
      {onExpand ? (
        <button
          type="button"
          aria-label="Expand cart for full review"
          onClick={onExpand}
          className="inline-flex size-6 items-center justify-center rounded-[var(--radius-sm)] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon name="tabler:arrows-maximize" size={12} />
        </button>
      ) : null}
    </div>
  )
}

function CartEmptyState({ onAddFirst }: { onAddFirst?: () => void }) {
  return (
    <div className="flex min-h-[197px] flex-col items-center justify-center px-4 py-7 text-center">
      <span
        aria-hidden
        className="mb-2 inline-flex size-9 items-center justify-center rounded-full bg-[var(--ink-50)] text-[var(--ink-400)]"
      >
        <Icon name="tabler:shopping-cart" size={27} strokeWidth={2.25} />
      </span>
      <div className="text-k-sm font-semibold text-[var(--ink-700)]">
        No items yet
      </div>
      <div className="mt-2 max-w-[220px] text-k-xs text-[var(--ink-500)]">
        Search tests, services, or packages from the Add tab.
      </div>
      {onAddFirst ? (
        <button
          type="button"
          onClick={onAddFirst}
          className="mt-4 inline-flex h-[30px] items-center justify-center gap-2 rounded-[var(--radius)] border border-[var(--brand-300)] bg-[var(--surface)] px-3 text-k-body font-semibold text-[var(--brand-700)] transition-colors hover:border-[var(--brand-400)] hover:bg-[var(--brand-50)] focus-visible:shadow-[var(--shadow-focus)]"
        >
          <Icon name="tabler:plus" size={16} strokeWidth={2} />
          Add first order
        </button>
      ) : null}
    </div>
  )
}

function BundleRow({ bundle }: { bundle: OrderCartBundle }) {
  const [expanded, setExpanded] = useState<boolean>(bundle.defaultExpanded ?? false)
  return (
    <div className="flex flex-col border-b border-border pb-0.5">
      <div className="flex items-center gap-2 pr-2">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
          className="flex flex-1 items-start gap-1.5 rounded-[var(--radius-sm)] py-2 pl-3.5 pr-1.5 text-left transition-colors hover:bg-accent"
        >
          <Icon
            name={expanded ? 'tabler:chevron-up' : 'tabler:chevron-down'}
            size={12}
            className="mt-1 shrink-0 text-muted-foreground"
          />
          <div className="flex flex-1 flex-col">
            <span className="text-k-body font-bold text-foreground">
              {bundle.title}
            </span>
            <span className="text-k-xs font-medium text-muted-foreground">
              {bundle.subtitle}
            </span>
          </div>
        </button>
        <span className="shrink-0 text-k-xs font-semibold leading-none text-muted-foreground">
          {bundle.ordersCount} orders
        </span>
        {bundle.onCancel ? (
          <button
            type="button"
            aria-label={`Cancel bundle`}
            onClick={bundle.onCancel}
            className="inline-flex h-6 items-center gap-1 rounded-[var(--radius-sm)] px-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Icon name="tabler:trash" size={12} />
            <span className="text-k-xs font-bold">Cancel</span>
          </button>
        ) : null}
      </div>

      {expanded && bundle.children ? (
        <div className="flex flex-col pl-9 pr-3.5 pb-1">
          {bundle.children.map((child, idx) => (
            <div
              key={child.id}
              className={cn(
                'flex items-start gap-2.5 py-1.5',
                idx < bundle.children!.length - 1 && 'border-b border-border',
              )}
            >
              <div className="flex flex-1 flex-col">
                <span className="text-k-sm font-medium text-foreground">
                  {child.name}
                </span>
                {child.subtitle ? (
                  <span className="whitespace-pre-line text-k-xs text-muted-foreground">
                    {child.subtitle}
                  </span>
                ) : null}
              </div>
              <PriceCell value={child.priceText} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function GroupHeader({ group }: { group: OrderCartGroup }) {
  const fg = GROUP_FG_VAR[group.key]
  return (
    <div
      className="grid h-[29px] w-full grid-cols-[12px_auto_18px_1fr] items-center gap-1.5 pb-1 pl-3.5 pr-10 pt-2 text-left"
    >
      <Icon name="tabler:chevron-down" size={12} style={{ color: fg }} />
      <span
        className="text-k-sm font-bold"
        style={{ color: fg }}
      >
        {group.label}
      </span>
      <CountBadgeKit count={group.count} />
      <span className="text-right text-k-sm font-semibold tabular-nums text-foreground">
        {group.subtotalText}
      </span>
    </div>
  )
}

function ItemListRow({ row, divider }: { row: OrderCartItem; divider: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 py-1.5',
        divider && 'border-b border-border',
      )}
    >
      <GroupTileIcon kind={row.kind} />
      <span className="flex-1 text-k-sm font-medium text-foreground">
        {row.name}
      </span>
      <PriceCell value={row.priceText} />
      {row.onRemove ? (
        <button
          type="button"
          aria-label="Remove item"
          onClick={row.onRemove}
          className="inline-flex size-[18px] items-center justify-center rounded-[var(--radius-xs)] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon name="tabler:x" size={12} />
        </button>
      ) : null}
    </div>
  )
}

function ItemGroupBlock({ group }: { group: OrderCartGroup }) {
  return (
    <div className="flex flex-col px-3.5">
      <GroupHeader group={group} />
      <div className="flex flex-col">
        {group.items.map((row, idx) => (
          <ItemListRow key={row.id} row={row} divider={idx < group.items.length - 1} />
        ))}
      </div>
    </div>
  )
}

function PatientPaysBar({
  amountText,
  expanded,
}: {
  amountText: ReactNode
  expanded?: boolean
}) {
  return (
    <div
      className="grid grid-cols-[1fr_auto_14px] items-center gap-2.5 border-y border-border bg-[var(--surface-2)] px-3.5 py-2.5"
    >
      <span className="text-k-body font-bold text-foreground">Patient pays</span>
      <span className="text-k-body font-bold tabular-nums text-foreground">
        {amountText}
      </span>
      <Icon
        name={expanded ? 'tabler:chevron-up' : 'tabler:chevron-down'}
        size={14}
        className="text-muted-foreground"
      />
    </div>
  )
}

function PromoSplitSection({
  subtotalText,
  promoSlot,
  splitBillSlot,
}: {
  subtotalText: ReactNode
  promoSlot?: ReactNode
  splitBillSlot?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border bg-[var(--surface-2)] px-4 pb-2.5 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-k-sm text-[var(--foreground)]/80">Subtotal</span>
        <span className="text-k-sm tabular-nums text-[var(--foreground)]/80">
          {subtotalText}
        </span>
      </div>
      {promoSlot}
      {splitBillSlot}
    </div>
  )
}

function StatusBox({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-col gap-1.5 rounded-[var(--radius)] border border-border bg-[var(--surface-2)] px-2.5 py-2">
      <div className="flex items-center gap-1.5">
        <Icon name="tabler:list-check" size={12} className="text-muted-foreground" />
        <SectionLabel>Still needed</SectionLabel>
      </div>
      <ul className="flex list-disc flex-col gap-1 pl-4 marker:text-[var(--foreground)]/80">
        {items.map((it, i) => (
          <li key={i} className="text-k-xs text-[var(--foreground)]/80">
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

function PayCTA({
  ctaEnabled,
  ctaLabel,
  onCta,
}: {
  ctaEnabled: boolean
  ctaLabel: ReactNode
  onCta?: () => void
}) {
  return (
    <Button
      variant={ctaEnabled ? 'default' : 'secondary'}
      size="lg"
      disabled={!ctaEnabled}
      onClick={onCta}
      className="w-full"
    >
      {!ctaEnabled ? <Icon name="tabler:lock" size={14} /> : null}
      {ctaLabel}
    </Button>
  )
}

function StatusCTABlock({
  stillNeeded,
  ctaEnabled,
  ctaLabel,
  onCta,
}: {
  stillNeeded: string[]
  ctaEnabled: boolean
  ctaLabel: ReactNode
  onCta?: () => void
}) {
  return (
    <div className="flex flex-col gap-2 px-4 pb-3.5 pt-2.5">
      <StatusBox items={stillNeeded} />
      <PayCTA ctaEnabled={ctaEnabled} ctaLabel={ctaLabel} onCta={onCta} />
    </div>
  )
}

function ResultsTurnaround({
  pills,
  externalLab,
}: {
  pills?: OrderCartResultPill[]
  externalLab?: OrderCartExternalLab
}) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-border bg-[var(--surface-2)] px-3 py-2">
      <div className="flex items-center gap-1.5">
        <Icon name="tabler:clock" size={12} className="text-muted-foreground" />
        <SectionLabel>Results turnaround</SectionLabel>
      </div>
      {pills && pills.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card">
            {pills.map((p, i) => {
              const c = PILL_TONE_VAR[p.tone]
              const banded = i === 1
              return (
                <div
                  key={p.id}
                  className={cn(
                    'grid grid-cols-[24px_1fr_auto_auto] items-center gap-2.5 px-3 py-2.5',
                    i < pills.length - 1 && 'border-b border-border',
                    banded && 'bg-[var(--surface-2)]',
                  )}
                >
                  <span
                    aria-hidden
                    className="inline-flex size-6 items-center justify-center rounded-[var(--radius-sm)] border"
                    style={{ backgroundColor: c.bg, borderColor: c.border }}
                  >
                    <Icon
                      name={p.iconName}
                      size={12}
                      strokeWidth={1.5}
                      style={{ color: c.fg }}
                    />
                  </span>
                  <span className="text-k-sm font-semibold text-foreground">
                    {p.label}
                  </span>
                  <span className="text-k-body font-bold tabular-nums text-foreground">
                    {p.etaText}
                  </span>
                  <span className="max-w-[100px] whitespace-pre-line text-right text-k-xs text-muted-foreground">
                    {p.meta}
                  </span>
                </div>
              )
            })}
          </div>
          {externalLab ? (
            <div className="flex items-center gap-2">
              <span className="text-k-xs font-semibold text-muted-foreground">
                External tests sent to:
              </span>
              <span className="inline-flex h-[23px] items-center gap-1 rounded-[var(--radius-lg)] border border-border bg-[var(--surface-2)] px-2">
                <Icon name={externalLab.flagIcon} size={16} strokeWidth={null} />
                <span className="text-k-xs font-semibold text-foreground">
                  {externalLab.label}
                </span>
                <span className="text-k-xs font-medium text-muted-foreground">
                  · {externalLab.etaText}
                </span>
              </span>
            </div>
          ) : null}
        </>
      ) : (
        <div className="py-4 text-center text-k-sm text-muted-foreground">
          Add lab tests or imaging to see the result timeline.
        </div>
      )}
    </div>
  )
}

// ── Card composition ────────────────────────────────────────────────────

/**
 * OrderCart — receptionist's order-rail organism. Header (icon + title + count + Clear/Expand) over
 * bundles (collapsible per-bundle disclosures) + grouped items (vitals / lab / telecon, each with
 * tone-coded chevron-header rows) + "Patient pays" total + optional promo+split section + still-needed
 * checklist + results-turnaround timeline + bottom Check-in CTA.
 *
 * Universal in shape; receptionist-tagged because no other module currently uses an order-rail of this
 * exact composition. Other modules' carts MAY adopt this organism if their visual contract matches.
 *
 * Layout-locked geometry: cart width (`w-[360px]`), group-header chrome (`h-[46px]`, `h-[30px]`,
 * `h-[29px]`), empty-state min-height (`min-h-[197px]`), close/info buttons (`size-[18px]`),
 * external-lab pill (`h-[23px]`), promo/total caps (`max-w-[220px]`, `max-w-[100px]`) — all
 * arbitrary `[Npx]` slot dimensions encoding the canonical receptionist cart visual contract,
 * not density-derived (see CLAUDE.md "Layout-only arbitrary `[Npx]`").
 *
 * @kuraModules receptionist
 */
function OrderCart({
  itemCount,
  bundles,
  groups,
  patientPaysText,
  showPromoSplit,
  promoSubtotalText,
  promoSlot,
  splitBillSlot,
  stillNeeded,
  resultsPills,
  externalLab,
  onClear,
  onExpand,
  onAddFirst,
  ctaEnabled = false,
  ctaLabel = 'Check in & confirm order',
  onCta,
  className,
  ...rest
}: OrderCartProps) {
  return (
    <aside
      data-slot="order-cart"
      className={cn(
        'flex w-[360px] shrink-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-sm',
        className,
      )}
      {...rest}
    >
      <CartHeader itemCount={itemCount} onClear={onClear} onExpand={onExpand} />
      {itemCount === 0 ? <CartEmptyState onAddFirst={onAddFirst} /> : null}
      {itemCount === 0 ? null : (
        <>
          {bundles?.map((b) => <BundleRow key={b.id} bundle={b} />)}
          {groups.map((g) => (
            <ItemGroupBlock key={g.key} group={g} />
          ))}
          <PatientPaysBar amountText={patientPaysText} expanded={showPromoSplit} />
          {showPromoSplit ? (
            <PromoSplitSection
              subtotalText={promoSubtotalText ?? patientPaysText}
              promoSlot={promoSlot}
              splitBillSlot={splitBillSlot}
            />
          ) : null}
          <StatusCTABlock
            stillNeeded={stillNeeded}
            ctaEnabled={ctaEnabled}
            ctaLabel={ctaLabel}
            onCta={onCta}
          />
          <ResultsTurnaround pills={resultsPills} externalLab={externalLab} />
        </>
      )}
    </aside>
  )
}

export {
  OrderCart,
  type OrderCartProps,
  type OrderCartItem,
  type OrderCartItemKind,
  type OrderCartGroup,
  type OrderCartGroupKey,
  type OrderCartBundle,
  type OrderCartResultPill,
  type OrderCartResultPillTone,
  type OrderCartExternalLab,
}
