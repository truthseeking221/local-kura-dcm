import type * as React from 'react'

import { cn } from '../../lib/cn.ts'

/**
 * Layout preset for a wizard step's body region. Provides an optional header
 * band (title + subtitle + right-aligned actions slot) and a vertically-stacked
 * body via children. Designed as the single shared visual contract for step
 * pages across any clinic-app wizard.
 *
 * Universal — no module tag. Reach via `@kura/ui-kit` or `@kura/ui-kit/molecules`.
 */
export type WizardStepBodyProps = {
  /** Optional title for the step. Rendered as the heading element specified by `as`. */
  title?: string
  /** Optional subtitle, rendered below the title in muted-foreground. */
  subtitle?: string
  /** Optional right-aligned actions slot in the header band (typically Button(s)). */
  actions?: React.ReactNode
  /** Heading element used for `title`. Defaults to `'h2'`. */
  as?: 'h1' | 'h2' | 'h3'
  /** Vertical gap between children, mapped to Tailwind spacing units. Defaults to `'lg'` (= `gap-6`). */
  gap?: 'sm' | 'md' | 'lg'
  /** Step body content. Each top-level child stacks vertically with the configured gap. */
  children: React.ReactNode
  /** Optional className applied to the outer wrapper. */
  className?: string
}

const GAP_CLASS: Record<NonNullable<WizardStepBodyProps['gap']>, string> = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
}

const HEADING_TAG: Record<NonNullable<WizardStepBodyProps['as']>, 'h1' | 'h2' | 'h3'> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
}

export function WizardStepBody({
  title,
  subtitle,
  actions,
  as = 'h2',
  gap = 'lg',
  children,
  className,
}: WizardStepBodyProps) {
  const hasHeader = Boolean(title || subtitle || actions)
  const HeadingTag = HEADING_TAG[as]
  return (
    <div className={cn('flex flex-col', GAP_CLASS[gap], className)}>
      {hasHeader ? (
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title ? (
              <HeadingTag className="text-lg font-semibold text-foreground">{title}</HeadingTag>
            ) : null}
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </div>
  )
}
