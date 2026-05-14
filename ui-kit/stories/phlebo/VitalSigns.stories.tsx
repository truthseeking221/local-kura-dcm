import type { Meta, StoryObj } from '@storybook/react-vite'

import { MAYA, SOPHAN } from './_fixtures/phlebo.ts'
import { VitalSignsWorkspace } from './_components/workflows.tsx'

const meta: Meta = {
  title: 'Phlebo/Vital Signs',
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const PendingPatient: Story = {
  name: 'Record vital signs - pending patient',
  render: () => <VitalSignsWorkspace patient={MAYA} />,
}

export const WithPriorVitals: Story = {
  name: 'Record vital signs - returning values',
  render: () => <VitalSignsWorkspace patient={SOPHAN} />,
}
