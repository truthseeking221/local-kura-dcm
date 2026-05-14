import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from '@/components/atoms/icon.tsx'
import { Banner } from '@/components/molecules/banner.tsx'
import { DataPoint } from '@/components/molecules/data-point.tsx'
import { IconBadge } from '@/components/molecules/icon-badge.tsx'
import { SectionCard } from '@/components/molecules/section-card.tsx'
import { StatusPill } from '@/components/molecules/status-pill.tsx'
import { WizardStepBody } from '@/components/molecules/wizard-step-body.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Separator } from '@/components/ui/separator.tsx'

import { CAPTURED_PATIENT, EMPTY_CART_PATIENT } from '../../_fixtures/patient.ts'

import { StepShell } from './_scaffold.tsx'

const meta: Meta = {
  title: 'Receptionist/Wizard/Steps/Step3 Insurance',
  tags: ['autodocs', 'module:receptionist'],
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

function Step3WithPolicyBody() {
  return (
    <WizardStepBody
      title="Insurance"
      subtitle="Verify policy + check eligibility before pricing the cart."
      actions={
        <Button variant="outline" size="sm">
          <Icon name="tabler:plus" /> Add policy
        </Button>
      }
    >
      <SectionCard padding="lg">
        <div className="flex items-start gap-4">
          <IconBadge tone="brand" size="lg">
            <Icon name="tabler:building" />
          </IconBadge>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold">Forte Insurance</span>
              <StatusPill tone="success">Eligible</StatusPill>
            </div>
            <p className="text-xs text-muted-foreground">Last verified · 08:21 · supervisor LN</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Icon name="tabler:refresh" size={12} /> Re-verify
          </Button>
        </div>
        <Separator className="my-4" />
        <dl className="grid grid-cols-4 gap-x-6 gap-y-4">
          <DataPoint label="Member ID">FRT-887200119</DataPoint>
          <DataPoint label="Group">CORP-90021</DataPoint>
          <DataPoint label="Coverage">Outpatient · 80%</DataPoint>
          <DataPoint label="Co-pay">$5</DataPoint>
          <DataPoint label="Active until">12/2027</DataPoint>
          <DataPoint label="Pre-auth">Not required</DataPoint>
          <DataPoint label="Tier">Gold</DataPoint>
          <DataPoint label="Effective">01/2024</DataPoint>
        </dl>
      </SectionCard>

      <Banner tone="success" title="$5 co-pay applies" icon={<Icon name="tabler:shield-check" />}>
        Insurance covers 80% of all in-cart tests. Direct-pay portion is auto-calculated and shown
        in the cart rail.
      </Banner>
    </WizardStepBody>
  )
}

function Step3DirectPayBody() {
  return (
    <WizardStepBody
      title="Insurance"
      subtitle="Add a policy to bill insurance, or continue as direct pay."
    >
      <SectionCard padding="lg" className="py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <IconBadge tone="neutral" size="lg">
            <Icon name="tabler:shield" />
          </IconBadge>
          <h3 className="text-base font-semibold">No insurance on file</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Add a policy now to bill insurance, scan a card, or continue as direct pay.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline">
              <Icon name="tabler:plus" />
              Add policy
            </Button>
            <Button variant="outline">
              <Icon name="tabler:camera" />
              Scan card
            </Button>
            <Button>Continue without insurance</Button>
          </div>
        </div>
      </SectionCard>
    </WizardStepBody>
  )
}

export const WithPolicy: Story = {
  name: 'Step 3 — Insurance · with policy',
  render: () => (
    <StepShell patient={CAPTURED_PATIENT} currentStep={3} doneThroughStep={2}>
      <Step3WithPolicyBody />
    </StepShell>
  ),
}

export const DirectPay: Story = {
  name: 'Step 3 — Insurance · empty',
  render: () => (
    <StepShell patient={CAPTURED_PATIENT} currentStep={3} doneThroughStep={2}>
      <Step3DirectPayBody />
    </StepShell>
  ),
}

export const DirectPayEmptyCart: Story = {
  name: 'Step 3 — Insurance · empty cart',
  render: () => (
    <StepShell patient={EMPTY_CART_PATIENT} currentStep={3} doneThroughStep={2}>
      <Step3DirectPayBody />
    </StepShell>
  ),
}
