import type { Meta, StoryObj } from '@storybook/react-vite'

import { WorkflowHeading } from '@/components/molecules/workflow-heading.tsx'

const meta = {
  title: 'Molecules/WorkflowHeading',
  component: WorkflowHeading,
  tags: ['autodocs'],
  args: {
    eyebrow: 'Pre-consultation',
    title: 'Visit details',
    subtitle: 'Fill while patient is still in the queue.',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WorkflowHeading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoSubtitle: Story = {
  args: {
    eyebrow: 'Post-consultation',
    title: 'Teleconsultation',
    subtitle: undefined,
  },
}

export const Stack: Story = {
  name: 'Pre + Post phases',
  render: () => (
    <div className="space-y-6 w-[680px]">
      <WorkflowHeading
        eyebrow="Pre-consultation"
        title="Visit details"
        subtitle="Fill while patient is still in the queue."
      />
      <div className="border-t border-[var(--border)] pt-4">
        <WorkflowHeading
          eyebrow="Post-consultation"
          title="Teleconsultation"
          subtitle="Book a call to review test results."
        />
      </div>
    </div>
  ),
}
