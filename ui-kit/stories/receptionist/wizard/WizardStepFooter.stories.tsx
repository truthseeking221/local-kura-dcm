import type { Meta, StoryObj } from '@storybook/react-vite'

import { WizardStepFooter } from '@/components/organisms/wizard-step-footer.tsx'

const meta: Meta<typeof WizardStepFooter> = {
  title: 'Receptionist/Wizard/WizardStepFooter',
  component: WizardStepFooter,
  tags: ['autodocs', 'module:receptionist', 'module:phlebo'],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-[var(--bg)] p-20">
        <div className="max-w-[952px]">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'n/a — extracted from WizardShell.stories.tsx StepFooter (lines 287–318)',
    },
  },
}
export default meta

type Story = StoryObj<typeof WizardStepFooter>

export const Default: Story = {
  args: {
    continueDisabled: true,
    blockerLabel: 'Full name required',
  },
}

export const FirstStep: Story = { args: { hideBack: true } }

export const LastStep: Story = {
  args: { continueLabel: 'Check in' },
}

export const Blocked: Story = {
  args: {
    continueDisabled: true,
    blockerLabel: 'Full name required',
  },
}

export const Playground: Story = { args: {} }
