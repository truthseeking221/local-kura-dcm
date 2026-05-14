import { Icon } from '../atoms/icon.tsx'
import { cn } from '../../lib/cn.ts'

/**
 * Bottom action bar for a wizard step. Stateless controlled — the caller
 * provides labels, disabled state, blocker text, and click handlers.
 *
 * @kuraModules receptionist, phlebo
 */
export type WizardStepFooterProps = {
  hideBack?: boolean
  backLabel?: string
  continueLabel?: string
  continueDisabled?: boolean
  showContinueShortcut?: boolean
  blockerLabel?: string
  onBack?: () => void
  onContinue?: () => void
  className?: string
}

export function WizardStepFooter({
  hideBack,
  backLabel = 'Back',
  continueLabel = 'Continue',
  continueDisabled,
  showContinueShortcut = false,
  blockerLabel,
  onBack,
  onContinue,
  className,
}: WizardStepFooterProps) {
  return (
    <div
      className={cn(
        'mt-1 flex w-full items-center justify-between gap-3 border-t border-[var(--border)] pt-3.5',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center">
        {!hideBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-3.5 text-k-body font-semibold text-[var(--ink-700)] transition-colors hover:border-[var(--ink-200)] hover:bg-[var(--ink-100)] hover:text-[var(--ink-900)] focus-visible:shadow-[var(--shadow-focus)] active:translate-y-px"
          >
            <Icon name="tabler:chevron-left" size={13} strokeWidth={2.2} />
            {backLabel}
          </button>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        {blockerLabel ? (
          <span
            role="status"
            className="inline-flex items-center gap-1 rounded-[var(--radius-xs)] border border-[var(--warn-100)] bg-[var(--warn-50)] px-2 py-1 text-k-xs font-semibold text-[var(--warn-600)]"
          >
            <Icon name="tabler:alert-circle" size={11} strokeWidth={2.2} />
            {blockerLabel}
          </span>
        ) : null}
        <button
          type="button"
          disabled={continueDisabled}
          onClick={onContinue}
          className={cn(
            'inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] px-3.5 text-k-body font-semibold transition-colors focus-visible:shadow-[var(--shadow-focus)] active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            continueDisabled
              ? 'bg-[var(--ink-200)] text-[var(--ink-400)]'
              : 'bg-[var(--brand-500)] text-[var(--ink-0)] hover:bg-[var(--brand-600)]',
          )}
        >
          {continueLabel}
          <Icon name="tabler:chevron-right" size={13} strokeWidth={2.2} />
          {showContinueShortcut ? (
            <span className="rounded-[var(--radius-sm)] border border-white/30 bg-white/15 px-1.5 py-0.5 font-mono text-k-xs">
              Enter
            </span>
          ) : null}
        </button>
      </div>
    </div>
  )
}
