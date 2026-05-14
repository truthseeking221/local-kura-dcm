import type { Meta, StoryObj } from '@storybook/react-vite'

import { DerivedValueField } from '@/components/molecules/derived-value-field.tsx'

const meta = {
  title: 'Molecules/DerivedValueField',
  component: DerivedValueField,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
  args: {
    label: 'BMI',
    hint: 'auto',
    unit: 'kg/m²',
  },
} satisfies Meta<typeof DerivedValueField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <DerivedValueField {...args} />
    </div>
  ),
}

export const Filled: Story = {
  args: {
    value: 22.4,
  },
  render: (args) => (
    <div className="w-72">
      <DerivedValueField {...args} />
    </div>
  ),
}

export const WithoutUnit: Story = {
  args: {
    label: 'Estimated Age',
    hint: 'computed',
    value: 47,
    unit: undefined,
  },
  render: (args) => (
    <div className="w-72">
      <DerivedValueField {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    label: 'BMI',
    hint: 'auto',
    value: undefined,
    placeholder: '—',
    unit: 'kg/m²',
  },
  render: (args) => (
    <div className="w-72">
      <DerivedValueField {...args} />
    </div>
  ),
}
