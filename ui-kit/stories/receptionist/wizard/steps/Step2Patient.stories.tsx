import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps, type ReactNode } from 'react'

import { Icon } from '@/components/atoms/icon.tsx'
import { CollapsibleSection } from '@/components/molecules/collapsible-section.tsx'
import { SectionCard } from '@/components/molecules/section-card.tsx'
import { WizardStepBody } from '@/components/molecules/wizard-step-body.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { cn } from '@/lib/cn.ts'

import { CAPTURED_PATIENT, type Patient } from '../../_fixtures/patient.ts'

import { StepShell } from './_scaffold.tsx'

const meta: Meta = {
  title: 'Receptionist/Wizard/Steps/Step2 Patient',
  tags: ['autodocs', 'module:receptionist'],
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

const STEP2_PATIENT: Patient = {
  ...CAPTURED_PATIENT,
  age: 30,
  language: 'Khmer',
  status: { tone: 'warning', label: 'Verify patient' },
  cart: {
    ...CAPTURED_PATIENT.cart,
    items: CAPTURED_PATIENT.cart.items
      .filter((item) => item.auto)
      .map((item) => ({ ...item, price: 0 })),
  },
}

function formatDob(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB').replaceAll('/', '-')
}

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-k-xs font-semibold leading-none text-[var(--ink-600)]"
    >
      <span>{children}</span>
      {required ? (
        <span aria-hidden className="ml-0.5 text-[var(--danger-500)]">
          *
        </span>
      ) : null}
    </Label>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  )
}

function inputClassName(className?: string) {
  return cn(
    'h-9 rounded-[var(--radius)] border-[var(--border)] bg-[var(--surface)] px-3 text-k-sm font-medium text-[var(--ink-700)] shadow-none placeholder:text-[var(--ink-300)]',
    className,
  )
}

function LockedInput({
  value,
  className,
  ...props
}: ComponentProps<typeof Input> & {
  value: string
  className?: string
}) {
  return (
    <div className="relative">
      <Input
        {...props}
        value={value}
        readOnly
        aria-readonly="true"
        className={inputClassName(
          cn('bg-[var(--surface-2)] pr-9 text-[var(--ink-800)]', className),
        )}
      />
      <Icon
        name="tabler:lock"
        size={12}
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-400)]"
      />
    </div>
  )
}

function LanguageSelect({ value }: { value: Patient['language'] }) {
  return (
    <Select defaultValue={value}>
      <SelectTrigger className="h-9 w-full rounded-[var(--radius)] border-[var(--border)] bg-[var(--surface)] px-3 text-k-sm font-medium text-[var(--ink-700)] shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Khmer">Khmer</SelectItem>
        <SelectItem value="English">English</SelectItem>
      </SelectContent>
    </Select>
  )
}

function ContactChannels() {
  const [channel, setChannel] = useState<'telegram' | 'sms'>('telegram')

  return (
    <div className="space-y-2.5">
      <p className="text-k-sm font-semibold text-[var(--ink-700)]">
        How does the patient prefer to be contacted?
      </p>
      <RadioGroup
        value={channel}
        onValueChange={(value) => setChannel(value as 'telegram' | 'sms')}
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        <ContactChannelOption
          value="telegram"
          selected={channel === 'telegram'}
          icon="tabler:brand-telegram"
          label="Telegram"
        />
        <ContactChannelOption
          value="sms"
          selected={channel === 'sms'}
          icon="tabler:message"
          label="SMS"
        />
      </RadioGroup>
    </div>
  )
}

function ContactChannelOption({
  value,
  selected,
  icon,
  label,
}: {
  value: 'telegram' | 'sms'
  selected: boolean
  icon: string
  label: string
}) {
  return (
    <Label
      className={cn(
        'flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-[var(--radius)] border px-3 text-k-body font-bold transition-colors',
        selected
          ? 'border-[var(--brand-300)] bg-[var(--brand-50)] text-[var(--brand-700)]'
          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink-700)] hover:bg-[var(--surface-2)]',
      )}
    >
      <RadioGroupItem value={value} aria-label={label} className="sr-only" />
      <Icon name={icon} size={16} />
      {label}
    </Label>
  )
}

