import type { Meta, StoryObj } from '@storybook/react-vite'
import { Activity, Clock, Info, Minus, Plus, Search } from 'lucide-react'
import { useState } from 'react'

import { Callout } from '@/components/molecules/callout.tsx'
import { ExpandableItemRow } from '@/components/molecules/expandable-item-row.tsx'
import { InfoSection } from '@/components/molecules/info-section.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'

const meta: Meta<typeof ExpandableItemRow> = {
  title: 'Molecules/ExpandableItemRow',
  component: ExpandableItemRow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof ExpandableItemRow>

function PrimaryRowBody({ inCart }: { inCart?: boolean }) {
  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">CBC (Complete Blood Count)</div>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <Badge variant="neutral" className="text-[9px] uppercase tracking-wider">
            Lab
          </Badge>
          <Badge variant="warning" className="text-[9px] uppercase tracking-wider">
            Popular
          </Badge>
        </div>
      </div>
      <span className="font-mono text-sm tabular-nums">$12.00</span>
      <Button size="sm" variant={inCart ? 'destructive' : 'outline'}>
        {inCart ? <Minus /> : <Plus />}
        {inCart ? 'Remove' : 'Add'}
      </Button>
    </>
  )
}

function SampleExpansion() {
  return (
    <Callout tone="info">
      <InfoSection icon={<Info />} label="What it measures">
        A complete blood count evaluates red cells, white cells, and platelets
        to screen for anemia, infection, and clotting issues.
      </InfoSection>
      <InfoSection icon={<Search />} label="Looks for">
        Anemia, infection, leukocytosis, thrombocytopenia, and other marrow
        production abnormalities.
      </InfoSection>
      <InfoSection icon={<Activity />} label="What you'll do">
        Single venous blood draw, ~3 mL. No fasting required.
      </InfoSection>
      <InfoSection icon={<Clock />} label="Results by">
        Same day, typically within 2 hours of draw.
      </InfoSection>
    </Callout>
  )
}

export const Default: Story = {
  render: () => (
    <div className="w-[720px] divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card">
      <ExpandableItemRow expansion={<SampleExpansion />}>
        <PrimaryRowBody />
      </ExpandableItemRow>
    </div>
  ),
}

export const OpenByDefault: Story = {
  render: () => (
    <div className="w-[720px] divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card">
      <ExpandableItemRow defaultOpen expansion={<SampleExpansion />}>
        <PrimaryRowBody />
      </ExpandableItemRow>
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    function ControlledExample() {
      const [open, setOpen] = useState(false)
      return (
        <div className="w-[720px] space-y-3">
          <Button size="sm" variant="outline" onClick={() => setOpen((p) => !p)}>
            External toggle (open = {String(open)})
          </Button>
          <div className="divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card">
            <ExpandableItemRow
              open={open}
              onOpenChange={setOpen}
              expansion={<SampleExpansion />}
            >
              <PrimaryRowBody />
            </ExpandableItemRow>
          </div>
        </div>
      )
    }
    return <ControlledExample />
  },
}

export const RealisticTestRow: Story = {
  render: () => (
    <div className="w-[720px] divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card">
      <ExpandableItemRow expansion={<SampleExpansion />}>
        <PrimaryRowBody />
      </ExpandableItemRow>
      <ExpandableItemRow
        className="bg-[var(--status-danger-bg)]/40"
        expansion={<SampleExpansion />}
      >
        <PrimaryRowBody inCart />
      </ExpandableItemRow>
      <ExpandableItemRow expansion={<SampleExpansion />}>
        <PrimaryRowBody />
      </ExpandableItemRow>
    </div>
  ),
}

export const Playground: Story = {
  args: {
    defaultOpen: false,
    expandLabel: 'Show details',
    collapseLabel: 'Hide details',
  },
  render: (args) => (
    <div className="w-[720px] divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card">
      <ExpandableItemRow {...args} expansion={<SampleExpansion />}>
        <PrimaryRowBody />
      </ExpandableItemRow>
    </div>
  ),
}
