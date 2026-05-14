import type { Meta, StoryObj } from '@storybook/react-vite'

import { QueuePickList } from '@/components/organisms/queue-pick-list.tsx'
import { ScanGatePanel } from '@/components/organisms/scan-gate-panel.tsx'
import { PHLEBO_QUEUE } from '../phlebo/_fixtures/phlebo.ts'

const queue = (
  <QueuePickList
    items={PHLEBO_QUEUE.slice(0, 5).map((patient) => ({
      id: patient.id,
      initials: patient.initials,
      title: patient.name,
      meta: `${patient.pid} / ${patient.checkInAt} / ${patient.waitingMinutes} min`,
    }))}
  />
)

const meta = {
  title: 'Organisms/ScanGatePanel',
  component: ScanGatePanel,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'fullscreen' },
  args: {
    icon: 'tabler:heart',
    iconTone: 'info',
    title: 'Scan patient barcode',
    description: 'Hand-scan the printed bill or type the Patient ID.',
    queueLabel: 'Browse queue',
    queueCount: 8,
    queue,
  },
} satisfies Meta<typeof ScanGatePanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    defaultQueueOpen: true,
  },
}

export const States: Story = {
  render: () => (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <ScanGatePanel
        icon="tabler:heart"
        iconTone="info"
        title="Scan patient barcode"
        description="Hand-scan the printed bill or type the Patient ID."
        queueLabel="Browse queue"
        queueCount={8}
        queue={queue}
      />
      <ScanGatePanel
        icon="tabler:flask"
        iconTone="brand"
        title="Scan patient barcode"
        description="Hand-scan the printed bill or type the Patient ID."
        queueLabel="Browse queue"
        queueCount={14}
        defaultQueueOpen
        queue={queue}
      />
    </div>
  ),
}

export const InspectorScenario: Story = {
  args: {
    icon: 'tabler:scan',
    iconTone: 'brand',
    title: 'Tube Inspector',
    description: 'Scan any tube barcode to inspect its spec, status, and handling instructions.',
    scanLabel: 'Sample ID',
    scanPlaceholder: 'Scan or type sample ID',
    queueLabel: 'Pick from queue',
    defaultQueueOpen: true,
  },
}
