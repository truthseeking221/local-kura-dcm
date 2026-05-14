import { useId, type ReactNode } from 'react'

import { SectionLabel } from '../atoms/section-label.tsx'
import { cn } from '../../lib/cn.ts'

type WorkflowHeadingProps = {
  /** Brand-tinted uppercase tracked eyebrow (e.g., "Pre-consultation"). */
  eyebrow: ReactNode
  /** Heading text rendered under the eyebrow. */
  title: ReactNode
  /** Optional supporting subtitle rendered under the title. */
  subtitle?: ReactNode
  /** Heading element. Defaults to `h3`. */
  titleAs?: 'h2' | 'h3' | 'h4'
  /** Outer container className override. */
  className?: string
}

/**
 * Three-line phase heading used to introduce a workflow region inside a wizard step body —
 * eyebrow (SectionLabel, brand-tinted) over the title over an optional subtitle. The canonical
 * "Pre-consultation / Visit details / Fill while patient is still in the queue." pattern.
 */
function WorkflowHeading({
  eyebrow,
  title,
  subtitle,
  titleAs = 'h3',
  className,
}: WorkflowHeadingProps) {
  const id = useId()
  const Heading = titleAs

  return (
    <div data-slot="workflow-heading" className={cn('space-y-1', className)}>
      <SectionLabel as="div" className="text-[var(--brand-600)]">
        {eyebrow}
      </SectionLabel>
      <Heading
        id={id}
        className="text-k-lg font-bold leading-k-tight text-[var(--ink-900)]"
      >
        {title}
      </Heading>
      {subtitle ? (
        <p className="text-k-body leading-k-base text-[var(--ink-500)]">{subtitle}</p>
      ) : null}
    </div>
  )
}

export { WorkflowHeading, type WorkflowHeadingProps }
