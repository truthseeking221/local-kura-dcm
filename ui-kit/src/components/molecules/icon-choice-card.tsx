import { type ReactNode } from 'react'

import { Icon } from '../atoms/icon.tsx'
import { cn } from '../../lib/cn.ts'
import { IconBadge, type IconBadgeSize, type IconBadgeTone } from './icon-badge.tsx'

type IconChoiceCardProps = {
  /** Required leading icon. Renders inside an `<IconBadge>` driven by `iconBadgeTone` + `iconBadgeSize`. */
  icon: ReactNode
  /** Card title. */
  title: string
  /** Supporting copy. */
  description: string
  /** Tone of the leading IconBadge. Defaults to `brand`. Use `neutral` for "coming soon" cards. */
  iconBadgeTone?: IconBadgeTone
  /** Size of the leading IconBadge. Defaults to `lg`. */
  iconBadgeSize?: IconBadgeSize
  /** When true, renders the card as an `aria-disabled` non-interactive element with a dashed border + dimmed opacity + an inline "Coming soon" pill next to the title. No-ops `onClick`. */
  comingSoon?: boolean
  /** Label shown in the "Coming soon" pill. Defaults to `Coming soon`. */
  comingSoonLabel?: string
  /** CTA label rendered with the default trailing arrow when `trailing` is not provided. */
  cta?: string
  /**
   * Optional trailing slot rendered as the LAST child of the card. When `undefined` (default),
   * the canonical "Start →" arrow renders for interactive cards. Pass `null` to suppress it,
   * or a custom node (e.g., `<Kbd>F2</Kbd>`) to replace it. Custom nodes render unconditionally
   * — the caller decides whether the card is interactive.
   */
  trailing?: ReactNode | null
  /** Click handler. No-op when `comingSoon`. */
  onClick?: () => void
  /** Outer button className override. */
  className?: string
}

/**
 * "Pick how to start X" card — `<IconBadge>` + title + description + optional trailing slot
 * (defaults to "Start →" CTA). Used as 3-up or 4-up grids in capture-method choosers.
 *
 * When `comingSoon`, renders as a non-interactive `aria-disabled` element with a dashed border,
 * dimmed opacity, neutral-tone IconBadge, and an inline "Coming soon" pill next to the title.
 * The card stays in the tab order so screen readers can announce the disabled state.
 */
function IconChoiceCard({
  icon,
  title,
  description,
  iconBadgeTone,
  iconBadgeSize = 'lg',
  comingSoon,
  comingSoonLabel = 'Coming soon',
  cta = 'Start',
  trailing,
  onClick,
  className,
}: IconChoiceCardProps) {
  const interactive = !comingSoon && !!onClick
  const effectiveTone: IconBadgeTone = iconBadgeTone ?? (comingSoon ? 'neutral' : 'brand')
  const trailingNode = renderTrailing({ trailing, interactive, cta })

  const sharedClass = cn(
    'flex h-full flex-col items-start gap-3 rounded-[var(--radius-lg)] border bg-card p-4 text-left transition-colors',
    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
    comingSoon ? 'border-dashed border-[var(--border)] opacity-60' : 'border-[var(--border)]',
    interactive && 'hover:border-[var(--brand-500)] hover:shadow-[var(--shadow-sm)]',
    className,
  )

  const body = (
    <>
      <IconBadge tone={effectiveTone} size={iconBadgeSize}>
        {icon}
      </IconBadge>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {title}
          {comingSoon ? (
            <span className="rounded-[var(--radius-pill)] bg-[var(--ink-100)] px-2 py-0.5 text-k-xs font-bold uppercase tracking-wider text-muted-foreground">
              {comingSoonLabel}
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {trailingNode}
    </>
  )

  if (comingSoon) {
    return (
      <div data-slot="icon-choice-card" aria-disabled className={sharedClass}>
        {body}
      </div>
    )
  }

  return (
    <button
      data-slot="icon-choice-card"
      type="button"
      onClick={interactive ? onClick : undefined}
      className={sharedClass}
    >
      {body}
    </button>
  )
}

function renderTrailing({
  trailing,
  interactive,
  cta,
}: {
  trailing: ReactNode | null | undefined
  interactive: boolean
  cta: string
}): ReactNode {
  if (trailing === null) return null
  if (trailing !== undefined) return trailing
  if (!interactive) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-700)] group-hover:underline">
      {cta}
      <Icon name="tabler:arrow-right" size={12} />
    </span>
  )
}

export { IconChoiceCard, type IconChoiceCardProps }
