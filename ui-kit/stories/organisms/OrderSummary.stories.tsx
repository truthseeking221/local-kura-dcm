import type { Meta, StoryObj } from '@storybook/react-vite'
import { ClipboardList } from 'lucide-react'

import { EmptyState } from '@/components/molecules/empty-state.tsx'
import {
  OrderSummary,
  type OrderSummaryGroup,
} from '@/components/organisms/order-summary.tsx'

const meta: Meta<typeof OrderSummary> = {
  title: 'Organisms/OrderSummary',
  component: OrderSummary,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof OrderSummary>

const DEFAULT_GROUPS: OrderSummaryGroup[] = [
  {
    id: 'vitals',
    label: 'Vitals',
    items: [
      { id: 'v-bp', name: 'Blood pressure', priceText: '—' },
      { id: 'v-pulse', name: 'Pulse oximetry', priceText: '—' },
    ],
  },
  {
    id: 'lab-test',
    label: 'Lab tests',
    items: [
      { id: 'l-cbc', name: 'Complete blood count (CBC)', priceText: '$12.00' },
      { id: 'l-lipid', name: 'Lipid panel', priceText: '$18.00' },
      { id: 'l-hba1c', name: 'HbA1c', priceText: '$15.00' },
      { id: 'l-tsh', name: 'TSH', priceText: '$22.00' },
    ],
  },
  {
    id: 'telecon',
    label: 'Teleconsultation',
    items: [],
  },
]

export const Default: Story = {
  args: {
    groups: DEFAULT_GROUPS,
    subtotalText: '$67.00',
    totalText: '$67.00',
  },
  render: (args) => (
    <div className="w-[520px]">
      <OrderSummary {...args} />
    </div>
  ),
}

export const WithPromo: Story = {
  args: {
    groups: DEFAULT_GROUPS,
    subtotalText: '$67.00',
    adjustments: [
      {
        id: 'promo',
        label: (
          <>
            Promo <span className="font-mono text-xs">SAVE10</span>
          </>
        ),
        valueText: '−$10.00',
        tone: 'success',
        onRemove: () => {
          /* story-only action */
        },
      },
    ],
    totalText: '$57.00',
  },
  render: (args) => (
    <div className="w-[520px]">
      <OrderSummary {...args} />
    </div>
  ),
}

export const MultipleAdjustments: Story = {
  args: {
    groups: DEFAULT_GROUPS,
    subtotalText: '$67.00',
    adjustments: [
      {
        id: 'promo',
        label: (
          <>
            Promo <span className="font-mono text-xs">SAVE10</span>
          </>
        ),
        valueText: '−$10.00',
        tone: 'success',
      },
      {
        id: 'processing',
        label: 'Processing fee',
        valueText: '$1.50',
      },
      {
        id: 'credit',
        label: 'Account credit',
        valueText: '−$5.00',
      },
    ],
    totalText: '$53.50',
  },
  render: (args) => (
    <div className="w-[520px]">
      <OrderSummary {...args} />
    </div>
  ),
}

export const Empty: Story = {
  args: {
    groups: [],
    totalText: '$0.00',
  },
  render: (args) => (
    <div className="w-[520px]">
      <OrderSummary {...args} />
    </div>
  ),
}

export const CustomEmptyState: Story = {
  args: {
    groups: [],
    totalText: '$0.00',
    emptyState: (
      <EmptyState
        icon={<ClipboardList />}
        title="No tests yet"
        description="Pick a panel on the left to add tests to this patient's order."
      />
    ),
  },
  render: (args) => (
    <div className="w-[520px]">
      <OrderSummary {...args} />
    </div>
  ),
}

export const KhmerRiel: Story = {
  args: {
    groups: [
      {
        id: 'lab-test',
        label: 'Lab tests',
        items: [
          { id: 'l-cbc', name: 'Complete blood count (CBC)', priceText: '48,000 ៛' },
          { id: 'l-lipid', name: 'Lipid panel', priceText: '72,000 ៛' },
        ],
      },
    ],
    subtotalText: '120,000 ៛',
    adjustments: [
      {
        id: 'promo',
        label: 'Promo MAY10',
        valueText: '−12,000 ៛',
        tone: 'success',
      },
    ],
    totalText: '108,000 ៛',
  },
  render: (args) => (
    <div className="w-[520px]">
      <OrderSummary {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    title: 'Order summary',
    subtotalLabel: 'Subtotal',
    totalLabel: 'Total due',
    groups: DEFAULT_GROUPS,
    subtotalText: '$67.00',
    totalText: '$67.00',
  },
  render: (args) => (
    <div className="w-[520px]">
      <OrderSummary {...args} />
    </div>
  ),
}
