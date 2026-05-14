import type { Meta, StoryObj } from '@storybook/react-vite'

import { SampleStatusBadge } from '@/components/molecules/sample-status-badge.tsx'

const meta = {
  title: 'Molecules/SampleStatusBadge',
  component: SampleStatusBadge,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
  args: { status: 'generated' },
} satisfies Meta<typeof SampleStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    status: 'collected',
    collectedAt: '08:24',
  },
}

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <SampleStatusBadge status="generated" />
      <SampleStatusBadge status="generated" generatedLabel="Pending" />
      <SampleStatusBadge status="collected" collectedAt="08:24" />
      <SampleStatusBadge status="deferred" />
    </div>
  ),
}

export const TableScenario: Story = States
