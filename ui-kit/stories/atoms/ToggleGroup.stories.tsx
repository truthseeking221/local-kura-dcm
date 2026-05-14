import type { Meta, StoryObj } from '@storybook/react-vite'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
// ToggleGroup is a polymorphic union (`type: 'single' | 'multiple'`) and the
// stories below use both shapes, so we keep the meta untyped to avoid forcing
// every story to declare the discriminator.
const meta: Meta = {
  title: 'Atoms/ToggleGroup',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

export const SingleSelect: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="usd" variant="outline" size="sm">
      <ToggleGroupItem value="usd">USD</ToggleGroupItem>
      <ToggleGroupItem value="khr">KHR</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const MultiSelect: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={['any']} variant="outline" size="sm">
      <ToggleGroupItem value="any">Any</ToggleGroupItem>
      <ToggleGroupItem value="free">Free</ToggleGroupItem>
      <ToggleGroupItem value="lt25">≤ $25</ToggleGroupItem>
      <ToggleGroupItem value="25to50">$25–$50</ToggleGroupItem>
      <ToggleGroupItem value="gt50">$50+</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const ContactChannelSegmented: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="sms" variant="outline" className="w-full max-w-md">
      <ToggleGroupItem value="telegram" className="flex-1">
        <Icon name="tabler:send" />
        Telegram
      </ToggleGroupItem>
      <ToggleGroupItem value="sms" className="flex-1">
        <Icon name="tabler:message-square" />
        SMS
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}
