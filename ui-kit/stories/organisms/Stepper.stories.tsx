import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ReactNode, useState } from 'react'

import { Kbd } from '@/components/atoms/kbd.tsx'
import { Stepper, type StepperStep } from '@/components/organisms/stepper.tsx'

const meta: Meta = {
  title: 'Organisms/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

const WIZARD_LABELS = [
  'Identity',
  'Patient',
  'Insurance',
  'Orders',
  'Pre & post consult',
  'Payment',
] as const

function ShortcutHint() {
  return (
    <span className="inline-flex items-center gap-[5px]">
      <Kbd className="h-4 min-w-0 bg-[var(--surface-2)] px-[5px] text-[10.5px]">
        F1-F6
      </Kbd>
      <span>steps</span>
    </span>
  )
}

function StepperBand({ children }: { children: ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-3.5">
        {children}
      </div>
    </div>
  )
}

export const NewVisitWizard: Story = {
  render: () => {
    const [active, setActive] = useState(0)
    const steps: StepperStep[] = WIZARD_LABELS.map((label, index) => ({
      label,
      status: index < active ? 'done' : index === active ? 'active' : 'locked',
    }))
    return (
      <div className="w-full">
        <StepperBand>
          <Stepper steps={steps} onStepClick={(i) => setActive(i)} shortcutHint={<ShortcutHint />} />
        </StepperBand>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Click a done or active step to jump.
        </p>
      </div>
    )
  },
}

export const MidFlow: Story = {
  render: () => {
    const [active, setActive] = useState(2)
    const steps: StepperStep[] = WIZARD_LABELS.map((label, index) => ({
      label,
      status: index < active ? 'done' : index === active ? 'active' : 'locked',
    }))
    return (
      <div className="w-full">
        <StepperBand>
          <Stepper steps={steps} onStepClick={(i) => setActive(i)} shortcutHint={<ShortcutHint />} />
        </StepperBand>
      </div>
    )
  },
}

export const DensePreview: Story = {
  render: () => (
    <div className="w-full max-w-[1220px]">
      <StepperBand>
        <Stepper
          steps={WIZARD_LABELS.map((label, index) => ({
            label,
            status: index === 0 ? 'active' : 'locked',
          }))}
          shortcutHint={<ShortcutHint />}
        />
      </StepperBand>
    </div>
  ),
}

export const AllDone: Story = {
  render: () => (
    <div className="w-full">
      <StepperBand>
        <Stepper
          steps={WIZARD_LABELS.map((label) => ({ label, status: 'done' }))}
          shortcutHint={<ShortcutHint />}
        />
      </StepperBand>
    </div>
  ),
}

export const FirstStep: Story = {
  render: () => (
    <div className="w-full">
      <StepperBand>
        <Stepper
          steps={WIZARD_LABELS.map((label, index) => ({
            label,
            status: index === 0 ? 'active' : 'locked',
          }))}
          shortcutHint={<ShortcutHint />}
        />
      </StepperBand>
    </div>
  ),
}

export const Compact: Story = {
  render: () => (
    <div className="w-[520px]">
      <StepperBand>
        <Stepper
          steps={[
            { label: 'Capture', status: 'done' },
            { label: 'Verify', status: 'done' },
            { label: 'Pay', status: 'active' },
            { label: 'Done', status: 'locked' },
          ]}
          shortcutHint={<ShortcutHint />}
        />
      </StepperBand>
    </div>
  ),
}
