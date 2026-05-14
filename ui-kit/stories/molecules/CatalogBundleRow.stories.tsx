import type { Meta, StoryObj } from '@storybook/react-vite'

import { CatalogBundleRow } from '@/components/molecules/catalog-bundle-row.tsx'

const meta = {
  title: 'Molecules/CatalogBundleRow',
  component: CatalogBundleRow,
  tags: ['autodocs', 'module:receptionist'],
  args: {
    name: 'Annual health check-up',
    description: 'Routine screening bundle for adults 18+.',
    testsLabel: '7 tests',
    total: '$95.00',
    actionLabel: 'Add bundle',
    onAdd: () => {},
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogBundleRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-[640px]">
      <CatalogBundleRow {...args} />
    </div>
  ),
}

export const PartialAdd: Story = {
  name: 'Partial add label ("Add 4 more")',
  render: () => (
    <div className="w-[640px]">
      <CatalogBundleRow
        name="Pre-op screen"
        description="Pre-anaesthesia workup for elective surgery."
        testsLabel="6 tests"
        total="$110.00"
        actionLabel="Add 4 more"
        onAdd={() => {}}
      />
    </div>
  ),
}

export const StackedRows: Story = {
  name: 'Realistic 3-row stack',
  render: () => (
    <div className="w-[640px]">
      <CatalogBundleRow
        name="Annual health check-up"
        description="Routine screening bundle for adults 18+."
        testsLabel="7 tests"
        total="$95.00"
        actionLabel="Add bundle"
        onAdd={() => {}}
      />
      <CatalogBundleRow
        name="Pre-op screen"
        description="Pre-anaesthesia workup for elective surgery."
        testsLabel="6 tests"
        total="$110.00"
        actionLabel="Add 4 more"
        onAdd={() => {}}
      />
      <CatalogBundleRow
        name="Diabetes follow-up"
        description="Quarterly monitoring panel for diabetic patients."
        testsLabel="4 tests"
        total="$48.00"
        actionLabel="Add bundle"
        onAdd={() => {}}
      />
    </div>
  ),
}

export const LongDescription: Story = {
  name: 'Long description truncation',
  render: () => (
    <div className="w-[480px]">
      <CatalogBundleRow
        name="Comprehensive geriatric assessment"
        description="Extended bundle for adults 65+ including cognitive, mobility, cardiovascular, and metabolic screening tests."
        testsLabel="14 tests"
        total="$215.00"
        actionLabel="Add bundle"
        onAdd={() => {}}
      />
    </div>
  ),
}
