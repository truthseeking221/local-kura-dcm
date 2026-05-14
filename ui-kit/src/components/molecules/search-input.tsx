import { type ComponentProps, type ReactNode } from 'react'

import { Input } from '../ui/input.tsx'
import { cn } from '../../lib/cn.ts'

import { Icon } from '../atoms/icon.tsx'

type SearchInputDensity = 'default' | 'compact'

type SearchInputProps = Omit<ComponentProps<typeof Input>, 'type'> & {
  /** Trailing content rendered to the right of the input — typically a `Kbd` for the shortcut. */
  trailing?: ReactNode
  /** When provided, a clear-X button appears whenever the input has a non-empty value. */
  onClear?: () => void
  /** Classes applied to the inner `<Input>`, separate from wrapper classes. */
  inputClassName?: string
  /** Classes applied to the leading search icon. */
  iconClassName?: string
  /** Search icon size. Defaults to the standard 16px field icon (12 when density='compact'). */
  iconSize?: 12 | 14 | 16 | 20 | 24 | 28
  /** Classes applied to the trailing slot wrapper. */
  trailingClassName?: string
  /**
   * Density preset. `'default'` keeps the full `h-9` input with the canonical
   * focus ring. `'compact'` renders an `h-7`, `--radius-sm`, `--surface-2`-bg
   * input with smaller text and the `--shadow-focus-compact` focus ring — for
   * dense surfaces (catalog rails, order-cart search). Defaults to `'default'`.
   */
  density?: SearchInputDensity
}

const DENSITY_INPUT_CLASSES: Record<SearchInputDensity, string> = {
  default: 'pl-9',
  compact:
    'h-7 rounded-[var(--radius-sm)] border-[var(--border)] bg-[var(--surface-2)] pl-7 text-k-xs text-[var(--ink-800)] shadow-none placeholder:text-[var(--ink-400)] focus-visible:border-[var(--brand-300)] focus-visible:bg-[var(--surface)] focus-visible:shadow-[var(--shadow-focus-compact)]',
}

const DENSITY_ICON_OFFSET: Record<SearchInputDensity, string> = {
  default: 'left-3',
  compact: 'left-2',
}

const DENSITY_TRAILING_OFFSET: Record<SearchInputDensity, string> = {
  default: 'right-2',
  compact: 'right-1.5',
}

/**
 * SearchInput — Input with a leading search icon, optional trailing slot
 * (e.g. a `Kbd` for `⌘K`), and an optional clear button.
 *
 * Backs both the global header search (`density='default'`) and the
 * catalog/order-cart search (`density='compact'`).
 */
function SearchInput({
  className,
  trailing,
  onClear,
  value,
  inputClassName,
  iconClassName,
  iconSize,
  trailingClassName,
  density = 'default',
  ...props
}: SearchInputProps) {
  const hasValue = value !== undefined && value !== null && String(value).length > 0
  const resolvedIconSize: 12 | 14 | 16 | 20 | 24 | 28 =
    iconSize ?? (density === 'compact' ? 12 : 16)
  return (
    <div data-slot="search-input" className={cn('relative w-full', className)}>
      <Icon
        name="tabler:search"
        size={resolvedIconSize}
        strokeWidth={1.5}
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground',
          DENSITY_ICON_OFFSET[density],
          iconClassName,
        )}
      />
      <Input
        type="search"
        value={value}
        className={cn(
          DENSITY_INPUT_CLASSES[density],
          (trailing || onClear) && (density === 'compact' ? 'pr-16' : 'pr-20'),
          !trailing && onClear && (density === 'compact' ? 'pr-7' : 'pr-9'),
          inputClassName,
        )}
        {...props}
      />
      <div
        className={cn(
          'pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center gap-1.5',
          DENSITY_TRAILING_OFFSET[density],
          trailingClassName,
        )}
      >
        {hasValue && onClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="pointer-events-auto inline-flex size-5 items-center justify-center rounded-[var(--radius-sm)] text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Icon name="tabler:x" size={14} />
          </button>
        ) : null}
        {trailing ? <span className="pointer-events-auto">{trailing}</span> : null}
      </div>
    </div>
  )
}

export { SearchInput, type SearchInputDensity, type SearchInputProps }
