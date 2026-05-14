import { type ReactNode } from 'react'

import { Icon } from '@/components/atoms/icon.tsx'
import { Kbd } from '@/components/atoms/kbd.tsx'
import { MetaPill } from '@/components/atoms/meta-pill.tsx'
import { StatusPill } from '@/components/molecules/status-pill.tsx'
import { Stepper, type StepperStep } from '@/components/organisms/stepper.tsx'
import { SubjectHeader } from '@/components/organisms/subject-header.tsx'
import { WizardLayout } from '@/components/organisms/wizard-layout.tsx'
import { WizardStepFooter } from '@/components/organisms/wizard-step-footer.tsx'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx'

import { buildSteps, type Patient } from '../../_fixtures/patient.ts'

import { CartRail } from './_cart-rail.tsx'

type ScaffoldProps = {
  patient: Patient
  currentStep: number
  doneThroughStep: number
  blockerLabel?: string
  continueDisabled?: boolean
  continueLabel?: string
  showContinueShortcut?: boolean
  asideWidth?: number
  hideAside?: boolean
  showAutoCartItems?: boolean
  cartStillNeeded?: string[]
  footer?: ReactNode
  children: ReactNode
}

export function StepShell({
  patient,
  currentStep,
  doneThroughStep,
  blockerLabel,
  continueDisabled,
  continueLabel,
  showContinueShortcut,
  asideWidth,
  hideAside,
  showAutoCartItems,
  cartStillNeeded,
  footer,
  children,
}: ScaffoldProps) {
  const steps: StepperStep[] = buildSteps(currentStep, doneThroughStep)
  return (
    <div className="h-screen">
      <WizardLayout
        header={<PatientSubjectHeader patient={patient} />}
        stepper={
          <Stepper
            steps={steps}
            shortcutHint={
              <span className="inline-flex items-center gap-[5px]">
                <Kbd className="h-4 min-w-0 bg-[var(--surface-2)] px-[5px] text-[10.5px]">
                  F1-F6
                </Kbd>
                <span>steps</span>
              </span>
            }
          />
        }
        aside={
          hideAside ? undefined : (
            <CartRail
              patient={patient}
              showAutoItems={showAutoCartItems}
              stillNeeded={cartStillNeeded}
            />
          )
        }
        asideWidth={asideWidth}
        footer={footer ?? (
          <WizardStepFooter
            hideBack={currentStep === 1}
            continueLabel={continueLabel}
            continueDisabled={continueDisabled}
            showContinueShortcut={showContinueShortcut}
            blockerLabel={blockerLabel}
            className={
              currentStep === 2
                ? 'sticky bottom-0 z-30 !mt-0 !border-t-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--surface)_50%)] !pt-2'
                : undefined
            }
          />
        )}
      >
        {children}
      </WizardLayout>
    </div>
  )
}

function PatientSubjectHeader({ patient }: { patient: Patient }) {
  const isBlank = !patient.name
  return (
    <SubjectHeader
      avatar={
        <Avatar className="size-[42px]">
          <AvatarFallback
            className={
              isBlank
                ? 'bg-[var(--warn-50)] text-[var(--ink-400)]'
                : 'bg-[var(--brand-50)] text-[var(--brand-700)] font-bold'
            }
          >
            {isBlank ? <Icon name="tabler:user" size={16} /> : patient.initials}
          </AvatarFallback>
        </Avatar>
      }
      title={isBlank ? 'New visit' : patient.name}
      pills={
        <>
          <MetaPill className="font-mono tabular-nums">{patient.queueNumber}</MetaPill>
          {!isBlank ? (
            <MetaPill>
              {patient.age} · {patient.sexAtBirth}
            </MetaPill>
          ) : null}
          <MetaPill>{patient.arrivedLabel}</MetaPill>
        </>
      }
      actions={
        isBlank ? (
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[var(--warn-100)] bg-[var(--warn-50)] px-3 text-[11.8px] font-bold text-[var(--warn-500)] transition-colors hover:bg-[var(--warn-100)]"
          >
            <Icon name="tabler:user-plus" size={12} />
            Capture identity
          </button>
        ) : null
      }
      status={
        !isBlank ? <StatusPill tone={patient.status.tone}>{patient.status.label}</StatusPill> : null
      }
    />
  )
}
