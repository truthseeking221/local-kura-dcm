import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClinicalNumberField } from '@/components/molecules/clinical-number-field.tsx'

const meta = {
  title: 'Molecules/ClinicalNumberField',
  component: ClinicalNumberField,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
  args: {
    label: 'Heart Rate',
    range: '30-250 bpm',
    unit: 'bpm',
    required: true,
  },
} satisfies Meta<typeof ClinicalNumberField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-[min(320px,calc(100vw-3rem))]">
      <ClinicalNumberField {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    defaultValue: 84,
    helperText: 'Within expected range',
    state: 'success',
  },
  render: Default.render,
}

export const States: Story = {
  render: () => (
    <div className="grid w-[min(360px,calc(100vw-3rem))] gap-4">
      <ClinicalNumberField label="Height" range="50-250 cm" unit="cm" required />
      <ClinicalNumberField label="Temperature" range="34-42 C" unit="C" defaultValue={37.8} state="warning" helperText="Review before submit" />
      <ClinicalNumberField label="SpO2" range="85-100%" unit="%" defaultValue={82} state="danger" helperText="Outside expected range" />
      <ClinicalNumberField label="Weight" range="1-300 kg" unit="kg" disabled helperText="Locked by completed vitals" />
    </div>
  ),
}

export const ClinicalScenario: Story = {
  render: () => (
    <div className="grid w-[min(760px,calc(100vw-3rem))] gap-4 md:grid-cols-3">
      <ClinicalNumberField label="Heart Rate" range="30-250 bpm" unit="bpm" required defaultValue={84} />
      <ClinicalNumberField label="Temperature" range="34-42 C" unit="C" defaultValue={37.1} />
      <ClinicalNumberField label="Breathing rate" range="8-35 /min" unit="/min" defaultValue={16} />
    </div>
  ),
}
