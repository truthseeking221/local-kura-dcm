import type { Meta, StoryObj } from '@storybook/react-vite'
import { Activity, Clock, Info, Search } from 'lucide-react'

import { Callout } from '@/components/molecules/callout.tsx'
import { InfoSection } from '@/components/molecules/info-section.tsx'

const meta = {
  title: 'Molecules/Callout',
  component: Callout,
  tags: ['autodocs'],
  args: {
    tone: 'info',
    children: 'A short tone-tinted note explaining a small piece of context.',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
    },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Callout>

export default meta
type Story = StoryObj<typeof meta>

export const Info_: Story = {
  args: { tone: 'info' },
  render: (args) => (
    <div className="w-[440px]">
      <Callout {...args} />
    </div>
  ),
}

export const Success: Story = {
  args: { tone: 'success' },
  render: (args) => (
    <div className="w-[440px]">
      <Callout {...args} />
    </div>
  ),
}

export const Warning: Story = {
  args: { tone: 'warning' },
  render: (args) => (
    <div className="w-[440px]">
      <Callout {...args} />
    </div>
  ),
}

export const Danger: Story = {
  args: { tone: 'danger' },
  render: (args) => (
    <div className="w-[440px]">
      <Callout {...args} />
    </div>
  ),
}

export const WithInfoSections: Story = {
  render: () => (
    <div className="w-[480px]">
      <Callout tone="info">
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
      </Callout>
    </div>
  ),
}

export const Playground: Story = {
  args: {
    tone: 'info',
    children: 'Adjust the tone control to preview each variant.',
  },
  render: (args) => (
    <div className="w-[440px]">
      <Callout {...args} />
    </div>
  ),
}
