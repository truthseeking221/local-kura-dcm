import { Icon } from '../atoms/icon.tsx'
import { Button } from '../ui/button.tsx'
import { cn } from '../../lib/cn.ts'

type CatalogBundleRowProps = {
  /** Bundle name, e.g. "Annual health check-up". */
  name: string
  /** Short description shown under the name. */
  description: string
  /** Pre-formatted tests count label, e.g. "7 tests". */
  testsLabel: string
  /** Pre-formatted total, e.g. "$95.00". */
  total: string
  /** Action button label, e.g. "Add bundle" or "Add 4 more". */
  actionLabel: string
  /** Click handler for the Add button. */
  onAdd: () => void
  /** Outer row className override. */
  className?: string
}

/**
 * Receptionist catalog bundle row. Cube icon + name + description + tests count + total + Add button.
 *
 * Layout locked to the canonical story spec; action button is right-aligned via `col-span-3`.
 * Cube icon is the canonical glyph for bundles in the receptionist catalog.
 *
 * @kuraModules receptionist
 */
function CatalogBundleRow({
  name,
  description,
  testsLabel,
  total,
  actionLabel,
  onAdd,
  className,
}: CatalogBundleRowProps) {
  return (
    <div
      data-slot="catalog-bundle-row"
      className={cn(
        'grid grid-cols-[minmax(0,1fr)_74px_92px] items-center gap-3 border-b border-[var(--border)] py-2.5',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-md bg-[var(--brand-50)] text-[var(--brand-700)]">
          <Icon name="tabler:cube" size={17} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-k-body font-bold leading-k-tight text-[var(--ink-900)]">
            {name}
          </span>
          <span className="block truncate text-[11.5px] text-[var(--ink-500)]">{description}</span>
        </span>
      </div>
      <span className="text-right text-[11.5px] text-[var(--ink-500)]">{testsLabel}</span>
      <span className="text-right text-k-sm font-[650] text-[var(--ink-900)] tabular-nums">
        {total}
      </span>
      <div className="col-span-3 flex justify-end">
        <Button
          type="button"
          size="xs"
          onClick={onAdd}
          aria-label={`${actionLabel}: ${name}`}
          className="h-[26px] gap-1 rounded-md bg-[var(--brand-600)] px-3 text-[11.5px] font-bold text-[var(--ink-0)] hover:bg-[var(--brand-700)]"
        >
          <Icon name="tabler:plus" size={11} aria-hidden />
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}

export { CatalogBundleRow, type CatalogBundleRowProps }
