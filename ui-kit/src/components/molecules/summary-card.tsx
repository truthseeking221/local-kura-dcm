import { useId, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'
import { Separator } from '../ui/separator.tsx'

import { IconBadge, type IconBadgeSize, type IconBadgeTone } from './icon-badge.tsx'

type SummaryCardTone = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'brand'

type SummaryCardProps = {
  /** Icon rendered inside the leading `<IconBadge>`. */
  iconBadgeIcon: ReactNode
  /** Tone of the leading `<IconBadge>`. */
  iconBadgeTone: IconBadgeTone
  /** Size of the leading `<IconBadge>`. Defaults to `lg`. */
  iconBadgeSize?: IconBadgeSize
  /** Optional 10 px uppercase tracked eyebrow rendered above the title. */
  eyebrow?: string
  /** Card title. */
  title: string
  /** Heading element used for the title. Defaults to `h3`. */
  titleAs?: 'h2' | 'h3' | 'h4'
  /** Optional subtitle rendered under the title (e.g., "Last verified · 08:21"). */
  subtitle?: ReactNode
  /** Optional `<StatusPill>` rendered inline with the title. */
  statusPill?: ReactNode
  /** Optional right-aligned action buttons. */
  actions?: ReactNode
  /** When true, suppresses the default `<Separator>` between header and body. */
  dividerless?: boolean
  /** Surface tone. `default` uses the neutral card surface; other tones tint both bg + border. */
  tone?: SummaryCardTone
  /** Optional body content — typically a `<DataPoint>` grid. When omitted, the divider is also suppressed automatically. */
  children?: ReactNode
  /** Optional bottom row separated by a top border — typically meta pills / attribution chips. */
  footer?: ReactNode
  /** Outer container className override. */
  className?: string
}

const TONE_CLASS: Record<SummaryCardTone, string> = {
  default: 'border-[var(--border)] bg-[var(--card)]',
  info: 'border-[var(--info-500)] bg-[var(--status-info-bg)]',
  success: 'border-[var(--success-500)] bg-[var(--status-success-bg)]',
  warning: 'border-[var(--warning-500)] bg-[var(--status-warning-bg)]',
  danger: 'border-[var(--danger-500)] bg-[var(--status-danger-bg)]',
  brand: 'border-[var(--brand-300)] bg-[var(--brand-50)]',
}

/**
 * Composed display card with a leading `<IconBadge>`, a title (optionally preceded by an eyebrow and/or
 * accompanied by an inline `<StatusPill>`), optional right-aligned actions, and a body content slot
 * (typically a `<DataPoint>` grid). Optional footer for meta pills / attribution chips.
 *
 * Used for "captured" and "summary" states — e.g., Step 1 captured identity, Step 3 with-policy.
 *
 * @kuraModules receptionist, phlebo, patient
 */
function SummaryCard({
  iconBadgeIcon,
  iconBadgeTone,
  iconBadgeSize = 'lg',
  eyebrow,
  title,
  titleAs = 'h3',
  subtitle,
  statusPill,
  actions,
  dividerless = false,
  tone = 'default',
  children,
  footer,
  className,
}: SummaryCardProps) {
  const id = useId()
  const Heading = titleAs
  const hasBody = children !== undefined && children !== null && children !== false
  const showDivider = hasBody && !dividerless

  return (
    <section
      aria-labelledby={id}
      data-slot="summary-card"
      data-tone={tone}
      className={cn('rounded-[var(--radius-lg)] border p-5', TONE_CLASS[tone], className)}
    >
      <div className="flex items-start gap-4">
        <IconBadge tone={iconBadgeTone} size={iconBadgeSize}>
          {iconBadgeIcon}
        </IconBadge>
        <div className="flex-1 space-y-1">
          {eyebrow ? (
            <div className="text-k-xs font-semibold uppercase tracking-k-caps text-[var(--ink-500)]">
              {eyebrow}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Heading id={id} className="text-base font-semibold">
              {title}
            </Heading>
            {statusPill}
          </div>
          {subtitle ? <div className="text-xs text-[var(--ink-500)]">{subtitle}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>

      {showDivider ? <Separator className="my-4" /> : null}

      {hasBody ? children : null}

      {footer ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
          {footer}
        </div>
      ) : null}
    </section>
  )
}

export { SummaryCard, type SummaryCardProps, type SummaryCardTone }
