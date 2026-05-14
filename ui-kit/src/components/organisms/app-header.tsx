import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type AppHeaderProps = Omit<ComponentProps<'header'>, 'children'> & {
  /** Far-left content. Typically a logo + wordmark. */
  leading?: ReactNode
  /** Left cluster, sitting next to `leading`. Typically context pickers (station, shift). */
  left?: ReactNode
  /** Center area — usually a search input. Stretches to fill available space. */
  center?: ReactNode
  /** Right cluster — notifications, profile, primary action. */
  right?: ReactNode
}

/**
 * AppHeader — slot-based application header. Owns chrome (height, border,
 * padding, sticky behavior) but no content opinions, so receptionist /
 * phlebo / patient can each drop in their own pickers and CTAs.
 *
 * The four slots flow `leading | left | center | right` with the center
 * stretching. If a slot is omitted, its space collapses.
 */
function AppHeader({ leading, left, center, right, className, ...props }: AppHeaderProps) {
  return (
    <header
      data-slot="app-header"
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-6',
        className,
      )}
      {...props}
    >
      {leading ? <div className="flex shrink-0 items-center">{leading}</div> : null}
      {left ? <div className="flex shrink-0 items-center gap-2">{left}</div> : null}
      {center ? <div className="flex flex-1 items-center justify-center">{center}</div> : <div className="flex-1" />}
      {right ? <div className="flex shrink-0 items-center gap-2">{right}</div> : null}
    </header>
  )
}

export { AppHeader }
