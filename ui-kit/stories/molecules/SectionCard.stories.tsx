import type { Meta, StoryObj } from '@storybook/react-vite'

import { SectionCard } from '@/components/molecules/section-card.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'

const meta = {
  title: 'Molecules/SectionCard',
  component: SectionCard,
  tags: ['autodocs', 'module:receptionist', 'module:phlebo'],
  args: {
    title: 'Identity',
    padding: 'md',
    metaTone: 'neutral',
    children: <p className="text-sm text-muted-foreground">Section body.</p>,
  },
  argTypes: {
    titleAs: { control: 'inline-radio', options: ['h2', 'h3', 'h4'] },
    padding: { control: 'inline-radio', options: ['md', 'lg'] },
    metaTone: { control: 'inline-radio', options: ['success', 'neutral'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SectionCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <SectionCard {...args}>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Full name</Label>
          <Input defaultValue="Sok Sreymao" />
        </div>
        <div className="space-y-1.5">
          <Label>Date of birth</Label>
          <Input defaultValue="01-01-1996" />
        </div>
      </div>
    </SectionCard>
  ),
}

export const WithSourceBadge: Story = {
  name: 'With success "From QR scan" pill',
  render: () => (
    <SectionCard title="Identity" meta="From QR scan" metaTone="success">
      <p className="text-sm text-muted-foreground">Auto-filled fields are locked.</p>
    </SectionCard>
  ),
}

export const WithNeutralMeta: Story = {
  render: () => (
    <SectionCard title="Address" meta="Optional" metaTone="neutral">
      <p className="text-sm text-muted-foreground">Patient hasn't filled this in yet.</p>
    </SectionCard>
  ),
}

export const WithHint: Story = {
  name: 'With muted right-aligned hint',
  render: () => (
    <SectionCard title="Contact channels" hint="At least one verified channel required">
      <p className="text-sm text-muted-foreground">Pick Telegram or SMS.</p>
    </SectionCard>
  ),
}

export const LargePadding: Story = {
  render: () => (
    <SectionCard title="Order summary" padding="lg">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>Subtotal</div>
        <div className="text-right tabular-nums">$55.00</div>
        <div>Co-pay</div>
        <div className="text-right tabular-nums">$5.00</div>
      </dl>
    </SectionCard>
  ),
}

export const NoTitle: Story = {
  name: 'Untitled — generic bordered surface (search frame, prompt panel)',
  render: () => (
    <SectionCard padding="md">
      <p className="text-sm text-muted-foreground">
        When `title` is omitted the header band is suppressed entirely. Useful for wrapping a
        SearchInput, a prompt panel, or any sub-flow body that doesn't need a labeled header.
      </p>
    </SectionCard>
  ),
}

export const Tones: Story = {
  name: 'Surface tones (default / info / success / warning / danger / brand)',
  render: () => (
    <div className="space-y-3 w-[640px]">
      <SectionCard title="Default">
        <p className="text-sm">Neutral surface + neutral border.</p>
      </SectionCard>
      <SectionCard title="Info" tone="info">
        <p className="text-sm">Info-tinted surface + colored border.</p>
      </SectionCard>
      <SectionCard title="Success" tone="success">
        <p className="text-sm">Success-tinted surface + colored border.</p>
      </SectionCard>
      <SectionCard title="Warning" tone="warning">
        <p className="text-sm">Warning-tinted surface + colored border.</p>
      </SectionCard>
      <SectionCard title="Danger" tone="danger">
        <p className="text-sm">Danger-tinted surface + colored border.</p>
      </SectionCard>
      <SectionCard title="Brand" tone="brand">
        <p className="text-sm">Brand-tinted surface + colored border.</p>
      </SectionCard>
    </div>
  ),
}

export const Playground: Story = {
  args: {
    title: 'Section title',
    meta: '',
    metaTone: 'neutral',
    hint: '',
    padding: 'md',
    tone: 'default',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['default', 'info', 'success', 'warning', 'danger', 'brand'],
    },
  },
  render: (args) => (
    <SectionCard {...args}>
      <p className="text-sm">Body content.</p>
    </SectionCard>
  ),
}
