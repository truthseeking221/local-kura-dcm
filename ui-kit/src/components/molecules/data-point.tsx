import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type DataPointProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Uppercase label, e.g. "MEMBER NAME". */
  label: ReactNode
  /** The value, e.g. "Sok Sreymom". Falsy values render a `—` placeholder. */
  children?: ReactNode
}

/**
 * DataPoint — uppercase label above a value. Backs the saved-policy detail
 * grid (`MEMBER NAME / Sok Sreymom`, `EXPIRY / 12/2027`, `COVERAGE / Both`).
 * Compose multiple in a flex/grid; the molecule itself doesn't lay out.
 */
function DataPoint({ label, children, className, ...props }: DataPointProps) {
  const isEmpty = children === null || children === undefined || children === ''
  return (
    <div data-slot="data-point" className={cn('flex flex-col gap-0.5', className)} {...props}>
      <dt className="text-k-xs font-semibold uppercase tracking-k-caps text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">
        {isEmpty ? <span className="text-muted-foreground">—</span> : children}
      </dd>
    </div>
  )
}

export { DataPoint }
