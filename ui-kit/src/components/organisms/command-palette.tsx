import { type ReactNode } from 'react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
} from '../ui/command.tsx'

type CommandPaletteProps = {
  /** Controlled open state. */
  open: boolean
  /** Fires when the dialog requests close (Esc, outside click, or `setOpen(false)`). */
  onOpenChange: (open: boolean) => void
  /** Search input placeholder. */
  placeholder?: string
  /** Optional row of filter chips rendered below the input. Use a Toggle/ToggleGroup or custom chips. */
  filters?: ReactNode
  /** Empty-state copy when the search yields no results. */
  emptyText?: ReactNode
  /** Hidden a11y title for the dialog. Defaults to "Command palette". */
  title?: string
  /** Hidden a11y description. */
  description?: string
  /** Sections inside the list (use `<CommandGroup>` or `<CommandSection>`). */
  children?: ReactNode
}

/**
 * CommandPalette — `⌘K`-style search overlay. Wraps shadcn's `CommandDialog`
 * with a Kura filter-chip row above the result list and an opinionated
 * empty-state.
 *
 * Compose sections with `<CommandSection>` (eyebrow + items) or pass raw
 * `<CommandGroup>` children. Leaves all routing / data-fetching to the
 * consumer.
 */
function CommandPalette({
  open,
  onOpenChange,
  placeholder = 'Type a command or search…',
  filters,
  emptyText = 'No matches.',
  title = 'Command palette',
  description = 'Search and run commands',
  children,
}: CommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <CommandInput placeholder={placeholder} />
      {filters ? (
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">{filters}</div>
      ) : null}
      <CommandList>
        <CommandEmpty>{emptyText}</CommandEmpty>
        {children}
      </CommandList>
    </CommandDialog>
  )
}

type CommandSectionProps = {
  /** Eyebrow label (uppercase) shown above the items, e.g. `RECENT SEARCHES`. */
  heading: ReactNode
  /** Group children — typically `<CommandItem>`s. */
  children: ReactNode
  /** When true, renders a separator before this group. */
  separated?: boolean
}

/** Convenience wrapper around shadcn `<CommandGroup>` that prepends a separator. */
function CommandSection({ heading, children, separated }: CommandSectionProps) {
  return (
    <>
      {separated ? <CommandSeparator /> : null}
      <CommandGroup heading={heading}>{children}</CommandGroup>
    </>
  )
}

export { CommandPalette, CommandSection }
