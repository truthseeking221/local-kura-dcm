import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Icon } from '@/components/atoms/icon.tsx'
import { Banner } from '@/components/molecules/banner.tsx'
import { VerifyEmailCard } from '@/components/organisms/verify-email-card.tsx'

const meta: Meta = {
  title: 'Auth/VerifyEmailCard',
  component: VerifyEmailCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

function noop() {}

export const Empty: Story = {
  render: () => {
    const [code, setCode] = useState('')
    return (
      <VerifyEmailCard
        email="chum@kura.med"
        code={code}
        onCodeChange={setCode}
        onVerify={noop}
        isVerifying={false}
        onResend={noop}
      />
    )
  },
}

export const PartiallyTyped: Story = {
  render: () => {
    const [code, setCode] = useState('123')
    return (
      <VerifyEmailCard
        email="chum@kura.med"
        code={code}
        onCodeChange={setCode}
        onVerify={noop}
        isVerifying={false}
        onResend={noop}
      />
    )
  },
}

export const Complete: Story = {
  render: () => {
    const [code, setCode] = useState('123456')
    return (
      <VerifyEmailCard
        email="chum@kura.med"
        code={code}
        onCodeChange={setCode}
        onVerify={() => alert(`verify ${code}`)}
        isVerifying={false}
        onResend={noop}
      />
    )
  },
}

export const Verifying: Story = {
  render: () => {
    const [code, setCode] = useState('123456')
    return (
      <VerifyEmailCard
        email="chum@kura.med"
        code={code}
        onCodeChange={setCode}
        onVerify={noop}
        isVerifying
        onResend={noop}
      />
    )
  },
}

export const InvalidCode: Story = {
  render: () => {
    const [code, setCode] = useState('123456')
    return (
      <VerifyEmailCard
        email="chum@kura.med"
        code={code}
        onCodeChange={setCode}
        onVerify={noop}
        isVerifying={false}
        onResend={noop}
        error={
          <Banner tone="danger" icon={<Icon name="tabler:alert-triangle" />}>
            Invalid or expired code.
          </Banner>
        }
      />
    )
  },
}

export const ResendCooldown: Story = {
  render: () => {
    const [code, setCode] = useState('')
    const target = new Date(Date.now() + 30_000)
    return (
      <VerifyEmailCard
        email="chum@kura.med"
        code={code}
        onCodeChange={setCode}
        onVerify={noop}
        isVerifying={false}
        onResend={noop}
        resendDisabledUntil={target}
      />
    )
  },
}

export const LongEmail: Story = {
  name: 'LongEmail — wrap behaviour audit',
  render: () => {
    const [code, setCode] = useState('')
    return (
      <VerifyEmailCard
        email="a-very-long-email@some-very-long-domain.example.com"
        code={code}
        onCodeChange={setCode}
        onVerify={noop}
        isVerifying={false}
        onResend={noop}
      />
    )
  },
}

export const Playground: Story = {
  argTypes: {
    isVerifying: { control: 'boolean' },
    email: { control: 'text' },
  },
  args: {
    email: 'chum@kura.med',
    isVerifying: false,
  },
  render: (args) => {
    const [code, setCode] = useState('')
    const a = args as { email?: string; isVerifying?: boolean }
    return (
      <VerifyEmailCard
        email={a.email ?? 'chum@kura.med'}
        isVerifying={Boolean(a.isVerifying)}
        code={code}
        onCodeChange={setCode}
        onVerify={noop}
        onResend={noop}
      />
    )
  },
}
