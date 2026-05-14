import type { Meta, StoryObj } from '@storybook/react-vite'

import { JourneyList } from '@/components/molecules/journey-list.tsx'

const steps = [
  { id: 'identity', label: 'Identity', icon: 'tabler:shield-check', status: 'done' as const },
  { id: 'vitals', label: 'Vital Signs', icon: 'tabler:heart', status: 'pending' as const },
  { id: 'phlebotomy', label: 'Phlebotomy', icon: 'tabler:flask', status: 'waiting' as const },
]

const meta = {
  title: 'Molecules/JourneyList',
  component: JourneyList,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
  args: { steps, currentStep: 'vitals' },
} satisfies Meta<typeof JourneyList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-[min(340px,calc(100vw-3rem))]">
      <JourneyList {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    currentStep: 'phlebotomy',
  },
  render: Default.render,
}

export const States: Story = {
  render: () => (
    <div className="w-[min(340px,calc(100vw-3rem))]">
      <JourneyList
        currentStep="phlebotomy"
        steps={[
          { id: 'identity', label: 'Identity', icon: 'tabler:shield-check', status: 'done' },
          { id: 'vitals', label: 'Vital Signs', icon: 'tabler:heart', status: 'skipped' },
          { id: 'phlebotomy', label: 'Phlebotomy', icon: 'tabler:flask', status: 'pending' },
        ]}
      />
    </div>
  ),
}

export const PhleboScenario: Story = Default
