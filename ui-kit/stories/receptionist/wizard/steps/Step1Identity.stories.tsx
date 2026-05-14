import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from '@/components/atoms/icon.tsx'
import { Kbd } from '@/components/atoms/kbd.tsx'
import { LabelSeparator } from '@/components/atoms/label-separator.tsx'
import { SectionLabel } from '@/components/atoms/section-label.tsx'
import { Banner } from '@/components/molecules/banner.tsx'
import { DataPoint } from '@/components/molecules/data-point.tsx'
import { IconBadge } from '@/components/molecules/icon-badge.tsx'
import { IconChoiceCard } from '@/components/molecules/icon-choice-card.tsx'
import { SearchInput } from '@/components/molecules/search-input.tsx'
import { SectionCard } from '@/components/molecules/section-card.tsx'
import { WizardStepBody } from '@/components/molecules/wizard-step-body.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'

import { BLANK_PATIENT, CAPTURED_PATIENT, type Patient } from '../../_fixtures/patient.ts'

import { StepShell } from './_scaffold.tsx'

const meta: Meta = {
  title: 'Receptionist/Wizard/Steps/Step1 Identity',
  tags: ['autodocs', 'module:receptionist'],
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

function Step1BlankBody() {
  return (
    <WizardStepBody
      title="Capture identity"
      subtitle="Find an existing patient, or capture identity with QR / NFC / manual entry."
    >
      <SectionCard padding="md">
        <SearchInput placeholder="Search by name, phone, national ID, or booking code" />
      </SectionCard>

      <div className="my-1">
        <LabelSeparator>Or capture new</LabelSeparator>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <IconChoiceCard
          icon={<Icon name="tabler:camera" />}
          title="Scan QR / national ID"
          description="Auto-fills name, DOB, sex, ID. Locks fields after capture."
          trailing={<Kbd>F2</Kbd>}
          onClick={() => undefined}
        />

        <IconChoiceCard
          icon={<Icon name="tabler:wifi" />}
          title="NFC chip read"
          description="Tap a chipped national ID. Reader hardware required."
          comingSoon
          trailing={null}
        />

        <IconChoiceCard
          icon={<Icon name="tabler:pencil" />}
          title="Manual entry"
          description="Skip scanning. Fill name + DOB + sex on Step 2."
          trailing={<Kbd>F4</Kbd>}
          onClick={() => undefined}
        />
      </div>

      <SectionCard padding="sm">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-[7px]">
            <Icon
              name="tabler:info"
              size={12}
              aria-hidden
              className="mt-0.5 shrink-0 text-[var(--brand-600)]"
            />
            <div className="flex flex-col">
              <span className="text-k-sm font-bold leading-k-snug text-[var(--ink-800)]">
                Booking / referral code
              </span>
              <p className="text-k-xs leading-k-base text-[var(--ink-500)]">
                Use this early when the patient brings a prescription, QR, or teleconsult summary.
                Orders are staged now and reviewed in Step 4.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              placeholder="BC-XXXXXXX-XXXX"
              className="h-[34px] flex-1 rounded-[var(--radius-sm)] border-[var(--ink-200)] text-k-sm placeholder:text-[var(--ink-500)]"
            />
            <button
              type="button"
              className="inline-flex h-[30px] items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--brand-200)] bg-[var(--surface)] px-3 text-k-sm font-semibold text-[var(--brand-700)] transition-colors hover:bg-[var(--brand-50)]"
            >
              <Icon name="tabler:check" size={14} />
              Check
            </button>
            <button
              type="button"
              className="inline-flex h-[30px] items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-transparent px-3 text-k-sm font-semibold text-[var(--ink-700)] transition-colors hover:bg-[var(--surface-2)]"
            >
              <Icon name="tabler:scan" size={14} />
              Scan booking code
            </button>
          </div>
        </div>
      </SectionCard>
    </WizardStepBody>
  )
}

function formatDob(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Step1CapturedBody({ patient }: { patient: Patient }) {
  const sourceLabel =
    patient.identitySource === 'qr'
      ? 'QR scan'
      : patient.identitySource === 'chip'
        ? 'NFC chip'
        : patient.identitySource === 'manual'
          ? 'Manual entry'
          : 'Existing record'
  return (
    <WizardStepBody
      title="Identity captured"
      subtitle="Edit on Step 2 — locked fields require unlock first."
    >
      <SectionCard padding="lg">
        <div className="flex items-start gap-4">
          <IconBadge tone="success" size="lg">
            <Icon name="tabler:shield-check" />
          </IconBadge>
          <div className="flex-1 space-y-1">
            <SectionLabel as="div">Identity captured</SectionLabel>
            <div className="text-base font-semibold">{patient.name}</div>
            {patient.nameKhmer ? (
              <div className="text-xs text-muted-foreground" lang="km">
                {patient.nameKhmer}
              </div>
            ) : null}
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Icon name="tabler:refresh" size={12} />
            Re-capture
          </Button>
        </div>

        <dl className="mt-5 grid grid-cols-4 gap-x-6 gap-y-4 border-t border-border pt-5">
          <DataPoint label="Date of birth">{formatDob(patient.dob)}</DataPoint>
          <DataPoint label="Sex at birth">{patient.sexAtBirth || ''}</DataPoint>
          <DataPoint label="National ID">{patient.idNumber}</DataPoint>
          <DataPoint label="Phone">
            {patient.countryCode} {patient.phoneNumber}
          </DataPoint>
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Badge variant="neutral">
            <Icon name="tabler:camera" size={10} /> Captured via {sourceLabel}
            {patient.capturedAt ? <span> · {patient.capturedAt}</span> : null}
          </Badge>
          {patient.lockedFields.length > 0 ? (
            <Badge variant="info">
              <Icon name="tabler:lock" size={10} /> {patient.lockedFields.length} field
              {patient.lockedFields.length === 1 ? '' : 's'} locked
            </Badge>
          ) : null}
        </div>
      </SectionCard>

      <Banner tone="info" title="Booking / referral code">
        Use this early when the patient brings a prescription, QR, or teleconsult summary.
      </Banner>
    </WizardStepBody>
  )
}

export const BlankWalkIn: Story = {
  name: 'Step 1 — Blank walk-in',
  render: () => (
    <StepShell
      patient={BLANK_PATIENT}
      currentStep={1}
      doneThroughStep={0}
      continueDisabled
      blockerLabel="Capture identity to continue"
    >
      <Step1BlankBody />
    </StepShell>
  ),
}

export const IdentityCaptured: Story = {
  name: 'Step 1 — Identity captured',
  render: () => (
    <StepShell patient={CAPTURED_PATIENT} currentStep={1} doneThroughStep={0}>
      <Step1CapturedBody patient={CAPTURED_PATIENT} />
    </StepShell>
  ),
}
