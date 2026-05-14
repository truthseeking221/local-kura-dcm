import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '@/components/ui/badge.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: 'Verified',
    variant: 'success',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'destructive',
        'outline',
        'ghost',
        'link',
        'success',
        'warning',
        'danger',
        'info',
        'neutral',
        'ai',
      ],
    },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {}

export const StockShadcn: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
}

export const KuraTones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="success">
        <Icon name="tabler:check" />
        Eligible
      </Badge>
      <Badge variant="warning">
        <Icon name="tabler:triangle" />
        Verify patient
      </Badge>
      <Badge variant="danger">Consent declined</Badge>
      <Badge variant="info">Manual entry</Badge>
      <Badge variant="neutral">Pending</Badge>
      <Badge variant="ai">
        <Icon name="tabler:sparkles" />
        AI suggestion
      </Badge>
    </div>
  ),
}

export const FromTheReceptionistFlow: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success">
          <Icon name="tabler:check" />
          Verified
        </Badge>
        <Badge variant="warning">
          <Icon name="tabler:triangle" />
          Verify patient
        </Badge>
        <Badge variant="info">Manual entry</Badge>
        <Badge variant="success">
          <Icon name="tabler:check" />
          Eligible
        </Badge>
        <Badge variant="success">Ready to check in</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider">
        <Badge variant="neutral" className="text-[10px]">
          Pending
        </Badge>
        <Badge variant="neutral" className="text-[10px]">
          Coming soon
        </Badge>
        <Badge variant="success" className="text-[10px]">
          Done
        </Badge>
      </div>
    </div>
  ),
}
