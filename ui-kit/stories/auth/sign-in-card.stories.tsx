import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Icon } from '@/components/atoms/icon.tsx'
import { Banner } from '@/components/molecules/banner.tsx'
import { SignInCard } from '@/components/organisms/sign-in-card.tsx'

// Render-only stories use a loose `Meta` so per-story `useState` setups don't
// need to declare matching `args` for every required prop.
const meta: Meta = {
  title: 'Auth/SignInCard',
  component: SignInCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

export const EmailOnly: Story = {
  name: 'EmailOnly — day-one default',
  render: () => {
    const [email, setEmail] = useState('')
    return (
      <SignInCard
        email={email}
        onEmailChange={setEmail}
        providers={[]}
        onSubmitEmail={() => alert(`submit ${email}`)}
        isSubmitting={false}
        privacyPolicyHref="https://example.com/privacy"
      />
    )
  },
}

export const Sending: Story = {
  name: 'Sending — mid-submit',
  render: () => {
    const [email, setEmail] = useState('chum@kura.med')
    return (
      <SignInCard
        email={email}
        onEmailChange={setEmail}
        providers={[]}
        onSubmitEmail={() => {}}
        isSubmitting
        privacyPolicyHref="https://example.com/privacy"
      />
    )
  },
}

export const SubmitError: Story = {
  render: () => {
    const [email, setEmail] = useState('chum@kura.med')
    return (
      <SignInCard
        email={email}
        onEmailChange={setEmail}
        providers={[]}
        onSubmitEmail={() => {}}
        isSubmitting={false}
        error={
          <Banner tone="danger" icon={<Icon name="tabler:alert-triangle" />}>
            Couldn't send — try again.
          </Banner>
        }
        privacyPolicyHref="https://example.com/privacy"
      />
    )
  },
}

export const WithOneProvider: Story = {
  render: () => {
    const [email, setEmail] = useState('')
    return (
      <SignInCard
        email={email}
        onEmailChange={setEmail}
        providers={[
          {
            id: 'google',
            label: 'Continue with Google',
            icon: <Icon name="logos:google-icon" strokeWidth={null} />,
            onClick: () => alert('google'),
          },
        ]}
        onSubmitEmail={() => alert(`submit ${email}`)}
        isSubmitting={false}
        privacyPolicyHref="https://example.com/privacy"
      />
    )
  },
}

export const WithTwoProviders: Story = {
  render: () => {
    const [email, setEmail] = useState('')
    return (
      <SignInCard
        email={email}
        onEmailChange={setEmail}
        providers={[
          {
            id: 'google',
            label: 'Continue with Google',
            icon: <Icon name="logos:google-icon" strokeWidth={null} />,
            onClick: () => alert('google'),
          },
          {
            id: 'telegram',
            label: 'Continue with Telegram',
            icon: <Icon name="logos:telegram" strokeWidth={null} />,
            onClick: () => alert('telegram'),
          },
        ]}
        onSubmitEmail={() => alert(`submit ${email}`)}
        isSubmitting={false}
        privacyPolicyHref="https://example.com/privacy"
      />
    )
  },
}

export const Playground: Story = {
  argTypes: {
    isSubmitting: { control: 'boolean' },
  },
  args: {
    isSubmitting: false,
  },
  render: (args) => {
    const [email, setEmail] = useState('chum@kura.med')
    return (
      <SignInCard
        email={email}
        onEmailChange={setEmail}
        providers={[]}
        onSubmitEmail={() => {}}
        isSubmitting={Boolean((args as { isSubmitting?: boolean }).isSubmitting)}
        privacyPolicyHref="https://example.com/privacy"
      />
    )
  },
}
