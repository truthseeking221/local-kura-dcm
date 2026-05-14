import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from '@/components/atoms/icon.tsx'
import { CatalogNavItem } from '@/components/molecules/catalog-nav-item.tsx'

const meta = {
  title: 'Molecules/CatalogNavItem',
  component: CatalogNavItem,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CatalogNavItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'General Health',
    count: 7,
    icon: <Icon name="tabler:stethoscope" size={15} />,
  },
  render: (args) => (
    <div className="w-48">
      <CatalogNavItem {...args} />
    </div>
  ),
}

export const Active: Story = {
  args: {
    label: 'General Health',
    count: 7,
    active: true,
    icon: <Icon name="tabler:stethoscope" size={15} className="text-[var(--brand-600)]" />,
  },
  render: (args) => (
    <div className="w-48">
      <CatalogNavItem {...args} />
    </div>
  ),
}

export const WithShortcut: Story = {
  args: {
    label: 'Bundles',
    count: 12,
    shortcut: '1',
    emphasized: true,
    icon: <Icon name="tabler:cube" size={15} className="text-[var(--brand-600)]" />,
  },
  render: (args) => (
    <div className="w-48">
      <CatalogNavItem {...args} />
    </div>
  ),
}

export const States: Story = {
  args: {
    label: 'General Health',
  },
  render: () => (
    <div className="flex w-52 flex-col gap-1 rounded-[var(--radius-lg)] border border-border bg-[var(--surface-2)] p-1.5">
      <CatalogNavItem
        label="Bundles"
        count={12}
        shortcut="1"
        emphasized
        icon={<Icon name="tabler:cube" size={15} className="text-[var(--brand-600)]" />}
      />
      <CatalogNavItem
        label="General Health"
        count={7}
        active
        icon={<Icon name="tabler:stethoscope" size={15} className="text-[var(--brand-600)]" />}
      />
      <CatalogNavItem
        label="STDs"
        count={37}
        icon={<Icon name="tabler:shield-plus" size={15} />}
      />
      <CatalogNavItem
        label="Reproductive Health"
        count={12}
        icon={<Icon name="tabler:scissors" size={15} />}
      />
      <CatalogNavItem
        label="Disabled category"
        count={0}
        disabled
        icon={<Icon name="tabler:lock" size={15} />}
        className="opacity-50"
      />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    label: 'Cardiology',
    count: 21,
    shortcut: '',
    active: false,
    emphasized: false,
    icon: <Icon name="tabler:heartbeat" size={15} />,
  },
  render: (args) => (
    <div className="w-52">
      <CatalogNavItem {...args} />
    </div>
  ),
}
