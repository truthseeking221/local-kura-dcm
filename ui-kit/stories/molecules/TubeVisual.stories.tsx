import type { Meta, StoryObj } from '@storybook/react-vite'

import { SectionCard } from '@/components/molecules/section-card.tsx'
import { TubeDot, TubeVisual } from '@/components/molecules/tube-visual.tsx'
import { TUBE_CATALOG } from '../phlebo/_fixtures/phlebo.ts'

const meta = {
  title: 'Molecules/TubeVisual',
  component: TubeVisual,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
  args: {
    tube: TUBE_CATALOG[3],
    count: 1,
  },
} satisfies Meta<typeof TubeVisual>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    count: 2,
    status: 'collected',
    focused: true,
  },
}

export const States: Story = {
  render: () => (
    <div className="flex max-w-[min(820px,calc(100vw-3rem))] gap-3 overflow-x-auto">
      <TubeVisual tube={TUBE_CATALOG[1]} count={0} />
      <TubeVisual tube={TUBE_CATALOG[3]} count={2} />
      <TubeVisual tube={TUBE_CATALOG[4]} count={1} status="collected" />
      <TubeVisual tube={TUBE_CATALOG[6]} count={1} status="collected" needsInvert />
      <TubeVisual tube={TUBE_CATALOG[9]} count={1} status="deferred" focused />
    </div>
  ),
}

export const ToneCatalog: Story = {
  render: () => (
    <div className="grid w-[min(760px,calc(100vw-3rem))] grid-cols-2 gap-3 sm:grid-cols-5">
      {TUBE_CATALOG.map((tube) => (
        <SectionCard key={tube.key} padding="sm" className="flex items-center gap-2">
          <TubeDot tube={tube} />
          <span className="text-k-xs font-bold text-[var(--ink-700)]">{tube.stopperLabel}</span>
        </SectionCard>
      ))}
    </div>
  ),
}
