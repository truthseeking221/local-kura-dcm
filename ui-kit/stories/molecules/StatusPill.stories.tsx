import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusPill } from '@/components/molecules/status-pill.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta = {
  title: 'Molecules/StatusPill',
  component: StatusPill,
  tags: ['autodocs'],
  args: { tone: 'warning', children: 'Verify patient' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger', 'neutral', 'ai'],
    },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof StatusPill>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {}

export const WizardProgression: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <StatusPill tone="warning" icon={<Icon name="tabler:user-check" />}>
        Capture identity
      </StatusPill>
      <StatusPill tone="warning" icon={<Icon name="tabler:scan" />}>
        Verify patient
      </StatusPill>
      <StatusPill tone="warning" icon={<Icon name="tabler:shield-check" />}>
        Choose insurance
      </StatusPill>
      <StatusPill tone="warning" icon={<Icon name="tabler:video" />}>
        Book teleconsult
      </StatusPill>
      <StatusPill tone="success" icon={<Icon name="tabler:check" />}>
        Ready to check in
      </StatusPill>
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusPill tone="info" icon={<Icon name="tabler:calendar" />}>
        Manual entry
      </StatusPill>
      <StatusPill tone="success" icon={<Icon name="tabler:check" />}>
        Verified
      </StatusPill>
      <StatusPill tone="warning">Verify patient</StatusPill>
      <StatusPill tone="danger">Consent declined</StatusPill>
      <StatusPill tone="neutral">Pending</StatusPill>
      <StatusPill tone="ai" icon={<Icon name="tabler:sparkles" />}>
        AI suggestion
      </StatusPill>
    </div>
  ),
}
