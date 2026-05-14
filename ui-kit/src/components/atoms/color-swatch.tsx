import { type ComponentProps } from 'react'

import { cn } from '../../lib/cn.ts'
import { tintedRing } from '../../lib/tokens.ts'

type ColorSwatchSize = 'sm' | 'md' | 'lg'

const SIZE_PX: Record<ColorSwatchSize, number> = {
  sm: 8,
  md: 10,
  lg: 12,
}

type ColorSwatchProps = Omit<ComponentProps<'span'>, 'children' | 'color'> & {
  /**
   * CSS color (hex / rgb / oklch / `var(--token)`). The fill of the swatch.
   * Required.
   *
   * @allowArbitraryValue — by design, this prop accepts any CSS color (tube
   * colors, category tags, palette previews are all driven by the literal
   * color value).
   */
  color: string
  /** Pixel diameter. `sm` 8 / `md` 10 / `lg` 12. Defaults to `md`. */
  size?: ColorSwatchSize
  /** Inset 1 px ring using `--border`. Defaults to `true` so pale fills stay visible on white surfaces. */
  ring?: boolean
  /** Accessible label for screen readers — set when the swatch is the only carrier of meaning; pair with sibling text otherwise. */
  label?: string
}

/**
 * ColorSwatch — small round chip that renders an arbitrary CSS color. Distinct
 * from `StatusDot` which is locked to status tones. Use for tube-color dots,
 * category tags, palette previews — anywhere a literal color stands in for a
 * piece of data.
 *
 * Color alone is not enough for users with low colour vision. Always pair the
 * swatch with a sibling text label, or set `label` so screen readers announce
 * the meaning.
 */
function ColorSwatch({
  color,
  size = 'md',
  ring = true,
  label,
  className,
  style,
  ...props
}: ColorSwatchProps) {
  const px = SIZE_PX[size]
  return (
    <span
      data-slot="color-swatch"
      data-size={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('inline-block shrink-0 rounded-full', className)}
      style={{
        width: px,
        height: px,
        background: color,
        boxShadow: ring ? tintedRing({ color: 'var(--border)', inset: true }) : undefined,
        ...style,
      }}
      {...props}
    />
  )
}

export { ColorSwatch, type ColorSwatchSize }
