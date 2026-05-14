import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconChoiceCard } from '@/components/molecules/icon-choice-card.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
import { Kbd } from '@/components/atoms/kbd.tsx'
const meta = {
  title: 'Molecules/IconChoiceCard',
  component: IconChoiceCard,
  tags: ['autodocs'],
  args: {
    icon: <Icon name="tabler:qr-code" />,
    title: 'Scan QR',
    description: 'Use the desktop scanner to capture a Kura QR code.',
    comingSoon: false,
  },
  argTypes: {
    icon: {
      control: 'select',
      options: ['qr', 'card', 'keyboard', 'stethoscope', 'syringe', 'sparkles'],
      mapping: {
        qr: <Icon name="tabler:qr-code" />,
        card: <Icon name="tabler:credit-card" />,
        keyboard: <Icon name="tabler:keyboard" />,
        stethoscope: <Icon name="tabler:stethoscope" />,
        syringe: <Icon name="tabler:syringe" />,
        sparkles: <Icon name="tabler:sparkles" />,
      },
    },
    title: { control: 'text' },
    description: { control: 'text' },
    comingSoon: { control: 'boolean' },
    cta: { control: 'text' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof IconChoiceCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <IconChoiceCard {...args} onClick={() => {}} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    icon: <Icon name="tabler:qr-code" />,
    title: 'Scan QR',
    description: 'Use the desktop scanner to capture a Kura QR code.',
  },
  render: (args) => (
    <div className="w-72">
      <IconChoiceCard {...args} onClick={() => {}} />
    </div>
  ),
}

export const ComingSoon: Story = {
  args: {
    icon: <Icon name="tabler:credit-card" />,
    title: 'Insert ID card',
    description: 'Read patient details directly from a national ID card.',
    comingSoon: true,
  },
  render: (args) => (
    <div className="w-72">
      <IconChoiceCard {...args} />
    </div>
  ),
}

export const GridOf3: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid w-[840px] grid-cols-3 gap-4">
      <IconChoiceCard
        icon={<Icon name="tabler:qr-code" />}
        title="Scan QR"
        description="Use the desktop scanner to capture a Kura QR code."
        onClick={() => {}}
      />
      <IconChoiceCard
        icon={<Icon name="tabler:credit-card" />}
        title="Insert ID card"
        description="Read patient details directly from a national ID card."
        comingSoon
      />
      <IconChoiceCard
        icon={<Icon name="tabler:keyboard" />}
        title="Enter manually"
        description="Type the patient's details to start the visit."
        onClick={() => {}}
      />
    </div>
  ),
}

export const WithShortcut: Story = {
  name: 'Trailing Kbd (Step 1 capture cards)',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid w-[840px] grid-cols-3 gap-4">
      <IconChoiceCard
        icon={<Icon name="tabler:qr-code" />}
        title="Scan QR / national ID"
        description="Auto-fills name, DOB, sex, ID. Locks fields after capture."
        onClick={() => {}}
        trailing={<Kbd>F2</Kbd>}
      />
      <IconChoiceCard
        icon={<Icon name="tabler:credit-card" />}
        title="NFC chip read"
        description="Tap a chipped national ID. Reader hardware required."
        comingSoon
        trailing={null}
      />
      <IconChoiceCard
        icon={<Icon name="tabler:keyboard" />}
        title="Manual entry"
        description="Skip scanning. Fill name + DOB + sex on Step 2."
        onClick={() => {}}
        trailing={<Kbd>F4</Kbd>}
      />
    </div>
  ),
}

export const GridOf4: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid w-[1080px] grid-cols-4 gap-4">
      <IconChoiceCard
        icon={<Icon name="tabler:qr-code" />}
        title="Scan QR"
        description="Capture a Kura QR code."
        onClick={() => {}}
      />
      <IconChoiceCard
        icon={<Icon name="tabler:credit-card" />}
        title="Insert ID card"
        description="Read national ID."
        comingSoon
      />
      <IconChoiceCard
        icon={<Icon name="tabler:stethoscope" />}
        title="From referral"
        description="Continue from an existing referral."
        onClick={() => {}}
      />
      <IconChoiceCard
        icon={<Icon name="tabler:keyboard" />}
        title="Enter manually"
        description="Type the patient's details to start."
        onClick={() => {}}
      />
    </div>
  ),
}
