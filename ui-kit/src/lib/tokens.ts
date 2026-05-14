/**
 * Token helpers — utilities for composing CSS values from Kura design tokens
 * when a static token alone is not enough (e.g. per-instance ring colors).
 *
 * Pure functions, zero kit imports. Imported from `@kura/ui-kit/lib/tokens`.
 */

type TintedRingOpts = {
  /**
   * The ring color. May be any CSS color expression:
   *   - a token reference: `'var(--status-success-fg)'`
   *   - an rgb triplet for opacity composition: `'var(--brand-rgb)'`
   *   - a literal CSS color: `'rgb(38 140 255)'`
   *
   * `@allowArbitraryValue` — by design, this prop accepts any CSS color.
   */
  color: string
  /** Ring thickness in CSS pixels. Defaults to `1`. */
  width?: 1 | 2 | 3
  /** Render as an inset (inner) ring rather than an outer ring. Defaults to `false`. */
  inset?: boolean
  /**
   * When set, composes `rgba(color, opacity)`. Requires `color` to be an
   * rgb triplet such as `'var(--brand-rgb)'`. Omit for tokens that already
   * carry their own concrete color (e.g. `var(--status-success-fg)`).
   */
  opacity?: number
}

/**
 * Build a CSS `box-shadow` string for a colored ring with fixed geometry.
 *
 * Used for parameterized rings where the geometry is shared but the color
 * varies per call site (`ScanInput` success/danger halos, `ColorSwatch` inset
 * border ring). Consume via the `style` prop:
 *
 * ```tsx
 * <input
 *   style={{ boxShadow: tintedRing({ color: 'var(--status-success-fg)' }) }}
 * />
 * ```
 *
 * Returns the raw CSS shadow string (not a Tailwind class) so callers can
 * compose it with other shadows or apply via `style` for SSR-safe rendering.
 *
 * @example Outer 1px success ring
 *   tintedRing({ color: 'var(--status-success-fg)' })
 *   // → "0 0 0 1px var(--status-success-fg)"
 *
 * @example Inset 1px border ring
 *   tintedRing({ color: 'var(--border)', inset: true })
 *   // → "inset 0 0 0 1px var(--border)"
 *
 * @example 3px soft brand ring (rgb-triplet token + opacity)
 *   tintedRing({ color: 'var(--brand-rgb)', width: 3, opacity: 0.18 })
 *   // → "0 0 0 3px rgba(var(--brand-rgb), 0.18)"
 */
export function tintedRing(opts: TintedRingOpts): string {
  const { color, width = 1, inset = false, opacity } = opts
  const insetPrefix = inset ? 'inset ' : ''
  const resolvedColor =
    typeof opacity === 'number' ? `rgba(${color}, ${opacity})` : color
  return `${insetPrefix}0 0 0 ${width}px ${resolvedColor}`
}
