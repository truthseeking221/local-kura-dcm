import type { Meta, StoryObj } from '@storybook/react-vite'

import { SampleDeferDialog } from '@/components/organisms/sample-defer-dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { DEFAULT_DEFER_REASON, PHLEBO_QUEUE, tubeByKey } from '../phlebo/_fixtures/phlebo.ts'

const sample = PHLEBO_QUEUE[0].samples[0]

const meta = {
  title: 'Organisms/SampleDeferDialog',
  component: SampleDeferDialog,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
  args: {
    sample,
    tube: tubeByKey(sample.tube),
    defaultReason: DEFAULT_DEFER_REASON,
    trigger: <Button variant="outline">Open defer sample</Button>,
  },
} satisfies Meta<typeof SampleDeferDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    defaultOpen: true,
  },
}

export const States: Story = {
  render: () => (
    <div className="flex gap-3">
      <SampleDeferDialog
        sample={sample}
        tube={tubeByKey(sample.tube)}
        defaultReason="Difficult vein"
        trigger={<Button variant="outline">Difficult vein</Button>}
      />
      <SampleDeferDialog
        sample={PHLEBO_QUEUE[0].samples[1]}
        tube={tubeByKey(PHLEBO_QUEUE[0].samples[1].tube)}
        defaultReason="Patient declined"
        trigger={<Button variant="outline">Patient declined</Button>}
      />
    </div>
  ),
}

export const OpenScenario: Story = {
  args: {
    defaultOpen: true,
  },
}
