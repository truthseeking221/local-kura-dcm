import * as Collapsible from '@radix-ui/react-collapsible'
import { type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'
import { CountBadge } from './count-badge.tsx'

import { Icon } from '../atoms/icon.tsx'
type CollapsibleSectionProps = {
  /** Section heading text. */
  title: string
  /** When set, renders `<CountBadge>` after the title. */
  count?: number
  /** Right-aligned trailing slot (e.g. a money total). */
  meta?: ReactNode
  /** Uncontrolled mode initial open state. */
  defaultOpen?: boolean
  /** Controlled mode current open state. */
  open?: boolean
  /** Controlled mode change handler. */
  onOpenChange?: (open: boolean) => void
  /** Section body. */
  children: ReactNode
  /** Outer `<Collapsible.Root>` className override. */
  className?: string
}

/**
 * Disclosure section: header (chevron + title + optional CountBadge +
 * optional trailing meta) over a collapsible body. Built on
 * @radix-ui/react-collapsible — exposes `data-state="open"|"closed"` for
 * animation hooks and `aria-expanded` / `aria-controls` for free.
 */
function CollapsibleSection({
  title,
  count,
  meta,
  defaultOpen = true,
  open,
  onOpenChange,
  children,
  className,
}: CollapsibleSectionProps) {
  return (
    <Collapsible.Root
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn('border-b border-border last:border-b-0', className)}
    >
      <Collapsible.Trigger
        className={cn(
          'group flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold',
          'hover:bg-accent',
          'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        )}
      >
        <Icon name="tabler:chevron-down"
          size={14}
          className="text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
        <span className="flex-1 text-left">{title}</span>
        {typeof count === 'number' ? <CountBadge count={count} /> : null}
        {meta ? <span className="ml-2 text-xs">{meta}</span> : null}
      </Collapsible.Trigger>
      <Collapsible.Content className="pb-2">{children}</Collapsible.Content>
    </Collapsible.Root>
  )
}

export { CollapsibleSection }
