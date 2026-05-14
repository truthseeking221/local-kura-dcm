import type { Meta, StoryObj } from '@storybook/react-vite'

import { CheckInboxCard } from '@/components/organisms/check-inbox-card.tsx'

const meta: Meta = {
  title: 'Auth/CheckInboxCard',
  component: CheckInboxCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

function noop() {}

export const Default: Story = {
  render: () => (
    <CheckInboxCard
      email="chum@kura.med"
      onOpenGmail={() => alert('open gmail')}
      onOpenOutlook={() => alert('open outlook')}
      onEnterCode={() => alert('enter code')}
      onResend={() => alert('resend')}
      isResending={false}
    />
  ),
}

export const Resending: Story = {
  render: () => (
    <CheckInboxCard
      email="chum@kura.med"
      onOpenGmail={noop}
      onOpenOutlook={noop}
      onEnterCode={noop}
      onResend={noop}
      isResending
    />
  ),
}

export const ResendCooldown: Story = {
  render: () => {
    const target = new Date(Date.now() + 30_000)
    return (
      <CheckInboxCard
        email="chum@kura.med"
        onOpenGmail={noop}
        onOpenOutlook={noop}
        onEnterCode={noop}
        onResend={noop}
        isResending={false}
        resendDisabledUntil={target}
      />
    )
  },
}

export const LongEmail: Story = {
  name: 'LongEmail — wrap behaviour audit',
  render: () => (
    <CheckInboxCard
      email="a-very-long-email@some-very-long-domain.example.com"
      onOpenGmail={noop}
      onOpenOutlook={noop}
      onEnterCode={noop}
      onResend={noop}
      isResending={false}
    />
  ),
}

export const Playground: Story = {
  argTypes: {
    isResending: { control: 'boolean' },
    email: { control: 'text' },
  },
  args: {
    email: 'chum@kura.med',
    isResending: false,
  },
  render: (args) => {
    const a = args as { email?: string; isResending?: boolean }
    return (
      <CheckInboxCard
        email={a.email ?? 'chum@kura.med'}
        isResending={Boolean(a.isResending)}
        onOpenGmail={noop}
        onOpenOutlook={noop}
        onEnterCode={noop}
        onResend={noop}
      />
    )
  },
}
