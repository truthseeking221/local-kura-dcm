import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Icon } from '@/components/atoms/icon.tsx'
import { AuthShell } from '@/components/organisms/auth-shell.tsx'
import { CheckInboxCard } from '@/components/organisms/check-inbox-card.tsx'
import { SignInCard } from '@/components/organisms/sign-in-card.tsx'
import { VerifyEmailCard } from '@/components/organisms/verify-email-card.tsx'

import { KuraAuthLogo } from './_components/kura-auth-logo.tsx'

const meta = {
  title: 'Auth/Flow',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function noop() {}

export const SignIn: Story = {
  name: '01 — Sign in',
  render: () => {
    const [email, setEmail] = useState('')
    return (
      <AuthShell logo={<KuraAuthLogo />}>
        <SignInCard
          email={email}
          onEmailChange={setEmail}
          providers={[
            {
              id: 'google',
              label: 'Continue with Google',
              icon: <Icon name="logos:google-icon" strokeWidth={null} />,
              onClick: noop,
            },
            {
              id: 'telegram',
              label: 'Continue with Telegram',
              icon: <Icon name="logos:telegram" strokeWidth={null} />,
              onClick: noop,
            },
          ]}
          onSubmitEmail={noop}
          isSubmitting={false}
          privacyPolicyHref="https://example.com/privacy"
        />
      </AuthShell>
    )
  },
}

export const Sending: Story = {
  name: '02 — Sending (mid-submit)',
  render: () => {
    const [email, setEmail] = useState('chum@kura.med')
    return (
      <AuthShell logo={<KuraAuthLogo />}>
        <SignInCard
          email={email}
          onEmailChange={setEmail}
          providers={[]}
          onSubmitEmail={noop}
          isSubmitting
          privacyPolicyHref="https://example.com/privacy"
        />
      </AuthShell>
    )
  },
}

export const CheckInbox: Story = {
  name: '03 — Check inbox',
  render: () => (
    <AuthShell logo={<KuraAuthLogo />}>
      <CheckInboxCard
        email="chum@kura.med"
        onOpenGmail={noop}
        onOpenOutlook={noop}
        onEnterCode={noop}
        onResend={noop}
        isResending={false}
      />
    </AuthShell>
  ),
}

export const Verify: Story = {
  name: '04 — Verify email',
  render: () => {
    const [code, setCode] = useState('')
    return (
      <AuthShell logo={<KuraAuthLogo />}>
        <VerifyEmailCard
          email="chum@kura.med"
          code={code}
          onCodeChange={setCode}
          onVerify={noop}
          isVerifying={false}
          onResend={noop}
        />
      </AuthShell>
    )
  },
}
