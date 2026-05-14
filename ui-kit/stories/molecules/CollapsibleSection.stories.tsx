import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { CollapsibleSection } from '@/components/molecules/collapsible-section.tsx'

const meta: Meta<typeof CollapsibleSection> = {
  title: 'Molecules/CollapsibleSection',
  component: CollapsibleSection,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    count: { control: { type: 'number', min: 0, max: 99 } },
    defaultOpen: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof CollapsibleSection>

const SampleRows = () => (
  <div className="px-4 py-2 text-sm text-muted-foreground">
    <p>Blood pressure (Sys/Dia)</p>
    <p>Pulse (per minute)</p>
    <p>Body temperature</p>
  </div>
)

const formatUsd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export const Default: Story = {
  args: {
    title: 'Vitals',
    defaultOpen: true,
    children: <SampleRows />,
  },
  render: (args) => (
    <div className="w-[480px] rounded-[var(--radius-lg)] border border-border bg-card">
      <CollapsibleSection {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    title: 'Lab tests',
    count: 4,
    defaultOpen: true,
    children: <SampleRows />,
  },
  render: (args) => (
    <div className="w-[480px] rounded-[var(--radius-lg)] border border-border bg-card">
      <CollapsibleSection {...args} />
    </div>
  ),
}

export const WithCount: Story = {
  render: () => (
    <div className="w-[480px] rounded-[var(--radius-lg)] border border-border bg-card">
      <CollapsibleSection title="Lab tests" count={4}>
        <SampleRows />
      </CollapsibleSection>
    </div>
  ),
}

export const WithMeta: Story = {
  render: () => (
    <div className="w-[480px] rounded-[var(--radius-lg)] border border-border bg-card">
      <CollapsibleSection title="Lab tests" count={4} meta={formatUsd(48)}>
        <SampleRows />
      </CollapsibleSection>
    </div>
  ),
}

export const Controlled: Story = {
  render: function ControlledStory() {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex w-[480px] flex-col gap-3">
        <button
          type="button"
          className="self-start rounded-[var(--radius-sm)] border border-border bg-card px-3 py-1.5 text-xs"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Collapse from outside' : 'Expand from outside'}
        </button>
        <div className="rounded-[var(--radius-lg)] border border-border bg-card">
          <CollapsibleSection title="Vitals" count={3} open={open} onOpenChange={setOpen}>
            <SampleRows />
          </CollapsibleSection>
        </div>
      </div>
    )
  },
}

export const Stack: Story = {
  render: () => (
    <div className="w-[480px] overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
      <CollapsibleSection title="Vitals" count={3} meta={formatUsd(0)}>
        <div className="px-4 py-2 text-sm text-muted-foreground">
          <p>BP, pulse, temperature</p>
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Lab tests" count={4} meta={formatUsd(48)}>
        <div className="px-4 py-2 text-sm text-muted-foreground">
          <p>HbA1c, lipid panel, CBC, urine</p>
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Telecon" count={1} meta={formatUsd(20)}>
        <div className="px-4 py-2 text-sm text-muted-foreground">
          <p>30 min follow-up</p>
        </div>
      </CollapsibleSection>
    </div>
  ),
}
