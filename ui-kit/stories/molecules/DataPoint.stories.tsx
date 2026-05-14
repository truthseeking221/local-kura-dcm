import type { Meta, StoryObj } from '@storybook/react-vite'

import { DataPoint } from '@/components/molecules/data-point.tsx'

const meta = {
  title: 'Molecules/DataPoint',
  component: DataPoint,
  tags: ['autodocs'],
  args: { label: 'Member name', children: 'Sok Sreymom' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DataPoint>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const EmptyValue: Story = {
  args: { label: 'Member ID', children: '' },
}

export const PolicyGrid: Story = {
  render: () => (
    <dl className="grid w-[640px] grid-cols-4 gap-x-6 gap-y-4 rounded-[var(--radius-lg)] border border-border bg-card p-5">
      <DataPoint label="Member name">Sok Sreymom</DataPoint>
      <DataPoint label="Member ID">{''}</DataPoint>
      <DataPoint label="Expiry">12/2027</DataPoint>
      <DataPoint label="Coverage">Both</DataPoint>
      <DataPoint label="Tier">Outpatient</DataPoint>
      <DataPoint label="Active until">12/2027</DataPoint>
      <DataPoint label="Co-pay">$5</DataPoint>
      <DataPoint label="Coverage rate">80%</DataPoint>
    </dl>
  ),
}
