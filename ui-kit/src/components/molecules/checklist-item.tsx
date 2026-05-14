import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

import { Icon } from '../atoms/icon.tsx'
type ChecklistItemStatus = 'pending' | 'done' | 'skipped'

const INDICATOR_CLASSES: Record<ChecklistItemStatus, string> = {
  pending: 'border-border bg-card text-transparent',
  done: 'border-transparent bg-[var(--status-success-fg)] text-white',
  skipped: 'border-border bg-card text-muted-foreground',
}

type ChecklistItemProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** Status — drives the leading indicator. Defaults to `pending`. */
  status?: ChecklistItemStatus
  /** The item title. */
  title: ReactNode
  /** Optional trailing meta (status pill, count, etc.). */
  meta?: ReactNode
}

/**
 * ChecklistItem — leading status indicator + title + trailing meta. Backs the
 * 8-row Visit-details checklist (Today's visit, Pre-test prep, Medications &
 * supplements, Women's health, Recent health events, Lifestyle snapshot,
 * Sample comfort, Consent & sensitive tests).
 *
 * - `pending` → empty circle
 * - `done` → filled green check
 * - `skipped` → empty circle with a dash, muted text
 */
function ChecklistItem({
  status = 'pending',
  title,
  meta,
  className,
  ...props
}: ChecklistItemProps) {
  return (
    <div
      data-slot="checklist-item"
      data-status={status}
      className={cn(
        'flex items-center gap-3 rounded-[var(--radius)] px-3 py-2.5',
        status === 'skipped' && 'opacity-70',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'inline-flex size-5 shrink-0 items-center justify-center rounded-full border [&>svg]:size-3.5',
          INDICATOR_CLASSES[status],
        )}
      >
        {status === 'done' ? <Icon name="tabler:check" /> : null}
        {status === 'skipped' ? <Icon name="tabler:minus" /> : null}
      </span>
      <span className={cn('flex-1 text-sm', status === 'skipped' && 'line-through')}>
        {title}
      </span>
      {meta ? <span className="shrink-0 text-xs text-muted-foreground">{meta}</span> : null}
    </div>
  )
}

export { ChecklistItem, type ChecklistItemStatus }
