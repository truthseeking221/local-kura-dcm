import { Icon } from '../atoms/icon.tsx'
import { Badge } from '../ui/badge.tsx'
import { cn } from '../../lib/cn.ts'

type TubeVisualTone =
  | 'yellow'
  | 'blue'
  | 'red'
  | 'gold'
  | 'green'
  | 'grayGreen'
  | 'lavender'
  | 'pink'
  | 'white'
  | 'darkGray'

type TubeVisualStatus = 'generated' | 'collected' | 'deferred'

type TubeVisualSpec = {
  key: string
  order: number
  tone: TubeVisualTone
  stopperLabel: string
  additive: string
  short: string
  inversions: number
  timeLimitMin?: number | null
  handling?: string[]
}

type TubeVisualProps = {
  tube: TubeVisualSpec
  count?: number
  status?: TubeVisualStatus
  focused?: boolean
  needsInvert?: boolean
  className?: string
}

type TubeDotProps = {
  tube: Pick<TubeVisualSpec, 'tone'>
  className?: string
}

type TubeToneClass = {
  cap: string
  fluid: string
  dot: string
}

const TUBE_TONE_CLASS: Record<TubeVisualTone, TubeToneClass> = {
  yellow: {
    cap: 'border-[var(--warn-500)] bg-[var(--warn-100)]',
    fluid: 'bg-[var(--danger-100)]',
    dot: 'border-[var(--warn-500)] bg-[var(--warn-100)]',
  },
  blue: {
    cap: 'border-[var(--info-500)] bg-[var(--info-50)]',
    fluid: 'bg-[var(--danger-100)]',
    dot: 'border-[var(--info-500)] bg-[var(--info-50)]',
  },
  red: {
    cap: 'border-[var(--danger-500)] bg-[var(--danger-50)]',
    fluid: 'bg-[var(--danger-100)]',
    dot: 'border-[var(--danger-500)] bg-[var(--danger-50)]',
  },
  gold: {
    cap: 'border-[var(--warn-600)] bg-[var(--warn-100)]',
    fluid: 'bg-[var(--danger-600)]',
    dot: 'border-[var(--warn-600)] bg-[var(--warn-100)]',
  },
  green: {
    cap: 'border-[var(--success-600)] bg-[var(--success-100)]',
    fluid: 'bg-[var(--danger-100)]',
    dot: 'border-[var(--success-600)] bg-[var(--success-100)]',
  },
  grayGreen: {
    cap: 'border-[var(--success-700)] bg-[var(--ink-150)]',
    fluid: 'bg-[var(--danger-100)]',
    dot: 'border-[var(--success-700)] bg-[var(--ink-150)]',
  },
  lavender: {
    cap: 'border-[var(--brand-300)] bg-[var(--brand-50)]',
    fluid: 'bg-[var(--danger-600)]',
    dot: 'border-[var(--brand-300)] bg-[var(--brand-50)]',
  },
  pink: {
    cap: 'border-[var(--danger-100)] bg-[var(--danger-50)]',
    fluid: 'bg-[var(--danger-100)]',
    dot: 'border-[var(--danger-100)] bg-[var(--danger-50)]',
  },
  white: {
    cap: 'border-[var(--ink-300)] bg-[var(--ink-50)]',
    fluid: 'bg-[var(--danger-100)]',
    dot: 'border-[var(--ink-300)] bg-[var(--ink-50)]',
  },
  darkGray: {
    cap: 'border-[var(--ink-700)] bg-[var(--ink-400)]',
    fluid: 'bg-[var(--danger-600)]',
    dot: 'border-[var(--ink-700)] bg-[var(--ink-400)]',
  },
}

/**
 * Small stopper-color marker used in sample rows and queue picks.
 *
 * @kuraModules phlebo
 */
function TubeDot({ tube, className }: TubeDotProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex size-3 rounded-full border', TUBE_TONE_CLASS[tube.tone].dot, className)}
    />
  )
}

/**
 * Tube visual based on the Phlebo prototype order-of-draw rack.
 *
 * @kuraModules phlebo
 */
function TubeVisual({ tube, count = 1, status, focused, needsInvert, className }: TubeVisualProps) {
  const dim = count === 0
  const toneClass = TUBE_TONE_CLASS[tube.tone]

  return (
    <button
      type="button"
      className={cn(
        'relative flex min-w-16 flex-col items-center gap-1 rounded-[var(--radius)] px-2 py-2 transition-colors',
        focused && 'bg-[var(--brand-50)] shadow-[var(--shadow-selected)]',
        dim ? 'opacity-35' : 'hover:bg-[var(--surface-2)]',
        className,
      )}
      aria-label={`${tube.stopperLabel}, ${count} required`}
    >
      {!dim && tube.inversions > 0 ? (
        <span className="absolute right-1 top-1 inline-flex items-center gap-0.5 rounded-[var(--radius-pill)] bg-[var(--ink-900)] px-1 py-0.5 text-k-xs font-bold text-[var(--ink-0)]">
          <Icon name="tabler:refresh" size={12} />
          {tube.inversions}
        </span>
      ) : null}
      <span className="flex h-20 w-6 flex-col items-center">
        <span className={cn('h-2 w-6 rounded-t-[var(--radius-xs)] border', toneClass.cap)} />
        <span className="flex h-16 w-5 items-end overflow-hidden rounded-b-[var(--radius)] border border-[var(--ink-200)] bg-[var(--surface)]">
          <span className={cn('h-10 w-full', toneClass.fluid)} />
        </span>
      </span>
      {count > 1 ? (
        <Badge variant="neutral" className="absolute left-1 top-1">
          x{count}
        </Badge>
      ) : null}
      {status === 'collected' ? (
        <span className="absolute bottom-8 right-2 inline-flex size-5 items-center justify-center rounded-full bg-[var(--success-500)] text-[var(--ink-0)]">
          <Icon name="tabler:check" size={12} />
        </span>
      ) : null}
      {status === 'deferred' ? (
        <span className="absolute bottom-8 right-2 inline-flex size-5 items-center justify-center rounded-full bg-[var(--warn-500)] text-[var(--ink-0)]">
          <Icon name="tabler:clock" size={12} />
        </span>
      ) : null}
      {needsInvert ? (
        <span className="absolute bottom-8 left-2 inline-flex size-5 items-center justify-center rounded-full bg-[var(--warn-500)] text-[var(--ink-0)]">
          <Icon name="tabler:rotate-clockwise" size={12} />
        </span>
      ) : null}
      <span className="text-center text-k-xs font-bold leading-tight text-[var(--ink-800)]">
        {tube.short}
      </span>
      <span className="text-k-xs font-medium text-[var(--ink-400)]">#{tube.order}</span>
    </button>
  )
}

export {
  TubeDot,
  TubeVisual,
  type TubeDotProps,
  type TubeVisualProps,
  type TubeVisualSpec,
  type TubeVisualStatus,
  type TubeVisualTone,
}