function AddressBody() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Field label="Province">
        <Input placeholder="Phnom Penh" className={inputClassName()} />
      </Field>
      <Field label="District">
        <Input placeholder="Chamkarmon" className={inputClassName()} />
      </Field>
      <Field label="Commune">
        <Input placeholder="Tonle Bassac" className={inputClassName()} />
      </Field>
      <Field label="Street / house" required={false}>
        <Input placeholder="House, street, landmark" className={inputClassName('sm:col-span-3')} />
      </Field>
    </div>
  )
}

function RefundBody() {
  return (
    <div className="rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--ink-500)]">
            <Icon name="tabler:credit-card" size={17} />
          </span>
          <div>
            <p className="text-k-body font-bold text-[var(--ink-800)]">No refund account saved</p>
            <p className="mt-0.5 text-k-xs font-medium text-[var(--ink-500)]">
              Add Bakong KHQR only if this patient may need a refund.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3 text-k-sm">
            <Icon name="tabler:qrcode" size={13} />
            Scan KHQR
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3 text-k-sm">
            <Icon name="tabler:pencil" size={13} />
            Enter manually
          </Button>
        </div>
      </div>
    </div>
  )
}

function Step2ReviewBody({ patient }: { patient: Patient }) {
  return (
    <WizardStepBody
      title="Review & confirm"
      subtitle="Verify details captured from ID, then verify a contact channel."
      gap="md"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9 gap-1.5 rounded-[var(--radius)] border-[var(--warn-200)] bg-[var(--warn-50)] px-3.5 text-k-body font-bold text-[var(--warn-600)] hover:bg-[var(--warn-100)]"
          >
            <Icon name="tabler:lock-open" size={13} /> Unlock fields
          </Button>
          <Button
            variant="outline"
            className="h-9 gap-1.5 rounded-[var(--radius)] px-3.5 text-k-body font-bold"
          >
            <Icon name="tabler:camera" size={14} /> Capture photo
          </Button>
        </div>
      }
    >
      <SectionCard title="Identity" meta="From QR scan" metaTone="success">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Full name (Latin)" required>
            <LockedInput value={patient.name} />
          </Field>
          <Field label="Full name (Khmer)">
            <Input
              defaultValue={patient.nameKhmer ?? ''}
              placeholder="សុខ ស្រីម៉ៅ"
              lang="km"
              className={inputClassName()}
            />
          </Field>
          <Field label="Date of birth" required>
            <LockedInput value={formatDob(patient.dob)} mask="date" placeholder="DD-MM-YYYY" />
          </Field>
          <Field label="Sex at birth" required>
            <LockedInput value={patient.sexAtBirth} />
          </Field>
          <Field label="National ID number">
            <LockedInput value={patient.idNumber} />
          </Field>
          <Field label="Preferred language">
            <LanguageSelect value={patient.language} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Contact channels" hint="At least one verified channel required">
        <ContactChannels />
      </SectionCard>

      <CollapsibleSection
        title="Address"
        defaultOpen={false}
        meta={<span className="text-xs text-muted-foreground">Optional</span>}
      >
        <AddressBody />
      </CollapsibleSection>

      <CollapsibleSection
        title="Refund account"
        defaultOpen={false}
        meta={<span className="text-xs text-muted-foreground">Optional</span>}
      >
        <RefundBody />
      </CollapsibleSection>
    </WizardStepBody>
  )
}

export const Review: Story = {
  name: 'Step 2 — Patient',
  render: () => (
    <StepShell
      patient={STEP2_PATIENT}
      currentStep={2}
      doneThroughStep={1}
      continueDisabled
      blockerLabel="At least one verified contact required"
    >
      <Step2ReviewBody patient={STEP2_PATIENT} />
    </StepShell>
  ),
}
