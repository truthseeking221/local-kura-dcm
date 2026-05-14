import type { Meta, StoryObj } from '@storybook/react-vite'
import { Box, Plus, Sparkles } from 'lucide-react'

import {
  BundleTable,
  type BundleTableItem,
} from '@/components/organisms/bundle-table.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'

const meta: Meta<typeof BundleTable> = {
  title: 'Organisms/BundleTable',
  component: BundleTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof BundleTable>

const MEMBER_TESTS_HEALTH = [
  'CBC (Complete Blood Count)',
  'Lipid panel',
  'HbA1c',
  'TSH',
  'Urinalysis',
  'Comprehensive metabolic panel',
  'Vitamin D',
]

const MEMBER_TESTS_PREOP = [
  'CBC',
  'BMP',
  'PT/INR',
  'Urinalysis',
  '12-lead ECG',
  'Chest X-ray',
]

const MEMBER_TESTS_DIABETES = [
  'HbA1c',
  'Fasting glucose',
  'Lipid panel',
  'Microalbumin',
]

function buildItem(args: {
  id: string
  name: string
  description: string
  members: string[]
  totalText: string
  footer: string
  defaultOpen?: boolean
}): BundleTableItem {
  return {
    id: args.id,
    icon: <Box size={18} strokeWidth={1.5} />,
    name: args.name,
    description: args.description,
    countText: `${args.members.length} tests`,
    totalText: args.totalText,
    defaultOpen: args.defaultOpen,
    action: (
      <Button size="sm">
        <Plus />
        Add bundle
      </Button>
    ),
    expansion: (
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          {args.members.map((m) => (
            <Badge
              key={m}
              variant="outline"
              className="gap-1 text-[11px] font-medium"
            >
              {m}
            </Badge>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Sparkles
            size={12}
            strokeWidth={1.5}
            aria-hidden
            className="mt-0.5 shrink-0"
          />
          {args.footer}
        </p>
      </div>
    ),
  }
}

const DEFAULT_ITEMS: BundleTableItem[] = [
  buildItem({
    id: 'health',
    name: 'Annual health check-up',
    description: 'Routine screening bundle for adults 18+.',
    members: MEMBER_TESTS_HEALTH,
    totalText: '$95.00',
    footer:
      'Suggested for patients overdue on annual screening — last visit 12+ months ago.',
  }),
  buildItem({
    id: 'preop',
    name: 'Pre-op screen',
    description: 'Pre-anaesthesia workup for elective surgery.',
    members: MEMBER_TESTS_PREOP,
    totalText: '$110.00',
    footer:
      'Booked 7+ days before scheduled procedure for clearance review.',
  }),
  buildItem({
    id: 'diabetes',
    name: 'Diabetes follow-up',
    description: 'Quarterly monitoring panel for diabetic patients.',
    members: MEMBER_TESTS_DIABETES,
    totalText: '$48.00',
    footer: 'Pairs with the nurse-led foot-check protocol on the same visit.',
  }),
]

export const Default: Story = {
  args: {
    items: DEFAULT_ITEMS,
  },
  render: (args) => (
    <div className="w-[840px]">
      <BundleTable {...args} />
    </div>
  ),
}

export const WithExpansion: Story = {
  args: {
    items: [
      buildItem({
        id: 'health',
        name: 'Annual health check-up',
        description: 'Routine screening bundle for adults 18+.',
        members: MEMBER_TESTS_HEALTH,
        totalText: '$95.00',
        footer:
          'Suggested for patients overdue on annual screening — last visit 12+ months ago.',
        defaultOpen: true,
      }),
      buildItem({
        id: 'preop',
        name: 'Pre-op screen',
        description: 'Pre-anaesthesia workup for elective surgery.',
        members: MEMBER_TESTS_PREOP,
        totalText: '$110.00',
        footer:
          'Booked 7+ days before scheduled procedure for clearance review.',
      }),
      buildItem({
        id: 'diabetes',
        name: 'Diabetes follow-up',
        description: 'Quarterly monitoring panel for diabetic patients.',
        members: MEMBER_TESTS_DIABETES,
        totalText: '$48.00',
        footer:
          'Pairs with the nurse-led foot-check protocol on the same visit.',
      }),
    ],
  },
  render: (args) => (
    <div className="w-[840px]">
      <BundleTable {...args} />
    </div>
  ),
}

export const Empty: Story = {
  args: {
    items: [],
  },
  render: (args) => (
    <div className="w-[840px] rounded-[var(--radius-lg)] border border-border bg-card">
      <BundleTable {...args} />
    </div>
  ),
}

export const NoHeader: Story = {
  args: {
    items: DEFAULT_ITEMS,
    showHeader: false,
  },
  render: (args) => (
    <div className="w-[840px]">
      <BundleTable {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    items: DEFAULT_ITEMS,
    showHeader: true,
    nameHeader: 'Bundle',
    countHeader: 'Tests',
    totalHeader: 'Total',
  },
  render: (args) => (
    <div className="w-[840px]">
      <BundleTable {...args} />
    </div>
  ),
}
