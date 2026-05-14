import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/components/ui/label.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'

const meta = {
  title: 'Atoms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    placeholder: 'Chronic conditions, past surgeries…',
    rows: 3,
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-96">
      <Textarea {...args} />
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-96 space-y-1.5">
      <Label htmlFor="chief-complaint">Chief complaint</Label>
      <Textarea id="chief-complaint" placeholder="e.g. Headache for 3 days" rows={3} />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="grid w-96 gap-4">
      <Textarea placeholder="Default" />
      <Textarea defaultValue="Patient reports intermittent chest pain over the last 48 hours, worse on exertion." />
      <Textarea disabled placeholder="Disabled" />
      <Textarea aria-invalid defaultValue="??" />
    </div>
  ),
}
