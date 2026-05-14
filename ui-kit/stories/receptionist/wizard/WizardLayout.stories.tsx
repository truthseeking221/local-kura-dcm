import type { Meta, StoryObj } from '@storybook/react-vite'

import { MetaPill } from '@/components/atoms/meta-pill.tsx'
import { SectionCard } from '@/components/molecules/section-card.tsx'
import { StatusPill } from '@/components/molecules/status-pill.tsx'
import { WizardStepBody } from '@/components/molecules/wizard-step-body.tsx'
import { Stepper, type StepperStep } from '@/components/organisms/stepper.tsx'
import { SubjectHeader } from '@/components/organisms/subject-header.tsx'
import { WizardLayout } from '@/components/organisms/wizard-layout.tsx'
import { WizardStepFooter } from '@/components/organisms/wizard-step-footer.tsx'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx'

import {
  OrderCart,
  type OrderCartGroup,
} from '@/components/organisms/order-cart.tsx'

const meta: Meta<typeof WizardLayout> = {
  title: 'Receptionist/Wizard/WizardLayout',
  component: WizardLayout,
  tags: ['autodocs', 'module:receptionist', 'module:phlebo'],
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'n/a — extracted from WizardShell.stories.tsx Shell (lines 563–611)',
    },
  },
}
export default meta

type Story = StoryObj<typeof WizardLayout>

const STEPS: StepperStep[] = [
  { label: 'Identity', status: 'active' },
  { label: 'Patient', status: 'locked' },
  { label: 'Insurance', status: 'locked' },
  { label: 'Orders', status: 'locked' },
  { label: 'Pre & post consult', status: 'locked' },
  { label: 'Payment', status: 'locked' },
]

const SAMPLE_CART_GROUPS: OrderCartGroup[] = [
  {
    key: 'lab',
    label: 'Lab tests',
    count: 2,
    subtotalText: '$15.00',
    items: [
      { id: 'cbc', kind: 'lab', name: 'CBC', priceText: '$7.00' },
      { id: 'glucose', kind: 'lab', name: 'Fasting glucose', priceText: '$8.00' },
    ],
  },
]

function SubjectSlot() {
  return (
    <SubjectHeader
      avatar={
        <Avatar className="size-12">
          <AvatarFallback>SD</AvatarFallback>
        </Avatar>
      }
      title="Sok Dara"
      pills={
        <>
          <MetaPill className="font-mono tabular-nums">A-014</MetaPill>
          <MetaPill>34 · F</MetaPill>
        </>
      }
      status={<StatusPill tone="success">Ready to check in</StatusPill>}
    />
  )
}

function CartSlot() {
  return (
    <OrderCart
      itemCount={2}
      groups={SAMPLE_CART_GROUPS}
      patientPaysText="$15.00"
      stillNeeded={['Take payment in Step 6 or mark pay-later']}
    />
  )
}

function StepBody() {
  return (
    <WizardStepBody
      title="Capture identity"
      subtitle="Find a returning patient or pick a capture method."
    >
      <SectionCard padding="lg">
        <div className="text-sm text-muted-foreground">Step content goes here.</div>
      </SectionCard>
    </WizardStepBody>
  )
}

export const Default: Story = {
  render: () => (
    <div className="h-screen">
      <WizardLayout
        header={<SubjectSlot />}
        stepper={<Stepper steps={STEPS} />}
        aside={<CartSlot />}
        footer={
          <WizardStepFooter
            blockerLabel="Capture identity to continue"
            continueDisabled
            hideBack
          />
        }
      >
        <StepBody />
      </WizardLayout>
    </div>
  ),
}

export const NoAside: Story = {
  render: () => (
    <div className="h-screen">
      <WizardLayout
        header={<SubjectSlot />}
        stepper={<Stepper steps={STEPS} />}
        footer={<WizardStepFooter />}
      >
        <StepBody />
      </WizardLayout>
    </div>
  ),
}

export const NoFooter: Story = {
  render: () => (
    <div className="h-screen">
      <WizardLayout
        header={<SubjectSlot />}
        stepper={<Stepper steps={STEPS} />}
        aside={<CartSlot />}
      >
        <StepBody />
      </WizardLayout>
    </div>
  ),
}

export const Playground: Story = Default
