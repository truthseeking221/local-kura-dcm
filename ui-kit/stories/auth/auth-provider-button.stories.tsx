import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from '@/components/atoms/icon.tsx'
import { AuthProviderButton } from '@/components/molecules/auth-provider-button.tsx'

const meta = {
  title: 'Auth/AuthProviderButton',
  component: AuthProviderButton,
  tags: ['autodocs'],
  args: {
    icon: <Icon name="logos:google-icon" strokeWidth={null} />,
    label: 'Continue with Google',
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AuthProviderButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-[320px]">
      <AuthProviderButton {...args} />
    </div>
  ),
}

export const Playground: Story = {
  render: (args) => (
    <div className="w-[320px]">
      <AuthProviderButton {...args} />
    </div>
  ),
}

export const Google: Story = {
  render: () => (
    <div className="w-[320px]">
      <AuthProviderButton
        icon={<Icon name="logos:google-icon" strokeWidth={null} />}
        label="Continue with Google"
      />
    </div>
  ),
}

export const Telegram: Story = {
  render: () => (
    <div className="w-[320px]">
      <AuthProviderButton
        icon={<Icon name="logos:telegram" strokeWidth={null} />}
        label="Continue with Telegram"
      />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="w-[320px]">
      <AuthProviderButton {...args} />
    </div>
  ),
}

export const Stack: Story = {
  name: 'Stack — Google + Telegram',
  render: () => (
    <div className="flex w-[320px] flex-col gap-2">
      <AuthProviderButton
        icon={<Icon name="logos:google-icon" strokeWidth={null} />}
        label="Continue with Google"
      />
      <AuthProviderButton
        icon={<Icon name="logos:telegram" strokeWidth={null} />}
        label="Continue with Telegram"
      />
    </div>
  ),
}
