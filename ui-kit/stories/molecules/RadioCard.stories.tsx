import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from '@/components/atoms/icon.tsx'
import { RadioCard } from '@/components/molecules/radio-card.tsx'
import { RadioGroup } from '@/components/ui/radio-group.tsx'

const meta = {
  title: 'Molecules/RadioCard',
  component: RadioCard,
  tags: ['autodocs', 'module:receptionist', 'module:phlebo', 'module:patient'],
  args: {
    value: 'demo',
    label: 'Direct pay',
    icon: <Icon name="tabler:credit-card" size={18} />,
    layout: 'tile',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RadioCard>

export default meta
type Story = StoryObj<typeof meta>

export const Tile: Story = {
  name: 'Tile layout (Step 6 Payer)',
  render: () => (
    <RadioGroup defaultValue="direct" className="grid w-[600px] grid-cols-2 gap-3">
      <RadioCard
        value="direct"
        icon={<Icon name="tabler:credit-card" size={18} />}
        label="Direct pay"
        caption="Patient pays at counter"
      />
      <RadioCard
        value="insurance"
        icon={<Icon name="tabler:shield" size={18} />}
        label="Insurance"
        caption="Forte · $5 co-pay"
      />
      <RadioCard
        value="corporate"
        icon={<Icon name="tabler:building" size={18} />}
        label="Corporate"
        caption="Bill to employer"
      />
      <RadioCard
        value="referral"
        icon={<Icon name="tabler:send" size={18} />}
        label="Referral"
        caption="Linked to referring clinic"
      />
    </RadioGroup>
  ),
}

export const PillMethod: Story = {
  name: 'Pill layout (Step 6 Method)',
  render: () => (
    <RadioGroup defaultValue="khqr" className="grid w-[600px] grid-cols-3 gap-3">
      <RadioCard
        value="cash"
        layout="pill"
        icon={<Icon name="tabler:cash" size={16} />}
        label="Cash"
        hideRadioControl
      />
      <RadioCard
        value="card"
        layout="pill"
        icon={<Icon name="tabler:credit-card" size={16} />}
        label="Card"
        hideRadioControl
      />
      <RadioCard
        value="khqr"
        layout="pill"
        icon={<Icon name="tabler:qrcode" size={16} />}
        label="KHQR"
        hideRadioControl
      />
    </RadioGroup>
  ),
}

export const PillContactChannels: Story = {
  name: 'Pill layout (Step 2 contact channels)',
  render: () => (
    <RadioGroup defaultValue="telegram" className="grid w-[400px] grid-cols-2 gap-2">
      <RadioCard
        value="telegram"
        layout="pill"
        icon={<Icon name="tabler:brand-telegram" size={16} />}
        label="Telegram"
        hideRadioControl
      />
      <RadioCard
        value="sms"
        layout="pill"
        icon={<Icon name="tabler:message" size={16} />}
        label="SMS"
        hideRadioControl
      />
    </RadioGroup>
  ),
}

export const TileWithoutCaption: Story = {
  render: () => (
    <RadioGroup defaultValue="a" className="grid w-[400px] grid-cols-2 gap-3">
      <RadioCard value="a" icon={<Icon name="tabler:check" size={18} />} label="Option A" />
      <RadioCard value="b" icon={<Icon name="tabler:x" size={18} />} label="Option B" />
    </RadioGroup>
  ),
}

export const Playground: Story = {
  args: {
    value: 'demo',
    label: 'Direct pay',
    caption: 'Patient pays at counter',
    layout: 'tile',
    hideRadioControl: false,
  },
  argTypes: {
    layout: { control: 'inline-radio', options: ['tile', 'pill'] },
    hideRadioControl: { control: 'boolean' },
  },
  render: (args) => (
    <RadioGroup defaultValue="demo" className="w-[280px]">
      <RadioCard {...args} />
    </RadioGroup>
  ),
}
