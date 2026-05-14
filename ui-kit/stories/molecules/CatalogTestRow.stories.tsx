import type { Meta, StoryObj } from '@storybook/react-vite'

import { CatalogTestRow } from '@/components/molecules/catalog-test-row.tsx'

const meta = {
  title: 'Molecules/CatalogTestRow',
  component: CatalogTestRow,
  tags: ['autodocs', 'module:receptionist'],
  args: {
    name: 'Complete Blood Count (CBC)',
    price: '$8.00',
    onAdd: () => {},
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogTestRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-[640px]">
      <CatalogTestRow {...args} />
    </div>
  ),
}

export const HighlightedWithTags: Story = {
  name: 'Highlighted row with HAEM + POPULAR + AI button',
  render: () => (
    <div className="w-[640px]">
      <CatalogTestRow
        name="Complete Blood Count (CBC)"
        price="$8.00"
        tags={[
          { label: 'HAEM', tone: 'haem' },
          { label: 'POPULAR', tone: 'popular' },
        ]}
        highlighted
        onAdd={() => {}}
        onShowAiReason={() => {}}
      />
    </div>
  ),
}

export const Vitals: Story = {
  name: 'Free vitals row (no AI reason)',
  render: () => (
    <div className="w-[640px]">
      <CatalogTestRow
        name="Blood pressure"
        price="$0.00"
        tags={[{ label: 'VITALS', tone: 'vitals' }]}
        onAdd={() => {}}
      />
    </div>
  ),
}

export const LongName: Story = {
  name: 'Long name truncation',
  render: () => (
    <div className="w-[480px]">
      <CatalogTestRow
        name="Very long test name that should truncate gracefully on narrow viewports"
        price="$25.00"
        tags={[{ label: 'BIOCHEM', tone: 'biochem' }]}
        onAdd={() => {}}
        onShowAiReason={() => {}}
      />
    </div>
  ),
}

export const StackedRows: Story = {
  name: 'Realistic 4-row stack',
  render: () => (
    <div className="w-[640px]">
      <CatalogTestRow
        name="Complete Blood Count (CBC)"
        price="$8.00"
        tags={[
          { label: 'HAEM', tone: 'haem' },
          { label: 'POPULAR', tone: 'popular' },
        ]}
        highlighted
        onAdd={() => {}}
        onShowAiReason={() => {}}
      />
      <CatalogTestRow
        name="Blood Glucose (Fasting)"
        price="$5.00"
        tags={[
          { label: 'BIOCHEM', tone: 'biochem' },
          { label: 'POPULAR', tone: 'popular' },
        ]}
        onAdd={() => {}}
        onShowAiReason={() => {}}
      />
      <CatalogTestRow
        name="Urinalysis"
        price="$6.00"
        tags={[
          { label: 'URINE', tone: 'urine' },
          { label: 'POPULAR', tone: 'popular' },
        ]}
        onAdd={() => {}}
        onShowAiReason={() => {}}
      />
      <CatalogTestRow
        name="Blood pressure"
        price="$0.00"
        tags={[{ label: 'VITALS', tone: 'vitals' }]}
        onAdd={() => {}}
      />
    </div>
  ),
}
