import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/components/ui/label.tsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx'

const meta = {
  title: 'Atoms/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="female" className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="female" id="r-female" />
        <Label htmlFor="r-female">Female</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="male" id="r-male" />
        <Label htmlFor="r-male">Male</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="other" id="r-other" />
        <Label htmlFor="r-other">Other</Label>
      </div>
    </RadioGroup>
  ),
}

export const WithQuestionLabel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Canonical 'labelled question' pattern: a `<Label>` with `text-k-sm font-semibold` above the radio group. " +
          'Used by Step 2 Patient → preferred contact channel. ' +
          'Prefer this over a bespoke `<QuestionLabel>` atom — `<Label>` + token-driven utility classes are sufficient.',
      },
    },
  },
  render: () => (
    <div className="w-80 space-y-2.5">
      <Label htmlFor="contact-channel" className="text-k-sm font-semibold text-[var(--ink-700)]">
        How does the patient prefer to be contacted?
      </Label>
      <RadioGroup id="contact-channel" defaultValue="telegram" className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="telegram" id="cc-telegram" />
          <Label htmlFor="cc-telegram">Telegram</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="sms" id="cc-sms" />
          <Label htmlFor="cc-sms">SMS</Label>
        </div>
      </RadioGroup>
    </div>
  ),
}
