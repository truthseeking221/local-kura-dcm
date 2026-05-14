import { type ReactNode } from 'react'

type TypeSampleProps = {
  /** Semantic class name, e.g. `k-h1`. */
  className: string
  /** Optional override of the sample text. */
  sample?: ReactNode
}

const DEFAULT_SAMPLE =
  'Sok Sreymom · ស៊ុក ស្រីម៉ៅ · 12345 · Q-001'

/**
 * Renders a single type-class sample row: token name on the left, rendered
 * text on the right.
 */
export function TypeSample({ className, sample = DEFAULT_SAMPLE }: TypeSampleProps) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-baseline gap-6 border-b border-border py-3 last:border-b-0">
      <code className="font-mono text-[11px] text-muted-foreground">.{className}</code>
      <span className={className}>{sample}</span>
    </div>
  )
}
