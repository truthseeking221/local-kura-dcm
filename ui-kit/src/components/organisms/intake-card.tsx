import { useId, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type IntakeCardProps = {
  /** Card title. Defaults to "Visit Details". */
  title?: string
  /** Heading element used for the title. Defaults to `h4`. */
  titleAs?: 'h2' | 'h3' | 'h4'
  /** Optional `<StatusPill>` rendered in the header right slot (e.g., "1/8 · Not started"). */
  statusPill?: ReactNode
  /** Optional call-to-action band — typically composes `<IconBadge>` + copy + action `<Button>`s. */
  cta?: ReactNode
  /** Checklist body — pass `<ChecklistItem>` rows. The component wraps them in a bordered rail. */
  children?: ReactNode
  /** Outer container className override. */
  className?: string
}

/**
 * Receptionist Step 5 intake panel. Workflow card with title + StatusPill header, an optional
 * call-to-action band (typically a surface-2 bar for the "Patient intake form" CTA), and a
 * checklist rail body.
 *
 * The kit owns the shell + header band + checklist-rail container; the caller composes the CTA
 * region and passes `<ChecklistItem>` rows as children. Use existing `<IconBadge tone="brand" size="md">`
 * inside the cta slot for the leading icon-square; do not recreate inline.
 *
 * @kuraModules receptionist
 */
function IntakeCard({
  title = 'Visit Details',
  titleAs = 'h4',
  statusPill,
  cta,
  children,
  className,
}: IntakeCardProps) {
  const id = useId()
  const Heading = titleAs

  return (
    <section
      aria-labelledby={id}
      data-slot="intake-card"
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]',
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <Heading id={id} className="text-k-h font-bold leading-none text-[var(--ink-900)]">
          {title}
        </Heading>
        {statusPill}
      </div>

      {cta ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)] p-3">
          {cta}
        </div>
      ) : null}

      {children ? (
        <div className="mt-3 overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
          {children}
        </div>
      ) : null}
    </section>
  )
}

export { IntakeCard, type IntakeCardProps }
