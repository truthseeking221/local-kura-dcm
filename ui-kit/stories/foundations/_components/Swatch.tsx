type SwatchProps = {
  /** Display name shown above the chip, e.g. `brand-500`. */
  name: string
  /** CSS custom property name including the `--`, e.g. `--brand-500`. */
  cssVar: string
  /** Override the swatch height (defaults to 56px). */
  height?: number
}

/**
 * A single colour chip pulled from a CSS custom property. The chip itself uses
 * `var(<cssVar>)` so re-rendering happens automatically when the global theme
 * (data-theme) changes.
 */
export function Swatch({ name, cssVar, height = 56 }: SwatchProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="rounded-[var(--radius-sm)] border border-border"
        style={{ background: `var(${cssVar})`, height }}
        aria-hidden
      />
      <div className="font-mono text-[11px] leading-snug">
        <div className="text-foreground">{name}</div>
        <div className="text-muted-foreground">{cssVar}</div>
      </div>
    </div>
  )
}
