import { useId, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type SectionCardMetaTone = 'success' | 'neutral'

type SectionCardPadding = 'sm' | 'md' | 'lg'

type SectionCardTone = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'brand'

type SectionCardProps = {
  /** Optional section title. When omitted, the header band is suppressed entirely and the card renders as a generic bordered surface. */
  title?: string
  /** Heading element used for the title. Defaults to `h3`. Ignored when `title` is omitted. */
  titleAs?: 'h2' | 'h3' | 'h4'
  /** Optional right-aligned meta slot. When passed as a string, renders as a tone-coded pill driven by `metaTone`. */
  meta?: ReactNode
  /** Pill chroma when `meta` is a string. Defaults to `neutral`. Ignored when `meta` is a ReactNode. */
  metaTone?: SectionCardMetaTone
  /** Optional muted right-aligned hint text. Ignored when `meta` is provided. */
  hint?: ReactNode
  /** Padding scale. `sm` = `px-3.5 py-3`, `md` = `p-4`, `lg` = `p-5`. Defaults to `md`. */
  padding?: SectionCardPadding
  /** Surface tone. `default` uses the neutral surface + border; other tones tint both. */
  tone?: SectionCardTone
  /** Section body content. */
  children: ReactNode
  /** Outer container className override. */
  className?: string
}

const PADDING_CLASS: Record<SectionCardPadding, string> = {
  sm: 'px-3.5 py-3',
  md: 'p-4',
  lg: 'p-5',
}

const TONE_CLASS: Record<SectionCardTone, string> = {
  default: 'border-[var(--border)] bg-[var(--surface)]',
  info: 'border-[var(--info-500)] bg-[var(--status-info-bg)]',
  success: 'border-[var(--success-500)] bg-[var(--status-success-bg)]',
  warning: 'border-[var(--warning-500)] bg-[var(--status-warning-bg)]',
  danger: 'border-[var(--danger-500)] bg-[var(--status-danger-bg)]',
  brand: 'border-[var(--brand-300)] bg-[var(--brand-50)]',
}

/**
 * Bordered section card. When `title` is provided, renders a header band (title + optional
 * right-aligned meta pill or muted hint) above the body content slot. When `title` is omitted,
 * suppresses the header band entirely and renders as a generic bordered surface — useful for
 * wrapping search inputs, prompt panels, or sub-flow bodies that don't need a labeled header.
 *
 * @kuraModules receptionist, phlebo
 */
function SectionCard({
  title,
  titleAs = 'h3',
  meta,
  metaTone = 'neutral',
  hint,
  padding = 'md',
  tone = 'default',
  children,
  className,
}: SectionCardProps) {
  const id = useId()
  const Heading = titleAs
  const hasHeader = Boolean(title || meta || hint)

  const metaPillClass =
    metaTone === 'success'
      ? 'inline-flex h-6 items-center rounded-full bg-[var(--success-50)] px-2.5 text-k-xs font-bold text-[var(--success-700)]'
      : 'inline-flex h-6 items-center rounded-full bg-[var(--ink-50)] px-2.5 text-k-xs font-bold text-[var(--ink-700)]'

  return (
    <section
      aria-labelledby={title ? id : undefined}
      data-slot="section-card"
      data-tone={tone}
      className={cn(
        'rounded-[var(--radius-lg)] border shadow-[var(--shadow-xs)]',
        TONE_CLASS[tone],
        PADDING_CLASS[padding],
        className,
      )}
    >
      {hasHeader ? (
        <div className="mb-3 flex min-h-6 items-center justify-between gap-3">
          {title ? (
            <Heading id={id} className="text-k-h font-bold leading-none text-[var(--ink-900)]">
              {title}
            </Heading>
          ) : (
            <span />
          )}
          {meta ? (
            typeof meta === 'string' ? <span className={metaPillClass}>{meta}</span> : meta
          ) : hint ? (
            <span className="text-right text-k-xs font-semibold text-[var(--ink-500)]">{hint}</span>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export {
  SectionCard,
  type SectionCardProps,
  type SectionCardMetaTone,
  type SectionCardPadding,
  type SectionCardTone,
}
