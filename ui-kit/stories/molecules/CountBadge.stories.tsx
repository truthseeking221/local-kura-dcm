import type { Meta, StoryObj } from '@storybook/react-vite'
import { CountBadge } from '@/components/molecules/count-badge.tsx'
import { Button } from '@/components/ui/button.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta = {
  title: 'Molecules/CountBadge',
  component: CountBadge,
  tags: ['autodocs'],
  args: { count: 12, variant: 'default' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'accent', 'destructive'] },
    count: { control: { type: 'number', min: 0, max: 999, step: 1 } },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CountBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <CountBadge count={7} />
      <CountBadge count={37} />
      <CountBadge count={1} variant="accent" />
      <CountBadge count={3} variant="destructive" />
    </div>
  ),
}

export const InCategoryNav: Story = {
  render: () => (
    <ul className="w-56 space-y-0.5 rounded-[var(--radius-lg)] border border-border bg-card p-1.5">
      {[
        ['Bundles', 12, 1],
        ['General Health', 7, 0],
        ['STDs', 37, 0],
        ['Cancer', 40, 0],
        ['HPV', 4, 0],
        ['Cardiology', 21, 0],
      ].map(([label, total, accent]) => (
        <li key={String(label)} className="flex items-center justify-between rounded-[var(--radius-sm)] px-2 py-1.5 text-sm">
          <span>{label}</span>
          <span className="flex items-center gap-1.5">
            <CountBadge count={total as number} />
            {(accent as number) > 0 ? <CountBadge count={accent as number} variant="accent" /> : null}
          </span>
        </li>
      ))}
    </ul>
  ),
}

export const NotificationDot: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Icon name="tabler:bell" />
        </Button>
        <span className="absolute -right-0.5 -top-0.5">
          <CountBadge count={3} variant="destructive" />
        </span>
      </div>
      <div className="relative">
        <Button variant="ghost" size="icon" aria-label="Cart">
          <Icon name="tabler:shopping-cart" />
        </Button>
        <span className="absolute -right-0.5 -top-0.5">
          <CountBadge count={2} variant="accent" />
        </span>
      </div>
    </div>
  ),
}
