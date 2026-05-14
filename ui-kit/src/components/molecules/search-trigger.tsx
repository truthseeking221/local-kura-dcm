import { type ComponentProps, type ReactNode, forwardRef } from 'react'

import { cn } from '../../lib/cn.ts'

import { Icon } from '../atoms/icon.tsx'

type SearchTriggerProps = Omit<ComponentProps<'button'>, 'children'> & {
  /** Placeholder-style text rendered inside the trigger (muted-foreground). Also serves as the accessible button label. */
  placeholder: string
  /** Optional shortcut node rendered on the right — typically a `<Kbd>⌘K</Kbd>`. Decorative; `aria-hidden`. */
  shortcut?: ReactNode
}

/**
 * SearchTrigger — `<button>` styled to visually mirror `<SearchInput density="default">`.
 * Used as the global header search affordance: clicking (or pressing the bound shortcut)
 * opens a `<CommandPalette>`. The trigger does NOT own a searchbox — the dialog it opens
 * does. Semantically a plain button; pass `aria-keyshortcuts="Meta+K"` (or equivalent)
 * when the consumer also wires a keyboard handler on the document.
 *
 * Visual contract: matches SearchInput's default-density chrome node-for-node so the two
 * can be swapped in the same header surface without visual jump. The trailing `shortcut`
 * slot is decorative — typically `<Kbd>⌘K</Kbd>` — and `aria-hidden`; the shortcut is
 * announced via `aria-keyshortcuts` on the button, not by reading the Kbd glyph.
 *
 * @kuraModules receptionist, phlebo
 */
const SearchTrigger = forwardRef<HTMLButtonElement, SearchTriggerProps>(
  function SearchTrigger({ className, placeholder, shortcut, type, ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        data-slot="search-trigger"
        className={cn(
          'relative flex h-9 w-full cursor-pointer items-center rounded-[var(--radius)] border border-border bg-card px-3 text-sm text-muted-foreground transition-colors',
          'pl-9',
          shortcut ? 'pr-12' : 'pr-3',
          'hover:bg-accent',
          'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <Icon
          name="tabler:search"
          size={16}
          strokeWidth={1.5}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <span className="flex-1 truncate text-left">{placeholder}</span>
        {shortcut ? (
          <span
            aria-hidden
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center"
          >
            {shortcut}
          </span>
        ) : null}
      </button>
    )
  },
)

export { SearchTrigger, type SearchTriggerProps }
