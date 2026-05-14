import type { Meta, StoryObj } from '@storybook/react-vite'
import { Activity, Clock, Info, Search } from 'lucide-react'

import { InfoSection } from '@/components/molecules/info-section.tsx'

const meta: Meta<typeof InfoSection> = {
  title: 'Molecules/InfoSection',
  component: InfoSection,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof InfoSection>

export const Default: Story = {
  args: {
    icon: <Info />,
    label: 'What it measures',
    children:
      'A complete blood count evaluates red cells, white cells, and platelets to screen for anemia, infection, and clotting issues.',
  },
  render: (args) => (
    <div className="w-[440px] rounded-[var(--radius-sm)] bg-[var(--status-info-bg)] p-4 text-[var(--status-info-fg)]">
      <InfoSection {...args} />
    </div>
  ),
}

export const Stacked: Story = {
  render: () => (
    <div className="w-[480px] space-y-3 rounded-[var(--radius-sm)] bg-[var(--status-info-bg)] p-4 text-[var(--status-info-fg)]">
      <InfoSection icon={<Info />} label="What it measures">
        A complete blood count evaluates red cells, white cells, and platelets
        to screen for anemia, infection, and clotting issues.
      </InfoSection>
      <InfoSection icon={<Search />} label="Looks for">
        Anemia, infection, leukocytosis, thrombocytopenia, and other marrow
        production abnormalities.
      </InfoSection>
      <InfoSection icon={<Activity />} label="What you'll do">
        Single venous blood draw, ~3 mL. No fasting required.
      </InfoSection>
      <InfoSection icon={<Clock />} label="Results by">
        Same day, typically within 2 hours of draw.
      </InfoSection>
    </div>
  ),
}

export const Playground: Story = {
  args: {
    icon: <Info />,
    label: 'What it measures',
    children: 'Body paragraph content goes here.',
  },
  render: (args) => (
    <div className="w-[440px] rounded-[var(--radius-sm)] bg-[var(--status-info-bg)] p-4 text-[var(--status-info-fg)]">
      <InfoSection {...args} />
    </div>
  ),
}
