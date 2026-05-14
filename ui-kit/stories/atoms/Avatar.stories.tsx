import type { Meta, StoryObj } from '@storybook/react-vite'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'

const meta = {
  title: 'Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>LN</AvatarFallback>
    </Avatar>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>LN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-[var(--brand-100)] text-[var(--brand-700)]">SS</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://placehold.co/64x64/268cff/ffffff/png?text=K" alt="" />
        <AvatarFallback>K</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarFallback className="bg-[var(--purple-50)] text-[var(--purple-600)]">AI</AvatarFallback>
      </Avatar>
    </div>
  ),
}
