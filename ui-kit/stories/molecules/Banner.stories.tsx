import type { Meta, StoryObj } from '@storybook/react-vite'
import { Banner } from '@/components/molecules/banner.tsx'
import { Button } from '@/components/ui/button.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta = {
  title: 'Molecules/Banner',
  component: Banner,
  tags: ['autodocs'],
  args: {
    tone: 'info',
    title: 'Filling on behalf of patient',
    icon: <Icon name="tabler:pencil" />,
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger', 'ai'],
    },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Banner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const FillingOnBehalf: Story = {
  render: () => (
    <Banner
      tone="info"
      icon={<Icon name="tabler:pencil" />}
      title="Filling on behalf of patient"
      action={<Button size="sm">Done</Button>}
    />
  ),
}

export const NoTatBoundTests: Story = {
  render: () => (
    <Banner tone="info" icon={<Icon name="tabler:info" />}>
      No TAT-bound tests in cart — book any slot.
    </Banner>
  ),
}

export const NoPaymentDue: Story = {
  render: () => (
    <Banner
      tone="success"
      icon={<Icon name="tabler:circle-check" />}
      title="No payment due"
    >
      This order has a $0 patient balance. Continue to confirm check-in.
    </Banner>
  ),
}

export const FullNameRequired: Story = {
  render: () => (
    <Banner tone="warning" icon={<Icon name="tabler:alert-triangle" />}>
      Full name required before continuing.
    </Banner>
  ),
}

export const ConsentDeclined: Story = {
  render: () => (
    <Banner
      tone="danger"
      icon={<Icon name="tabler:alert-triangle" />}
      title="Consent declined"
      action={<Button size="sm" variant="outline">Counter-sign</Button>}
    >
      An Le declined the digital consent. A staff counter-signature is required.
    </Banner>
  ),
}

export const AiSuggestion: Story = {
  render: () => (
    <Banner
      tone="ai"
      icon={<Icon name="tabler:sparkles" />}
      title="Suggested follow-up"
    >
      Patient's HbA1c trend suggests scheduling a 3-month diabetes review.
    </Banner>
  ),
}
