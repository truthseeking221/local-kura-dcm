import type { Meta, StoryObj } from '@storybook/react-vite'

import { QueuePickList } from '@/components/organisms/queue-pick-list.tsx'
import { PHLEBO_QUEUE } from '../phlebo/_fixtures/phlebo.ts'

const items = PHLEBO_QUEUE.slice(0, 4).map((patient) => ({
  id: patient.id,
  initials: patient.initials,
  title: patient.name,
  meta: `${patient.pid} / ${patient.checkInAt} / ${patient.waitingMinutes} min`,
}))

const meta = {
  title: 'Organisms/QueuePickList',
  component: QueuePickList,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
  args: { items },
} satisfies Meta<typeof QueuePickList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-[min(420px,calc(100vw-3rem))]">
      <QueuePickList {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: { items: PHLEBO_QUEUE.slice(0, 6).map((patient) => ({
    id: patient.id,
    initials: patient.initials,
    title: patient.name,
    meta: `${patient.pid} / ${patient.checkInAt} / ${patient.waitingMinutes} min`,
  })) },
  render: Default.render,
}

export const States: Story = {
  render: () => (
    <div className="grid w-[min(420px,calc(100vw-3rem))] gap-4">
      <QueuePickList items={items.slice(0, 2)} />
      <QueuePickList items={items.map((item) => ({ ...item, initials: undefined }))} />
    </div>
  ),
}

export const PhleboQueueScenario: Story = Default
