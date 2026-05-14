import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from '@/components/atoms/icon.tsx'
import { MailProviderTile } from '@/components/molecules/mail-provider-tile.tsx'

const outlookLogoUrl = new URL('../../src/assets/outlook.svg', import.meta.url).href

const meta = {
  title: 'Auth/MailProviderTile',
  component: MailProviderTile,
  tags: ['autodocs'],
  args: {
    icon: <Icon name="logos:google-gmail" strokeWidth={null} />,
    label: 'Open Gmail',
    href: 'https://mail.google.com',
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MailProviderTile>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-[180px]">
      <MailProviderTile {...args} />
    </div>
  ),
}

export const Playground: Story = {
  render: (args) => (
    <div className="w-[180px]">
      <MailProviderTile {...args} />
    </div>
  ),
}

export const Pair: Story = {
  name: 'Pair — Gmail + Outlook',
  render: () => (
    <div className="grid w-[400px] grid-cols-2 gap-2">
      <MailProviderTile
        icon={<Icon name="logos:google-gmail" strokeWidth={null} />}
        label="Open Gmail"
        href="https://mail.google.com"
      />
      <MailProviderTile
        icon={<img src={outlookLogoUrl} alt="" />}
        label="Open Outlook"
        href="https://outlook.live.com"
      />
    </div>
  ),
}
