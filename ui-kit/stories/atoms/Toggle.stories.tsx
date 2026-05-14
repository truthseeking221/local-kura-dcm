import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toggle } from '@/components/ui/toggle.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta = {
  title: 'Atoms/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  args: {
    children: 'Toggle',
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithIcon: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle aria-label="Bold">
        <Icon name="tabler:bold" />
      </Toggle>
      <Toggle aria-label="Italic" defaultPressed>
        <Icon name="tabler:italic" />
      </Toggle>
      <Toggle aria-label="Underline">
        <Icon name="tabler:underline" />
      </Toggle>
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Toggle variant="default">Default</Toggle>
      <Toggle variant="outline">Outline</Toggle>
    </div>
  ),
}
