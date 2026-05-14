import type { Meta, StoryObj } from '@storybook/react-vite'

import { MAYA, VUTHY } from './_fixtures/phlebo.ts'
import {
  TubeInspectorCollectedDetail,
  TubeInspectorFound,
  TubeInspectorScan,
} from './_components/workflows.tsx'

const meta: Meta = {
  title: 'Phlebo/Tube Inspector',
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const ScanAnyTube: Story = {
  name: 'Inspector - scan or pick sample',
  render: () => <TubeInspectorScan />,
}

export const PendingSample: Story = {
  name: 'Inspector - pending sample detail',
  render: () => <TubeInspectorFound patient={MAYA} sample={MAYA.samples[0]} />,
}

export const CollectedSample: Story = {
  name: 'Inspector - collected sample detail',
  render: () => <TubeInspectorCollectedDetail patient={VUTHY} />,
}
