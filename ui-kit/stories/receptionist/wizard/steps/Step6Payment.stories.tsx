import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from '@/components/atoms/icon.tsx'
import { SectionCard } from '@/components/molecules/section-card.tsx'
import { WizardStepBody } from '@/components/molecules/wizard-step-body.tsx'

import { CAPTURED_PATIENT, type Patient } from '../../_fixtures/patient.ts'

import { StepShell } from './_scaffold.tsx'

const meta: Meta = {
  title: 'Receptionist/Wizard/Steps/Step6 Payment',
  tags: ['autodocs', 'module:receptionist'],
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

const STEP6_PATIENT: Patient = {
  ...CAPTURED_PATIENT,
  cart: {
    ccy: 'USD',
    items: [
      { id: 'vit-pkg', kind: 'vitals', name: 'Vital signs package', price: 0, qty: 1, auto: true },
      { id: 'cbc', kind: 'lab', name: 'Complete Blood Count (CBC)', price: 8, qty: 1 },
      { id: 'lipid', kind: 'lab', name: 'Lipid Panel', price: 12, qty: 1 },
    ],
  },
}

function usd(amount: number): string {
  return `$${amount.toFixed(2)}`
}

function Step6Body({ patient }: { patient: Patient }) {
  const total = patient.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  return (
    <WizardStepBody
      title="Payment"
      subtitle="Collect payment and confirm the order."
      gap="md"
      actions={
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--ink-500)]">
          <div
            className="inline-flex items-center rounded-[5px] border border-[var(--border-strong)] bg-[var(--surface-2)] p-0.5"
            role="group"
            aria-label="Payment currency"
          >
            <button
              type="button"
              aria-pressed="true"
              className="rounded-[4px] bg-[var(--surface)] px-2 py-0.5 text-[10.5px] font-bold text-[var(--ink-900)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              USD
            </button>
            <button
              type="button"
              aria-pressed="false"
              className="rounded-[4px] px-2 py-0.5 text-[10.5px] font-bold text-[var(--ink-500)]"
            >
              KHR
            </button>
          </div>
          <span>1 USD = 4,100 KHR</span>
        </div>
      }
    >
      <SectionCard padding="sm" className="shadow-none">
        <header className="mb-2 flex items-center justify-between gap-4 border-b border-[var(--border)] pb-2">
          <strong className="text-[13px] font-bold text-[var(--ink-900)]">Order summary</strong>
          <span className="font-mono text-[13px] font-bold tabular-nums text-[var(--ink-900)]">
            {usd(total)}
          </span>
        </header>
        <div className="space-y-1">
          {patient.cart.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 text-[12px] text-[var(--ink-700)]"
            >
              <span className="min-w-0 truncate">{item.name}</span>
              <span className="shrink-0 font-mono tabular-nums text-[var(--ink-900)]">
                {usd(item.price * item.qty)}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard padding="sm" className="shadow-none">
        <header className="flex min-h-[28px] items-center justify-between gap-3">
          <strong className="text-[13px] font-bold text-[var(--ink-900)]">Payment method</strong>
          <button
            type="button"
            className="inline-flex h-7 items-center justify-center gap-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-2.5 text-[11px] font-semibold text-[var(--ink-700)] transition-colors hover:border-[var(--ink-200)] hover:bg-[var(--ink-100)] hover:text-[var(--ink-900)]"
          >
            <Icon name="tabler:git-merge" size={11} strokeWidth={2.2} />
            Cash + KHQR split
          </button>
        </header>
      </SectionCard>

      <section className="border-t border-[var(--border)] px-4 py-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--ink-500)]">
            Payment
          </div>
          <div
            className="inline-flex items-center rounded-[5px] border border-[var(--border-strong)] bg-[var(--surface-2)] p-0.5"
            role="group"
            aria-label="Payment method currency"
          >
            <button
              type="button"
              aria-pressed="true"
              className="rounded-[4px] bg-[var(--surface)] px-2 py-0.5 text-[10.5px] font-bold text-[var(--ink-900)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              USD
            </button>
            <button
              type="button"
              aria-pressed="false"
              className="rounded-[4px] px-2 py-0.5 text-[10.5px] font-bold text-[var(--ink-500)]"
            >
              KHR
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'KHQR', icon: 'tabler:qrcode' },
            { label: 'Cash', icon: 'tabler:wallet' },
          ].map((method) => (
            <button
              key={method.label}
              type="button"
              className="flex min-h-[64px] w-full flex-col items-center justify-center gap-1 rounded-[7px] border-[1.5px] border-[var(--border-strong)] bg-[var(--surface)] px-2 py-2.5 text-[11.5px] font-bold text-[var(--ink-900)] transition-colors hover:bg-[var(--surface-2)]"
            >
              <Icon name={method.icon} size={18} className="text-[var(--ink-700)]" />
              <span>{method.label}</span>
            </button>
          ))}
        </div>
      </section>
    </WizardStepBody>
  )
}

export const Default: Story = {
  name: 'Step 6 — Payment',
  render: () => (
    <StepShell
      patient={STEP6_PATIENT}
      currentStep={6}
      doneThroughStep={5}
      cartStillNeeded={['Take payment in Step 6 or mark pay-later']}
      footer={
        <div className="mt-1 flex w-full items-center justify-between gap-3 border-t border-[var(--border)] pt-3.5">
          <div className="flex min-w-0 flex-1 items-center">
            <button
              type="button"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-3.5 text-k-body font-semibold text-[var(--ink-700)] transition-colors hover:border-[var(--ink-200)] hover:bg-[var(--ink-100)] hover:text-[var(--ink-900)] focus-visible:shadow-[var(--shadow-focus)] active:translate-y-px"
            >
              <Icon name="tabler:chevron-left" size={13} strokeWidth={2.2} />
              Back
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[var(--radius)] px-2.5 text-[12px] font-semibold text-[var(--ink-700)] transition-colors hover:bg-[var(--ink-100)] hover:text-[var(--ink-900)] focus-visible:shadow-[var(--shadow-focus)] active:translate-y-px"
            >
              <Icon name="tabler:clock" size={11} strokeWidth={2.2} />
              Mark pay-later
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] bg-[var(--brand-500)] px-3.5 text-k-body font-semibold text-[var(--ink-0)] transition-colors hover:bg-[var(--brand-600)] focus-visible:shadow-[var(--shadow-focus)] active:translate-y-px"
            >
              Pay later — continue
              <Icon name="tabler:chevron-right" size={13} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      }
    >
      <Step6Body patient={STEP6_PATIENT} />
    </StepShell>
  ),
}
