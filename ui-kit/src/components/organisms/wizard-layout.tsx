import type * as React from 'react'

import { cn } from '../../lib/cn.ts'

/**
 * Full wizard frame: fixed header band → fixed stepper band → scrollable body
 * with optional 360-px aside. The footer renders at the end of the main step
 * column so it aligns with the active step content instead of the side rail.
 * Five slots; no state. Mount as the immediate child of a route's <main>.
 *
 * @kuraModules receptionist, phlebo
 */
export type WizardLayoutProps = {
  /** Subject-of-the-visit header — typically a <SubjectHeader/>. Renders fixed at top. */
  header: React.ReactNode
  /** Step indicator — typically a <Stepper/>. Renders fixed below the header. */
  stepper: React.ReactNode
  /** Main step content. Renders in the scrollable body region. */
  children: React.ReactNode
  /** Optional side rail — typically a cart. 360 px wide; scrolls with the body. */
  aside?: React.ReactNode
  /** Optional footer — typically a <WizardStepFooter/>. Renders below the step content. */
  footer?: React.ReactNode
  /** Override the aside column width in pixels. Defaults to 360. */
  asideWidth?: number
  className?: string
}

export function WizardLayout({
  header,
  stepper,
  children,
  aside,
  footer,
  asideWidth = 360,
  className,
}: WizardLayoutProps) {
  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-[var(--bg)]', className)}>
      <div className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-3">
        {header}
      </div>
      <div className="flex shrink-0 items-center border-b border-[var(--border)] bg-[var(--surface)] px-6 py-3.5">
        {stepper}
      </div>
      <div className="flex-1 overflow-y-auto bg-[var(--bg)] p-4">
        {aside ? (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `minmax(0, 1fr) ${asideWidth}px` }}
          >
            <main className="flex min-w-0 flex-col gap-3.5">
              {children}
              {footer}
            </main>
            <aside className="flex min-w-0 flex-col gap-3.5">{aside}</aside>
          </div>
        ) : (
          <main className="flex flex-col gap-3.5">
            {children}
            {footer}
          </main>
        )}
      </div>
    </div>
  )
}
