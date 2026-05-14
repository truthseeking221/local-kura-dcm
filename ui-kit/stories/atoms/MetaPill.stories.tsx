import type { Meta, StoryObj } from '@storybook/react-vite'
import { MetaPill } from '@/components/atoms/meta-pill.tsx'
import { SectionLabel } from '@/components/atoms/section-label.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta = {
  title: 'Atoms/MetaPill',
  component: MetaPill,
  tags: ['autodocs'],
  args: {
    icon: <Icon name="tabler:calendar" />,
    children: '14 Feb 1996',
  },
  argTypes: {
    icon: {
      control: 'select',
      options: ['none', 'calendar', 'phone', 'user'],
      mapping: {
        none: undefined,
        calendar: <Icon name="tabler:calendar" />,
        phone: <Icon name="tabler:phone" />,
        user: <Icon name="tabler:user-circle" />,
      },
    },
    children: { control: 'text' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MetaPill>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    icon: <Icon name="tabler:calendar" />,
    children: '14 Feb 1996',
  },
}

export const WithoutIcon: Story = {
  args: {
    icon: undefined,
    children: 'English',
  },
}

export const Cluster: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <MetaPill icon={<Icon name="tabler:calendar" />}>14 Feb 1996</MetaPill>
      <MetaPill icon={<Icon name="tabler:user-circle" />}>F</MetaPill>
      <MetaPill icon={<Icon name="tabler:phone" />}>+855 12 345 678</MetaPill>
      <MetaPill icon={<Icon name="tabler:message-circle" />}>@maya_t</MetaPill>
      <MetaPill icon={<Icon name="tabler:languages" />}>English</MetaPill>
    </div>
  ),
}

export const Densities: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-6">
      {(['compact', 'cozy', 'comfortable'] as const).map((density) => (
        <div key={density} data-density={density} className="flex flex-col gap-2">
          <SectionLabel>data-density: {density}</SectionLabel>
          <div className="flex flex-wrap items-center gap-2">
            <MetaPill icon={<Icon name="tabler:calendar" />}>14 Feb 1996</MetaPill>
            <MetaPill icon={<Icon name="tabler:user-circle" />}>F</MetaPill>
            <MetaPill icon={<Icon name="tabler:phone" />}>+855 12 345 678</MetaPill>
            <MetaPill icon={<Icon name="tabler:message-circle" />}>@maya_t</MetaPill>
            <MetaPill icon={<Icon name="tabler:languages" />}>English</MetaPill>
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        Verify text never visually drops below 11 px in compact density.
      </p>
    </div>
  ),
}
