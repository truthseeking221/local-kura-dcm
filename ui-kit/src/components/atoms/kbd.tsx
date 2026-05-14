import { type ComponentProps } from 'react'

import { cn } from '../../lib/cn.ts'

/**
 * Kbd — keyboard-key chip used for `⌘K`, `F1–F6`, `Ctrl+N`, `Space`, `Enter`,
 * `Esc`, `/`, `↑`, `↓`. Pure visual; the screen-reader announces the textual
 * content. Pair it with a sibling label inside `KeyboardHint` (a molecule) to
 * communicate what the shortcut does.
 *
 * Sizing follows `--type-2xs` so a Kbd sits comfortably next to caption-sized
 * helper text, and uses `--font-family-mono` so single-character keys have a
 * stable monospace box.
 */
function Kbd({ className, children, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'inline-flex h-5 min-w-5 select-none items-center justify-center rounded-[var(--radius-sm)] border border-border bg-card px-1 font-mono text-k-xs font-medium text-muted-foreground shadow-[var(--shadow-xs)]',
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  )
}

export { Kbd }
