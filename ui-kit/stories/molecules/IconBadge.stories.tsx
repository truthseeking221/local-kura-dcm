import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconBadge } from '@/components/molecules/icon-badge.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
// IconBadge has required `children`, so the meta is typed loosely to let
// `States` / scenario stories use render-only without redeclaring args.
const meta: Meta = {
  title: 'Molecules/IconBadge',
  component: IconBadge,
  tags: ['autodocs'],
  args: { tone: 'info', size: 'md' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger', 'neutral', 'ai', 'brand'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => (
    <IconBadge {...args}>
      <Icon name="tabler:phone" />
    </IconBadge>
  ),
}

export const Playground: Story = {
  render: (args) => (
    <IconBadge {...args}>
      <Icon name="tabler:phone" />
    </IconBadge>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconBadge size="sm" tone="info">
        <Icon name="tabler:phone" />
      </IconBadge>
      <IconBadge size="md" tone="info">
        <Icon name="tabler:phone" />
      </IconBadge>
      <IconBadge size="lg" tone="info">
        <Icon name="tabler:phone" />
      </IconBadge>
    </div>
  ),
}

export const NotificationTypes: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <IconBadge tone="danger">
        <Icon name="tabler:alert-triangle" />
      </IconBadge>
      <IconBadge tone="warning">
        <Icon name="tabler:shield-check" />
      </IconBadge>
      <IconBadge tone="info">
        <Icon name="tabler:phone" />
      </IconBadge>
      <IconBadge tone="success">
        <Icon name="tabler:flask" />
      </IconBadge>
      <IconBadge tone="neutral">
        <Icon name="tabler:calendar" />
      </IconBadge>
      <IconBadge tone="ai">
        <Icon name="tabler:sparkles" />
      </IconBadge>
      <IconBadge tone="brand">
        <Icon name="tabler:bell" />
      </IconBadge>
      <IconBadge tone="brand">
        <Icon name="tabler:credit-card" />
      </IconBadge>
    </div>
  ),
}

export const PatientFormSections: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border p-3">
        <IconBadge tone="brand">
          <Icon name="tabler:home" />
        </IconBadge>
        <div className="text-sm">Address (optional)</div>
      </div>
      <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border p-3">
        <IconBadge tone="brand">
          <Icon name="tabler:credit-card" />
        </IconBadge>
        <div className="text-sm">Refund account (optional)</div>
      </div>
    </div>
  ),
}
