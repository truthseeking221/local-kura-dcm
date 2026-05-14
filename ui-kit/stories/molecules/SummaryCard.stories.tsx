import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from '@/components/atoms/icon.tsx'
import { DataPoint } from '@/components/molecules/data-point.tsx'
import { StatusPill } from '@/components/molecules/status-pill.tsx'
import { SummaryCard } from '@/components/molecules/summary-card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'

const meta = {
  title: 'Molecules/SummaryCard',
  component: SummaryCard,
  tags: ['autodocs', 'module:receptionist', 'module:phlebo', 'module:patient'],
  args: {
    iconBadgeIcon: <Icon name="tabler:shield-check" />,
    iconBadgeTone: 'success',
    iconBadgeSize: 'lg',
    title: 'Summary title',
    children: (
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        <DataPoint label="Field A">Value A</DataPoint>
        <DataPoint label="Field B">Value B</DataPoint>
      </dl>
    ),
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SummaryCard>

export default meta
type Story = StoryObj<typeof meta>

export const IdentityCaptured: Story = {
  name: 'Eyebrow + DataPoints + footer (Step 1 captured)',
  render: () => (
    <SummaryCard
      iconBadgeIcon={<Icon name="tabler:shield-check" />}
      iconBadgeTone="success"
      eyebrow="Identity captured"
      title="Sok Sreymao"
      subtitle={
        <span lang="km" className="text-xs text-muted-foreground">
          សុខ ស្រីម៉ៅ
        </span>
      }
      actions={
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
          <Icon name="tabler:refresh" size={12} />
          Re-capture
        </Button>
      }
      footer={
        <>
          <Badge variant="neutral">
            <Icon name="tabler:camera" size={10} /> Captured via QR scan · 09:42
          </Badge>
          <Badge variant="info">
            <Icon name="tabler:lock" size={10} /> 4 fields locked
          </Badge>
        </>
      }
    >
      <dl className="grid grid-cols-4 gap-x-6 gap-y-4">
        <DataPoint label="Date of birth">01 Jan 1996</DataPoint>
        <DataPoint label="Sex at birth">Female</DataPoint>
        <DataPoint label="National ID">12345678</DataPoint>
        <DataPoint label="Phone">+855 12 345 678</DataPoint>
      </dl>
    </SummaryCard>
  ),
}

export const InsurancePolicy: Story = {
  name: 'StatusPill + DataPoints (Step 3 with-policy)',
  render: () => (
    <SummaryCard
      iconBadgeIcon={<Icon name="tabler:building" />}
      iconBadgeTone="brand"
      title="Forte Insurance"
      subtitle="Last verified · 08:21 · supervisor LN"
      statusPill={<StatusPill tone="success">Eligible</StatusPill>}
      actions={
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Icon name="tabler:refresh" size={12} /> Re-verify
        </Button>
      }
    >
      <dl className="grid grid-cols-4 gap-x-6 gap-y-4">
        <DataPoint label="Member ID">FRT-887200119</DataPoint>
        <DataPoint label="Group">CORP-90021</DataPoint>
        <DataPoint label="Coverage">Outpatient · 80%</DataPoint>
        <DataPoint label="Co-pay">$5</DataPoint>
        <DataPoint label="Active until">12/2027</DataPoint>
        <DataPoint label="Pre-auth">Not required</DataPoint>
        <DataPoint label="Tier">Gold</DataPoint>
        <DataPoint label="Effective">01/2024</DataPoint>
      </dl>
    </SummaryCard>
  ),
}

export const Dividerless: Story = {
  render: () => (
    <SummaryCard
      iconBadgeIcon={<Icon name="tabler:shield-check" />}
      iconBadgeTone="success"
      title="Compact summary"
      dividerless
    >
      <p className="text-sm text-muted-foreground">Body without divider.</p>
    </SummaryCard>
  ),
}

export const PaidReceipt: Story = {
  name: 'Tinted success (no body) — header-only callout',
  render: () => (
    <SummaryCard
      iconBadgeIcon={<Icon name="tabler:circle-check" />}
      iconBadgeTone="success"
      iconBadgeSize="md"
      tone="success"
      title="Payment received · $20.00"
      subtitle="Settled via Cash. Continue to check-in to issue the queue number."
      actions={
        <Button variant="ghost" size="sm">
          <Icon name="tabler:refresh" size={12} /> Change method
        </Button>
      }
    />
  ),
}

export const ZeroPayment: Story = {
  name: 'Tinted brand (no body) — zero balance callout',
  render: () => (
    <SummaryCard
      iconBadgeIcon={<Icon name="tabler:sparkles" />}
      iconBadgeTone="brand"
      iconBadgeSize="md"
      tone="brand"
      title="No payment needed"
      subtitle="The patient owes nothing for this visit. Continue to check-in."
    />
  ),
}

export const Playground: Story = {
  args: {
    title: 'Title',
    eyebrow: '',
    subtitle: '',
    iconBadgeTone: 'brand',
    iconBadgeSize: 'lg',
    tone: 'default',
    dividerless: false,
  },
  argTypes: {
    iconBadgeTone: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger', 'neutral', 'ai', 'brand'],
    },
    iconBadgeSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: {
      control: 'select',
      options: ['default', 'info', 'success', 'warning', 'danger', 'brand'],
    },
  },
  render: (args) => (
    <SummaryCard {...args} iconBadgeIcon={<Icon name="tabler:shield-check" />}>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        <DataPoint label="Field A">Value A</DataPoint>
        <DataPoint label="Field B">Value B</DataPoint>
      </dl>
    </SummaryCard>
  ),
}
