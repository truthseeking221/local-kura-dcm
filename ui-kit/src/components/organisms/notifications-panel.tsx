import { type ComponentProps, type ReactNode } from 'react'

import { IconBadge, type IconBadgeTone } from '../molecules/icon-badge.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.tsx'
import { ScrollArea } from '../ui/scroll-area.tsx'
import { cn } from '../../lib/cn.ts'

import { Icon } from '../atoms/icon.tsx'
type NotificationsPanelProps = {
  /** Trigger element — typically the bell button. */
  trigger: ReactNode
  /** Number of unread notifications, shown next to the title. */
  unreadCount?: number
  /** Notification rows, composed with `<NotificationItem>`. */
  children: ReactNode
  /** Fires when the user clicks the "Mark all as read" link. Hidden when omitted. */
  onMarkAllRead?: () => void
  /** Fires when the user clicks the footer "View all" link. Hidden when omitted. */
  onViewAll?: () => void
  /** Override the title text. */
  title?: ReactNode
  /** Popover alignment. Defaults to `end`. */
  align?: 'start' | 'center' | 'end'
  /** Width in pixels. Defaults to 360. */
  width?: number
}

/**
 * NotificationsPanel — popover with a header (title + unread count + "Mark
 * all as read" link), a scrollable list of `NotificationItem`s, and a
 * footer "View all notifications" link.
 *
 * The kit owns the chrome (header / list / footer) but not the items —
 * consumers compose `<NotificationItem>` children to match their domain.
 */
function NotificationsPanel({
  trigger,
  unreadCount,
  children,
  onMarkAllRead,
  onViewAll,
  title = 'Notifications',
  align = 'end',
  width = 360,
}: NotificationsPanelProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align={align} className="p-0" style={{ width }}>
        <div className="flex items-start justify-between border-b border-border px-4 py-3">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">{title}</span>
            {typeof unreadCount === 'number' ? (
              <span className="text-xs text-muted-foreground">
                {unreadCount === 0 ? 'All caught up' : `${unreadCount} unread`}
              </span>
            ) : null}
          </div>
          {onMarkAllRead ? (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs font-medium text-[var(--brand-700)] hover:underline"
            >
              Mark all as read
            </button>
          ) : null}
        </div>
        <ScrollArea className="max-h-[420px]">
          <ul className="divide-y divide-border">{children}</ul>
        </ScrollArea>
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="flex w-full items-center justify-center border-t border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            View all notifications
          </button>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

type NotificationItemProps = Omit<ComponentProps<'li'>, 'children' | 'title' | 'onClick'> & {
  /** Icon rendered inside an `IconBadge`. */
  icon: ReactNode
  /** Tone for the icon's IconBadge. */
  iconTone?: IconBadgeTone
  /** Bold title row. */
  title: ReactNode
  /** Optional supporting line. */
  description?: ReactNode
  /** Optional bottom-left meta — typically a relative timestamp. */
  time?: ReactNode
  /** Optional action label (string) + handler — renders as a link in the bottom-right. */
  action?: { label: ReactNode; onClick: () => void }
  /** When true, shows the unread blue dot on the right edge. */
  unread?: boolean
}

/** A single notification row inside `<NotificationsPanel>`. */
function NotificationItem({
  icon,
  iconTone = 'neutral',
  title,
  description,
  time,
  action,
  unread,
  className,
  ...props
}: NotificationItemProps) {
  return (
    <li
      data-slot="notification-item"
      data-unread={unread || undefined}
      className={cn('flex items-start gap-3 px-4 py-3', className)}
      {...props}
    >
      <IconBadge tone={iconTone} size="sm">
        {icon}
      </IconBadge>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold leading-snug">{title}</span>
          {unread ? (
            <span aria-hidden className="mt-1 inline-block size-2 shrink-0 rounded-full bg-[var(--brand-500)]" />
          ) : null}
        </div>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
        {time || action ? (
          <div className="mt-1 flex items-center justify-between gap-2">
            {time ? <span className="text-k-xs text-muted-foreground">{time}</span> : <span />}
            {action ? (
              <button
                type="button"
                onClick={action.onClick}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand-700)] hover:underline"
              >
                {action.label}
                <Icon name="tabler:chevron-right" size={12} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  )
}

export { NotificationsPanel, NotificationItem }
