import type { ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type MediaFrameTone = 'default' | 'danger'

type MediaFrameBackground = 'surface' | 'muted' | 'white'

type MediaFramePadding = 'sm' | 'md' | 'lg'

type MediaFrameProps = {
  /**
   * Border tone. `default` uses the neutral `--border` token. `danger` swaps to
   * `--danger-500` for expired/error state callouts on the frame itself.
   * Defaults to `default`.
   */
  tone?: MediaFrameTone

  /**
   * When `true`, renders the border as `dashed` — signals a "capture target" or
   * empty placeholder state (camera preview, QR-mount waiting state). Defaults
   * to `false` (solid border).
   */
  dashed?: boolean

  /**
   * Frame background.
   * - `surface` (default): canonical card surface, theme-aware.
   * - `muted`: subtle alt-row/hover-stripe surface — pairs with `dashed` for
   *   "soft placeholder" empty states.
   * - `white`: pure white via `--ink-0`. LOCKED to QR-scan-readability cases:
   *   QR codes require a true-white quiet zone regardless of theme to keep
   *   scanner contrast intact. Dark-mode does NOT invert this. Do not use
   *   `bg="white"` for non-QR media — pick `surface` or `muted` instead.
   */
  bg?: MediaFrameBackground

  /**
   * Inner padding scale. `sm` = `p-3`, `md` = `p-4`, `lg` = `p-6`.
   * Defaults to `md`.
   */
  padding?: MediaFramePadding

  /** Frame contents — usually `<img>`, `<video>`, an icon + caption stack, or a slot. */
  children: ReactNode

  /** Outer container className override (layout utilities only). */
  className?: string
}

const TONE_CLASS: Record<MediaFrameTone, string> = {
  default: 'border-[var(--border)]',
  danger: 'border-[var(--danger-500)]',
}

const BG_CLASS: Record<MediaFrameBackground, string> = {
  surface: 'bg-[var(--surface)]',
  muted: 'bg-[var(--surface-2)]',
  white: 'bg-[var(--ink-0)]',
}

const PADDING_CLASS: Record<MediaFramePadding, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

/**
 * Bordered media container for camera previews, QR codes, and image placeholders.
 * A layout-only molecule — owns the bordered frame chrome (tone, dashed, bg,
 * padding) and centers its children. Callers compose whatever lives inside.
 *
 * Used today by three receptionist surfaces:
 *   - National ID QR scan camera preview (dashed, muted bg)
 *   - Telegram verification QR mount (dashed, muted bg) / rendered QR (white)
 *   - KHQR payment display (white bg, tone="danger" on expiry)
 *
 * The `bg="white"` option is the ONLY legitimate raw-white background in the
 * kit — locked to QR-scan-readability cases where dark-mode inversion would
 * break scanner contrast. Do not use `bg="white"` for non-QR media; pick
 * `surface` or `muted` instead.
 *
 * @kuraModules receptionist
 */
function MediaFrame({
  tone = 'default',
  dashed = false,
  bg = 'surface',
  padding = 'md',
  children,
  className,
}: MediaFrameProps) {
  return (
    <div
      data-slot="media-frame"
      data-tone={tone}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border',
        TONE_CLASS[tone],
        dashed && 'border-dashed',
        BG_CLASS[bg],
        PADDING_CLASS[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}

export {
  MediaFrame,
  type MediaFrameBackground,
  type MediaFramePadding,
  type MediaFrameProps,
  type MediaFrameTone,
}
