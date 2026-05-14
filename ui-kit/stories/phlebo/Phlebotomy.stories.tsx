import type { Meta, StoryObj } from '@storybook/react-vite'

import { MAYA, SOPHAN, VUTHY } from './_fixtures/phlebo.ts'
import { CollectionCompleteVariant, PhlebotomyWorkspace } from './_components/workflows.tsx'

const meta: Meta = {
  title: 'Phlebo/Phlebotomy',
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const NeedsVitalsBeforeDraw: Story = {
  name: 'Collection workspace - vitals missing',
  render: () => <PhlebotomyWorkspace patient={MAYA} focusedSample={MAYA.samples[0]} />,
}

export const ReadyWithVitals: Story = {
  name: 'Collection workspace - ready with vitals',
  render: () => <PhlebotomyWorkspace patient={SOPHAN} focusedSample={SOPHAN.samples[0]} />,
}

export const StatTubeNeedsInversion: Story = {
  name: 'Collection workspace - collected tube needs inversion',
  render: () => <PhlebotomyWorkspace patient={VUTHY} focusedSample={VUTHY.samples[0]} />,
}

export const CollectionComplete: Story = {
  name: 'Collection workspace - complete',
  render: () => <CollectionCompleteVariant patient={SOPHAN} />,
}
