import { type ReactNode } from 'react'

import { Icon } from '../atoms/icon.tsx'
import { MetaPill } from '../atoms/meta-pill.tsx'
import { DataPoint } from '../molecules/data-point.tsx'
import { JourneyList, type JourneyListStep } from '../molecules/journey-list.tsx'
import { SectionCard } from '../molecules/section-card.tsx'
import { Avatar, AvatarFallback } from '../ui/avatar.tsx'

type SubjectContextDetail = {
  label: string
  value: ReactNode
}

type SubjectContextCardProps = {
  initials: string
  title: string
  subtitle: ReactNode
  pills?: ReactNode[]
  notice?: ReactNode
  journey?: {
    steps: JourneyListStep[]
    currentStep?: string
  }
  details?: SubjectContextDetail[]
  className?: string
}

/**
 * Side-rail context card for a loaded clinical subject.
 *
 * @kuraModules phlebo
 */
function SubjectContextCard({
  initials,
  title,
  subtitle,
  pills,
  notice,
  journey,
  details,
  className,
}: SubjectContextCardProps) {
  return (
    <SectionCard padding="lg" className={className}>
      <div className="flex items-start gap-4">
        <Avatar className="size-14">
          <AvatarFallback className="bg-[var(--brand-500)] text-base font-black text-[var(--ink-0)]">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-black text-[var(--ink-900)]">{title}</h2>
          <div className="mt-1 text-k-sm font-semibold text-[var(--ink-700)]">{subtitle}</div>
          {pills?.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pills.map((pill, index) => (
                <MetaPill key={index}>{pill}</MetaPill>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {notice ? (
        <div
          role="note"
          className="mt-4 flex items-center gap-2 rounded-[var(--radius)] border border-[var(--warn-100)] bg-[var(--warn-50)] px-3 py-2 text-k-body font-medium text-[var(--warn-700)]"
        >
          <Icon name="tabler:alert-triangle" size={14} />
          {notice}
        </div>
      ) : null}

      {journey ? (
        <JourneyList
          className="mt-5"
          steps={journey.steps}
          currentStep={journey.currentStep}
        />
      ) : null}

      {details?.length ? (
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
          {details.map((detail) => (
            <DataPoint key={detail.label} label={detail.label}>
              {detail.value}
            </DataPoint>
          ))}
        </dl>
      ) : null}
    </SectionCard>
  )
}

export { SubjectContextCard, type SubjectContextCardProps, type SubjectContextDetail }
