import type { Meta, StoryObj } from '@storybook/react-vite'

import { TubeRack, type TubeRackItem } from '@/components/organisms/tube-rack.tsx'
import { PHLEBO_QUEUE, TUBE_CATALOG, tubeByKey, type Sample } from '../phlebo/_fixtures/phlebo.ts'

function itemsFromSamples(samples: Sample[]): TubeRackItem[] {
  const required = new Map<string, TubeRackItem>()
  for (const sample of samples) {
    const current = required.get(sample.tube) ?? { tubeKey: sample.tube, count: 0, status: sample.status }
    current.count += 1
    if (sample.status === 'deferred') current.status = 'deferred'
    if (sample.status === 'collected' && tubeByKey(sample.tube).inversions > 0 && !sample.inverted) {
      current.needsInvert = true
    }
    required.set(sample.tube, current)
  }
  return [...required.values()]
}

const samples = PHLEBO_QUEUE[0].samples

const meta = {
  title: 'Organisms/TubeRack',
  component: TubeRack,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
  args: {
    tubes: TUBE_CATALOG,
    items: itemsFromSamples(samples),
    focusedTubeKey: samples[0].tube,
  },
} satisfies Meta<typeof TubeRack>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-[min(900px,calc(100vw-3rem))]">
      <TubeRack {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    focusedTubeKey: samples[1].tube,
  },
  render: Default.render,
}

export const States: Story = {
  render: () => (
    <div className="grid w-[min(900px,calc(100vw-3rem))] gap-4">
      <TubeRack tubes={TUBE_CATALOG} items={itemsFromSamples(samples)} focusedTubeKey={samples[0].tube} />
      <TubeRack
        tubes={TUBE_CATALOG}
        items={itemsFromSamples(samples.map((sample) => ({ ...sample, status: 'collected', inverted: false })))}
        focusedTubeKey={samples[1].tube}
      />
    </div>
  ),
}

export const CollectionScenario: Story = Default
