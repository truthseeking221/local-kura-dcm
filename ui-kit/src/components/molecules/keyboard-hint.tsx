import { type ComponentProps, type ReactNode } from 'react'

import { Kbd } from '../atoms/kbd.tsx'
import { cn } from '../../lib/cn.ts'

type KeyboardHintProps = ComponentProps<'span'> & {
  /** A single key or a sequence rendered as one Kbd each. */
  keys: ReactNode | ReactNode[]
  /** Optional separator rendered between key chips, e.g. `+`. */
  keySeparator?: ReactNode
  /** Classes applied to every Kbd chip. */
  kbdClassName?: string
  /** Classes applied to the text label. */
  labelClassName?: string
}

/**
 * KeyboardHint — `Kbd` (or a sequence of them) followed by a label.
 * Example: `<KeyboardHint keys="Space">add/remove</KeyboardHint>`.
 */
function KeyboardHint({
  keys,
  keySeparator,
  kbdClassName,
  labelClassName,
  children,
  className,
  ...props
}: KeyboardHintProps) {
  const keyList = Array.isArray(keys) ? keys : [keys]
  return (
    <span
      data-slot="keyboard-hint"
      className={cn('inline-flex items-center gap-1.5 text-xs', className)}
      {...props}
    >
      <span className="inline-flex items-center gap-0.5">
        {keyList.map((k, i) => (
          <span key={i} className="inline-flex items-center gap-0.5">
            {i > 0 && keySeparator ? keySeparator : null}
            <Kbd className={kbdClassName}>{k}</Kbd>
          </span>
        ))}
      </span>
      <span className={cn('text-muted-foreground', labelClassName)}>{children}</span>
    </span>
  )
}

type KeyboardHintsBarDensity = 'default' | 'compact'

type KeyboardHintsBarProps = ComponentProps<'div'> & {
  /**
   * Density preset.
   * - `'default'` (default) keeps the existing `text-xs` (≈ 12 px) sizing for
   *   shell-level hint strips like the wizard footer's `⏎ Continue` hint.
   * - `'compact'` shrinks the bar to `10.5 px` (density-exempt per CLAUDE.md)
   *   for dense catalog rails and order-cart footer strips. Matches the
   *   canonical Step 4 catalog hint strip.
   */
  density?: KeyboardHintsBarDensity
}

/**
 * KeyboardHintsBar — horizontal row of `KeyboardHint`s with consistent gaps.
 * Backs the catalog hint strip:
 * `/ search · ↑↓ navigate · Space add/remove · Enter add/remove · Esc clear`.
 *
 * The `density` prop tunes the text size for dense surfaces:
 * `'default'` inherits `text-xs`; `'compact'` drops to `text-[10.5px]`.
 */
function KeyboardHintsBar({
  density = 'default',
  className,
  children,
  ...props
}: KeyboardHintsBarProps) {
  return (
    <div
      data-slot="keyboard-hints-bar"
      data-density={density}
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2',
        density === 'compact' && 'text-[10.5px]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { KeyboardHint, KeyboardHintsBar, type KeyboardHintsBarDensity }
