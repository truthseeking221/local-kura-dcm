import { Icon } from '../atoms/icon.tsx'
import { SectionLabel } from '../atoms/section-label.tsx'
import { StatusPill, type StatusPillTone } from './status-pill.tsx'
import { cn } from '../../lib/cn.ts'

type JourneyListStatus = 'done' | 'pending' | 'waiting' | 'skipped'

type JourneyListStep = {
  id: string
  label: string
  icon: string
  status: JourneyListStatus
}

type JourneyListProps = {
  /** Visible heading above the list. */
  label?: string
  /** Ordered journey steps. */
  steps: JourneyListStep[]
  /** Current step id receives the active visual treatment. */
  currentStep?: string
  className?: string
}

const STATUS_META: Record<JourneyListStatus, { label: string; tone: StatusPillTone; icon: string }> = {
  done: { label: 'Done', tone: 'success', icon: 'tabler:circle-check' },
  pending: { label: 'Pending', tone: 'info', icon: 'tabler:clock' },
  waiting: { label: 'Waiting', tone: 'neutral', icon: 'tabler:clock' },
  skipped: { label: 'Skipped', tone: 'warning', icon: 'tabler:alert-circle' },
}

/**
 * Ordered clinical journey list with explicit status labels.
 *
 * @kuraModules phlebo
 */
function JourneyList({ label = 'Journey', steps, currentStep, className }: JourneyListProps) {
  return (
    <div data-slot="journey-list" className={className}>
      <SectionLabel as="div">{label}</SectionLabel>
      <div className="mt-2 grid gap-2">
        {steps.map((step) => {
          const meta = STATUS_META[step.status]
          const active = currentStep === step.id

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius)] border px-3 py-2',
                active
                  ? 'border-[var(--brand-200)] bg-[var(--brand-50)]'
                  : 'border-[var(--border)] bg-[var(--surface)]',
              )}
            >
              <span
                aria-hidden
                className="inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-2)] text-[var(--brand-700)]"
              >
                <Icon name={step.icon} size={14} />
              </span>
              <span className="min-w-0 flex-1 text-k-body font-bold text-[var(--ink-800)]">
                {step.label}
              </span>
              <StatusPill tone={meta.tone} icon={<Icon name={meta.icon} />}>
                {meta.label}
              </StatusPill>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { JourneyList, type JourneyListProps, type JourneyListStatus, type JourneyListStep }
