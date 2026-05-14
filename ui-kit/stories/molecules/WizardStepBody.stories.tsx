import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from '@/components/atoms/icon.tsx'
import { WizardStepBody } from '@/components/molecules/wizard-step-body.tsx'
import { Button } from '@/components/ui/button.tsx'

const meta: Meta<typeof WizardStepBody> = {
  title: 'Molecules/WizardStepBody',
  component: WizardStepBody,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof WizardStepBody>

function SampleSection({ label }: { label: string }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
    </section>
  )
}

export const Default: Story = {
  args: {
    children: (
      <>
        <SampleSection label="Body content section 1" />
        <SampleSection label="Body content section 2" />
      </>
    ),
  },
}

export const WithTitleAndSubtitle: Story = {
  args: {
    title: 'Capture identity',
    subtitle: 'Find a returning patient or pick a capture method.',
    children: <SampleSection label="Step body content" />,
  },
}

export const WithActions: Story = {
  args: {
    title: 'Review patient details',
    subtitle: 'Confirm captured fields and add the rest. Locked fields require unlock.',
    actions: (
      <Button variant="outline" size="sm" className="gap-1.5">
        <Icon name="tabler:lock" size={12} />
        Unlock fields
      </Button>
    ),
    children: (
      <>
        <SampleSection label="Identity form" />
        <SampleSection label="Address form" />
        <SampleSection label="Contact channels" />
      </>
    ),
  },
}

export const LongScrollableBody: Story = {
  args: {
    title: 'Long step',
    subtitle: 'Many sections; verify vertical rhythm.',
    children: Array.from({ length: 8 }, (_, i) => (
      <SampleSection key={i} label={`Section ${i + 1}`} />
    )),
  },
}

export const Playground: Story = { args: WithActions.args }
