import type { Meta, StoryObj } from '@storybook/react-vite'
import { CountBadge } from '@/components/molecules/count-badge.tsx'
import { NotificationItem, NotificationsPanel } from '@/components/organisms/notifications-panel.tsx'
import { Button } from '@/components/ui/button.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta: Meta = {
  title: 'Organisms/NotificationsPanel',
  component: NotificationsPanel,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

export const ReceptionistInbox: Story = {
  render: () => (
    <NotificationsPanel
      unreadCount={3}
      trigger={
        <div className="relative">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Icon name="tabler:bell" />
          </Button>
          <span className="absolute -right-0.5 -top-0.5">
            <CountBadge count={3} variant="destructive" />
          </span>
        </div>
      }
      onMarkAllRead={() => alert('Marked all read')}
      onViewAll={() => alert('View all')}
    >
      <NotificationItem
        icon={<Icon name="tabler:alert-triangle" />}
        iconTone="danger"
        title="Consent declined"
        description="An Le declined the digital consent. Counter-sign required."
        time="2m ago"
        unread
        action={{ label: 'Review', onClick: () => alert('Review') }}
      />
      <NotificationItem
        icon={<Icon name="tabler:shield-check" />}
        iconTone="warning"
        title="Insurance verification pending"
        description="Bao Nguyen hasn't uploaded an insurance card yet."
        time="8m ago"
        unread
        action={{ label: 'Verify', onClick: () => alert('Verify') }}
      />
      <NotificationItem
        icon={<Icon name="tabler:smartphone" />}
        iconTone="info"
        title="PWA intake complete"
        description="Pierre Tison finished the patient intake on mobile."
        time="12m ago"
        unread
        action={{ label: 'Open', onClick: () => alert('Open') }}
      />
      <NotificationItem
        icon={<Icon name="tabler:flask" />}
        iconTone="success"
        title="Lab results ready"
        description="CBC and lipid panel for Sokha Pich are back."
        time="23m ago"
        action={{ label: 'View', onClick: () => alert('View') }}
      />
      <NotificationItem
        icon={<Icon name="tabler:calendar" />}
        iconTone="neutral"
        title="Upcoming appointments"
        description="5 appointments scheduled in the next hour."
        time="1h ago"
        action={{ label: 'View schedule', onClick: () => alert('Schedule') }}
      />
    </NotificationsPanel>
  ),
}

export const AllCaughtUp: Story = {
  render: () => (
    <NotificationsPanel
      unreadCount={0}
      trigger={
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Icon name="tabler:bell" />
        </Button>
      }
      onViewAll={() => alert('View all')}
    >
      <li className="px-4 py-10 text-center text-sm text-muted-foreground">
        Nothing here. We'll ping you when something needs attention.
      </li>
    </NotificationsPanel>
  ),
}
