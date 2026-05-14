import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState } from '@/components/molecules/empty-state.tsx'
import { Button } from '@/components/ui/button.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta: Meta = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

export const NoInsurance: Story = {
  render: () => (
    <div className="w-[560px] rounded-[var(--radius-lg)] border border-border bg-card">
      <EmptyState
        icon={<Icon name="tabler:shield-check" />}
        title="No insurance on file"
        description="Add a policy now to bill insurance, or continue as direct pay."
        actions={
          <>
            <Button variant="outline">
              <Icon name="tabler:plus" />
              Add policy
            </Button>
            <Button variant="outline">
              <Icon name="tabler:camera" />
              Scan card
            </Button>
            <Button>Continue without insurance</Button>
          </>
        }
      />
    </div>
  ),
}

export const NoRecentSearches: Story = {
  render: () => (
    <div className="w-96 rounded-[var(--radius-lg)] border border-border bg-card">
      <EmptyState
        icon={<Icon name="tabler:clock" />}
        title="No recent searches yet"
        description="Search by name, phone, VID, or booking code to find a patient."
      />
    </div>
  ),
}
