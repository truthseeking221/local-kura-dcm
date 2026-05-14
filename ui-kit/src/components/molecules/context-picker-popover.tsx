import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react'

import { cn } from '../../lib/cn.ts'
import { Button } from '../ui/button.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.tsx'

import { Icon } from '../atoms/icon.tsx'
type ContextPickerItem = {
  id: string
  primary: string
  subtitle?: string
}

type ContextPickerPopoverProps = {
  /** Popover header label (e.g. "Station", "Shift"). Used as the listbox `aria-labelledby`. */
  label: string
  /** Trigger button content. Caller controls formatting. */
  triggerLabel: ReactNode
  /** Currently selected item id. */
  value: string
  /** Called with the new id on select. */
  onValueChange: (next: string) => void
  /** The list of options. */
  items: ContextPickerItem[]
  /** Forwarded to `<PopoverContent align>`. */
  align?: 'start' | 'center' | 'end'
  /** Trigger button className override. */
  className?: string
}

/**
 * Listbox-pattern picker. Trigger button + popover with a labelled header
 * and a vertical list of `{ id, primary, subtitle? }` rows with an active
 * checkmark.
 *
 * A11y: trigger has `aria-haspopup="listbox"` + `aria-expanded`; content
 * has `role="listbox"` + `aria-labelledby`; each item is a button with
 * `role="option"` + `aria-selected`. Keyboard: ↑/↓ moves focus among
 * items, Home/End jump to first/last, Enter selects, Esc closes (Esc
 * handled by Radix Popover).
 *
 * @kuraModules receptionist, phlebo
 */
function ContextPickerPopover({
  label,
  triggerLabel,
  value,
  onValueChange,
  items,
  align = 'start',
  className,
}: ContextPickerPopoverProps) {
  const [open, setOpen] = useState(false)
  const labelId = useId()
  const listRef = useRef<HTMLDivElement>(null)

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [],
    )
    if (buttons.length === 0) {
      return
    }
    const currentIndex = buttons.findIndex((b) => b === document.activeElement)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % buttons.length
      buttons[nextIndex]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex = currentIndex < 0
        ? buttons.length - 1
        : (currentIndex - 1 + buttons.length) % buttons.length
      buttons[nextIndex]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      buttons[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      buttons[buttons.length - 1]?.focus()
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-1.5', className)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {triggerLabel}
          <Icon name="tabler:chevron-down" size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-72 p-0">
        <div
          id={labelId}
          className="border-b border-border px-3 py-2 text-k-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </div>
        <div
          ref={listRef}
          role="listbox"
          aria-labelledby={labelId}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="max-h-72 overflow-y-auto p-1.5"
        >
          {items.map((item) => {
            const active = item.id === value
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onValueChange(item.id)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-start justify-between gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left',
                  'hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
                  active && 'bg-accent',
                )}
              >
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-medium">{item.primary}</span>
                  {item.subtitle ? (
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  ) : null}
                </span>
                {active ? (
                  <Icon name="tabler:check" size={14} className="mt-0.5 text-[var(--brand-700)]" aria-hidden />
                ) : null}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { ContextPickerPopover, type ContextPickerItem }
