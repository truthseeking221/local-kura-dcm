import type { Meta, StoryObj } from '@storybook/react-vite'

import { SampleDetailPanel } from '@/components/organisms/sample-detail-panel.tsx'
import { PHLEBO_QUEUE, tubeByKey } from '../phlebo/_fixtures/phlebo.ts'

const patient = PHLEBO_QUEUE[0]
const sample = patient.samples[0]
const relatedSamples = patient.samples.map((item) => ({
  id: item.id,
  tube: tubeByKey(item.tube),
}))

const meta = {
  title: 'Organisms/SampleDetailPanel',
  component: SampleDetailPanel,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
  args: {
    sample,
    tube: tubeByKey(sample.tube),
    relatedSamples,
  },
} satisfies Meta<typeof SampleDetailPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    sample: { ...sample, status: 'collected', collectedAt: '08:24', inverted: true },
  },
}

export const States: Story = {
  render: () => (
    <div className="grid w-[min(1080px,calc(100vw-3rem))] gap-4 md:grid-cols-2">
      <SampleDetailPanel sample={sample} tube={tubeByKey(sample.tube)} relatedSamples={relatedSamples} />
      <SampleDetailPanel
        sample={{ ...sample, status: 'collected', collectedAt: '08:24', inverted: true }}
        tube={tubeByKey(sample.tube)}
        relatedSamples={relatedSamples}
      />
    </div>
  ),
}

export const InspectorScenario: Story = Default
