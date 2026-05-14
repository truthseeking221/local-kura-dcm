import type { Meta, StoryObj } from '@storybook/react-vite'

import { MAYA } from './_fixtures/phlebo.ts'
import { DeferSampleDialog } from './_components/workflows.tsx'

const meta: Meta = {
  title: 'Phlebo/Modals',
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

export const DeferSample: Story = {
  render: () => <DeferSampleDialog sample={MAYA.samples[0]} />,
}
