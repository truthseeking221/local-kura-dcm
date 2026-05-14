import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type EmptyStateProps = Omit<ComponentProps<'div'>, 'children' | 'title'> & {
  /** Optional illustration / icon slot. Centered above the heading. */
  icon?: ReactNode
  /** Bold heading. */
  title: ReactNode
  /** Optional supporting copy. */
  description?: ReactNode
  /** Optional row of actions. */
  actions?: ReactNode
}

/**
 * EmptyState — the centred zero-state pattern: optional illustration,
 * bold heading, supporting copy, action row.
 *
 * Backs "No insurance on file" + "No recent searches yet" + future zero
 * states across the apps.
 */
function EmptyState({ icon, title, description, actions, className, ...props }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn('flex flex-col items-center gap-2 px-6 py-10 text-center', className)}
      {...props}
    >
      {icon ? (
        <div aria-hidden className="text-muted-foreground [&>svg]:size-10">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {actions ? <div className="mt-3 flex flex-wrap items-center justify-center gap-2">{actions}</div> : null}
    </div>
  )
}

export { EmptyState }
