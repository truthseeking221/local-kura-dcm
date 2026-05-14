import { Icon } from '../atoms/icon.tsx'
import { SpecialtyBadge, type SpecialtyBadgeTone } from '../atoms/specialty-badge.tsx'
import { Button } from '../ui/button.tsx'
import { cn } from '../../lib/cn.ts'

type CatalogTestRowTag = {
  label: string
  tone: SpecialtyBadgeTone
}

type CatalogTestRowProps = {
  /** Test name, e.g. "Complete Blood Count (CBC)". Truncated when narrow. */
  name: string
  /** Optional category / discoverability tags. Recommended ≤ 2 per row. */
  tags?: CatalogTestRowTag[]
  /** Pre-formatted price string (kit does not own currency formatting). */
  price: string
  /** When true, applies a subtle brand-tinted row background (used for "popular" rows). */
  highlighted?: boolean
  /** Click handler for the brand-tinted Add button. */
  onAdd: () => void
  /** Override the Add button label. Defaults to "Add". */
  addLabel?: string
  /**
   * Click handler for the optional AI-reasoning button (the 18×18 ghost info icon).
   *
   * Brand-rule enforcement: this button is purple-only (AI purple is reserved for AI surfaces).
   * The prop is named `onShowAiReason` to make the contract explicit — callers cannot use it
   * for non-AI info without violating the brand rule.
   */
  onShowAiReason?: () => void
  /** Outer row className override. */
  className?: string
}

/**
 * Receptionist catalog test row. Name + tags + price + brand-tinted Add button + optional
 * AI-reasoning info button.
 *
 * @kuraModules receptionist
 */
function CatalogTestRow({
  name,
  tags,
  price,
  highlighted,
  onAdd,
  addLabel = 'Add',
  onShowAiReason,
  className,
}: CatalogTestRowProps) {
  return (
    <div
      data-slot="catalog-test-row"
      className={cn(
        'grid grid-cols-[minmax(0,1fr)_74px_92px_18px] items-center gap-[9px] border-b border-[var(--border)] py-1.5',
        highlighted && 'bg-[rgba(var(--brand-rgb),0.035)]',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[12.5px] font-medium leading-k-snug text-[var(--ink-900)]">
          {name}
        </span>
        {tags && tags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1">
            {tags.map((tag) => (
              <SpecialtyBadge key={tag.label} tone={tag.tone}>
                {tag.label}
              </SpecialtyBadge>
            ))}
          </div>
        ) : null}
      </div>

      <span className="text-right text-k-sm font-[650] text-[var(--ink-900)] tabular-nums">
        {price}
      </span>

      <Button
        type="button"
        size="xs"
        variant="outline"
        aria-label={`Add ${name}`}
        onClick={onAdd}
        className="h-[26px] w-full gap-1 rounded-md border-[var(--brand-200)] bg-[var(--brand-50)] px-[9px] text-[11.5px] font-bold text-[var(--brand-700)] shadow-none hover:border-[var(--brand-300)] hover:bg-[var(--brand-100)] hover:text-[var(--brand-700)]"
      >
        <Icon name="tabler:plus" size={11} aria-hidden />
        {addLabel}
      </Button>

      {onShowAiReason ? (
        <button
          type="button"
          onClick={onShowAiReason}
          title="Show AI reason"
          aria-label={`Show AI reason for ${name}`}
          className="grid size-[18px] place-items-center rounded-full text-[var(--purple-300)] transition-colors hover:bg-[var(--purple-50)] hover:text-[var(--purple-600)]"
        >
          <Icon name="tabler:info-circle" size={11} aria-hidden />
        </button>
      ) : (
        <span aria-hidden />
      )}
    </div>
  )
}

export { CatalogTestRow, type CatalogTestRowProps, type CatalogTestRowTag }
