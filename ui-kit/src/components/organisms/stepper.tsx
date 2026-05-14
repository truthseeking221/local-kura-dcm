import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

import { Icon } from '../atoms/icon.tsx'
type StepStatus = 'locked' | 'active' | 'done'
type StepperStep = {
  /** Visible label. */
  label: ReactNode
  /** Drives display state. `done` renders a check; `active` renders the index in brand; `locked` renders muted. */
  status: StepStatus
  /** Disable interaction even when `onStepClick` is provided. */
  disabled?: boolean
}

type StepperProps = Omit<ComponentProps<'ol'>, 'onClick' | 'children'> & {
  /** Ordered steps. */
  steps: StepperStep[]
  /** Optional click handler — receives the index. Skipped when `disabled` is true on the step. */
  onStepClick?: (index: number) => void
  /** Optional shortcut hint rendered after the last step (e.g. `F1–F6 steps`). */
  shortcutHint?: ReactNode
}

const PILL_CLASSES: Record<StepStatus, string> = {
  locked: 'border-transparent bg-transparent text-[var(--ink-500)] opacity-50',
  active: 'border-[var(--brand-200)] bg-[var(--brand-50)] text-[var(--brand-700)]',
  done: 'border-transparent bg-transparent text-[var(--success-600)]',
}

const MARK_CLASSES: Record<StepStatus, string> = {
  locked: 'border-[var(--border)] bg-[var(--ink-50)] text-[var(--ink-400)]',
  active:
    'border-[var(--brand-500)] bg-[var(--brand-500)] text-[var(--ink-0)] shadow-[var(--shadow-selected)]',
  done: 'border-[var(--success-100)] bg-[var(--success-50)] text-[var(--success-600)]',
}

/**
 * Stepper — horizontal progress stepper with `locked` / `active` / `done`
 * step states. Each step renders as a prototype-aligned pill (number circle +
 * label) connected by flexible 2px hairline dividers. Done dividers are
 * success-green; locked dividers are neutral.
 *
 * Owns nothing about the wizard's content — consumer drives `steps`. Pair
 * with a kbd-shortcut hint slot when the wizard supports keyboard nav.
 *
 * Layout-locked pill geometry: `size-[22px]` mark, `gap-[7px]`, asymmetric
 * `py-[5px] pl-[5px] pr-[10px]`, `h-[2px]` rail with `clamp(14px,3.4vw,60px)`
 * width — canonical prototype dimensions, not density-derived (see CLAUDE.md
 * "Layout-only arbitrary `[Npx]`"). Pill marker text and right-aligned
 * `shortcutHint` use `10.5px` chrome — non-body decorative numerals.
 */
function Stepper({ steps, onStepClick, shortcutHint, className, ...props }: StepperProps) {
  return (
    <div className="flex w-full min-w-0 items-center gap-1">
      <ol
        data-slot="stepper"
        role={props.role ?? 'navigation'}
        aria-label={props['aria-label'] ?? 'Check-in progress'}
        className={cn('flex min-w-0 shrink items-center gap-1 overflow-hidden', className)}
        {...props}
      >
        {steps.map((step, index) => {
          const interactive = !!onStepClick && !step.disabled && step.status !== 'locked'
          const hasStepButtons = !!onStepClick
          const PillTag = hasStepButtons ? 'button' : 'span'
          return (
            <li
              key={index}
              className="flex shrink-0 items-center gap-1"
            >
              <PillTag
                type={hasStepButtons ? 'button' : undefined}
                onClick={interactive ? () => onStepClick?.(index) : undefined}
                aria-current={step.status === 'active' ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${typeof step.label === 'string' ? step.label : ''} — ${step.status}`}
                disabled={hasStepButtons ? !interactive : undefined}
                data-status={step.status}
                className={cn(
                  'inline-flex shrink-0 items-center gap-[7px] rounded-full border py-[5px] pl-[5px] pr-[10px] transition-colors',
                  PILL_CLASSES[step.status],
                  interactive && 'cursor-pointer hover:bg-[var(--surface-2)] hover:text-[var(--ink-700)]',
                  hasStepButtons && !interactive && 'cursor-not-allowed',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border text-[10.5px] font-bold tabular-nums leading-none transition-colors',
                    MARK_CLASSES[step.status],
                  )}
                >
                  {step.status === 'done' ? <Icon name="tabler:check" size={12} /> : index + 1}
                </span>
                <span className="whitespace-nowrap text-xs font-semibold">{step.label}</span>
              </PillTag>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    'h-[2px] w-[clamp(14px,3.4vw,60px)] shrink rounded-full transition-colors',
                    step.status === 'done' ? 'bg-[var(--success-100)]' : 'bg-[var(--border)]',
                  )}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
      {shortcutHint ? (
        <div className="ml-auto inline-flex shrink-0 items-center pl-4 text-[10.5px] font-bold text-[var(--ink-400)]">
          {shortcutHint}
        </div>
      ) : null}
    </div>
  )
}

export { Stepper, type StepperStep, type StepStatus }
