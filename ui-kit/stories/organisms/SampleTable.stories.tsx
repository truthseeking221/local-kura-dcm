import type { Meta, StoryObj } from '@storybook/react-vite'

import { SampleTable } from '@/components/organisms/sample-table.tsx'
import { PHLEBO_QUEUE, TUBE_CATALOG } from '../phlebo/_fixtures/phlebo.ts'

const samples = PHLEBO_QUEUE[0].samples

const meta = {
  title: 'Organisms/SampleTable',
  component: SampleTable,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
  args: {
    samples,
    tubes: TUBE_CATALOG,
    focusedSampleId: samples[0].id,
  },
} satisfies Meta<typeof SampleTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-[min(1180px,calc(100vw-2rem))]">
      <SampleTable {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    focusedSampleId: samples[1].id,
  },
  render: Default.render,
}

export const States: Story = {
  render: () => (
    <div className="w-[min(1180px,calc(100vw-2rem))]">
      <SampleTable
        tubes={TUBE_CATALOG}
        focusedSampleId={samples[1].id}
        samples={[
          samples[0],
          { ...samples[1], status: 'collected', collectedAt: '08:24', inverted: false },
          { ...samples[2], status: 'deferred', deferReason: 'Difficult vein' },
        ]}
      />
    </div>
  ),
}

export const PhlebotomyScenario: Story = Default
