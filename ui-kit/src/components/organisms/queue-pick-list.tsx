import { type ReactNode } from 'react'

import { Icon } from '../atoms/icon.tsx'
import { Avatar, AvatarFallback } from '../ui/avatar.tsx'
import { cn } from '../../lib/cn.ts'

type QueuePickListItem = {
  id: string
  initials?: string
  title: ReactNode
  meta: ReactNode
  trailing?: ReactNode
}

type QueuePickListProps = {
  items: QueuePickListItem[]
  onPick?: (item: QueuePickListItem) => void
  className?: string
}

/**
 * Compact selectable queue list used by scanner-first clinical workflows.
 *
 * @kuraModules phlebo
 */
function QueuePickList({ items, onPick, className }: QueuePickListProps) {
  return (
    <div
      data-slot="queue-pick-list"
      className={cn('max-h-80 overflow-y-auto rounded-[var(--radius)] border border-[var(--border)]', className)}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="flex w-full items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-[var(--surface-2)]"
          onClick={() => onPick?.(item)}
        >
          {item.initials ? (
            <Avatar className="size-8">
              <AvatarFallback className="bg-[var(--brand-500)] text-k-xs font-bold text-[var(--ink-0)]">
                {item.initials}
              </AvatarFallback>
            </Avatar>
          ) : null}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-k-body font-bold text-[var(--ink-900)]">
              {item.title}
            </span>
            <span className="block truncate text-k-xs font-medium text-[var(--ink-500)]">
              {item.meta}
            </span>
          </span>
          {item.trailing ?? (
            <Icon name="tabler:chevron-right" size={14} className="text-[var(--ink-400)]" />
          )}
        </button>
      ))}
    </div>
  )
}

export { QueuePickList, type QueuePickListItem, type QueuePickListProps }
