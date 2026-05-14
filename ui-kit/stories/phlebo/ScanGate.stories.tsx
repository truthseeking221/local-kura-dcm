import type { Meta, StoryObj } from '@storybook/react-vite'

import { PhleboBoothShell } from './_components/booth-shell.tsx'
import { PhleboScanGate } from './_components/scan-gate.tsx'
import { queueForSection } from './_fixtures/phlebo.ts'

const meta: Meta = {
  title: 'Phlebo/Scan Gate',
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const VitalSignsEmpty: Story = {
  name: 'Vital Signs - scan patient',
  render: () => (
    <PhleboBoothShell active="vitals" queueCount={queueForSection('vitals').length}>
      <PhleboScanGate section="vitals" queue={queueForSection('vitals')} />
    </PhleboBoothShell>
  ),
}

export const VitalSignsBrowseQueue: Story = {
  name: 'Vital Signs - browse queue',
  render: () => (
    <PhleboBoothShell active="vitals" queueCount={queueForSection('vitals').length}>
      <PhleboScanGate section="vitals" queue={queueForSection('vitals')} defaultQueueOpen />
    </PhleboBoothShell>
  ),
}

export const PhlebotomyEmpty: Story = {
  name: 'Phlebotomy - scan patient',
  render: () => (
    <PhleboBoothShell active="phlebotomy" queueCount={queueForSection('phlebotomy').length}>
      <PhleboScanGate section="phlebotomy" queue={queueForSection('phlebotomy')} />
    </PhleboBoothShell>
  ),
}

export const PhlebotomyBrowseQueue: Story = {
  name: 'Phlebotomy - browse queue',
  render: () => (
    <PhleboBoothShell active="phlebotomy" queueCount={queueForSection('phlebotomy').length}>
      <PhleboScanGate section="phlebotomy" queue={queueForSection('phlebotomy')} defaultQueueOpen />
    </PhleboBoothShell>
  ),
}
