import { Icon as IconifyIcon, type IconProps as IconifyIconProps } from '@iconify/react'
import type { CSSProperties } from 'react'

import { cn } from '../../lib/cn.ts'

/**
 * Icon — single icon primitive backed by Iconify. Any of the 200+ Iconify
 * collections can be referenced by string name (e.g. `tabler:shopping-cart`,
 * `healthicons:syringe`, `circle-flags:vn`). Strokes default to 1.5 to keep
 * the kit's hairline icon look — pass `strokeWidth` to override, or pass
 * `null` for filled / coloured collections that own their own stroke.
 *
 * Default size is 16; consumers should still gravitate to the canonical
 * scale `12 / 14 / 16 / 20 / 24 / 28`.
 */
export type IconProps = Omit<IconifyIconProps, 'icon' | 'width' | 'height' | 'strokeWidth'> & {
  /** Iconify icon identifier — e.g. `tabler:shopping-cart`. */
  name: string
  /** Pixel size for both width and height. Defaults to 16. */
  size?: number
  /** SVG stroke width applied via inline style. Defaults to 1.5. Pass `null` to leave the upstream stroke width alone. */
  strokeWidth?: number | null
}

export function Icon({
  name,
  size = 16,
  strokeWidth = 1.5,
  className,
  style,
  ...rest
}: IconProps) {
  const finalStyle: CSSProperties | undefined =
    strokeWidth == null
      ? style
      : { ...(style ?? {}), strokeWidth, ['--svg-stroke-width' as string]: strokeWidth }
  return (
    <IconifyIcon
      icon={name}
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      style={finalStyle}
      {...rest}
    />
  )
}
