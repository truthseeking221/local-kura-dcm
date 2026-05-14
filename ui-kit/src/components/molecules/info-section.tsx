import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'
import { SectionLabel } from '../atoms/section-label.tsx'

type InfoSectionProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Leading icon, rendered at 14px to match the tiny-caps label scale. */
  icon: ReactNode
  /** Tiny-caps label text. */
  label: ReactNode
  /** Body paragraph content. */
  children: ReactNode
}

/**
 * InfoSection — structured info sub-block: 14px leading icon over a tiny-caps
 * label and a body paragraph. Used inside info-toned containers to break a
 * panel into "What it measures / Looks for / What you'll do / Results by"
 * style sections.
 *
 * Backs the test-info expansion on the orders catalog.
 */
function InfoSection({ icon, label, children, className, ...props }: InfoSectionProps) {
  return (
    <div
      data-slot="info-section"
      className={cn('flex items-start gap-2', className)}
      {...props}
    >
      <span
        aria-hidden
        className="mt-0.5 inline-flex shrink-0 opacity-80 [&>svg]:size-3.5"
      >
        {icon}
      </span>
      <div className="flex-1">
        <SectionLabel as="div">{label}</SectionLabel>
        <p className="mt-0.5 text-sm">{children}</p>
      </div>
    </div>
  )
}

export { InfoSection }
