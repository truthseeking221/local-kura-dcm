import { type ReactNode } from 'react'

type TileProps = {
  /** Display name shown below the tile, e.g. `--space-4`. */
  name: string
  /** Optional secondary line, e.g. `16px`. */
  meta?: string
  /** Visual sample for the token (a sized box, a shadowed card, etc.). */
  children: ReactNode
}

/**
 * Generic preview tile used by Spacing / Radius / Shadow pages. The `children`
 * slot owns the visual; the wrapper just lays it out and labels it.
 */
export function Tile({ name, meta, children }: TileProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex h-24 w-full items-center justify-center rounded-[var(--radius-sm)] bg-muted/40 p-4">
        {children}
      </div>
      <div className="font-mono text-[11px] leading-snug">
        <div className="text-foreground">{name}</div>
        {meta ? <div className="text-muted-foreground">{meta}</div> : null}
      </div>
    </div>
  )
}
