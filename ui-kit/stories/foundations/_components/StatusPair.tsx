type StatusPairProps = {
  /** Tone slug, e.g. `success`, `warning`, `danger`, `info`, `neutral`, `ai`. */
  tone: string
  /** Sample label rendered inside the pill. */
  label: string
}

/**
 * Renders a pill using `--status-<tone>-bg` + `--status-<tone>-fg` so the same
 * tile reflects light/dark theme overrides without re-keying.
 */
export function StatusPair({ tone, label }: StatusPairProps) {
  const bg = `var(--status-${tone}-bg)`
  const fg = `var(--status-${tone}-fg)`
  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium"
        style={{ background: bg, color: fg }}
      >
        {label}
      </span>
      <code className="font-mono text-[11px] text-muted-foreground">
        --status-{tone}-bg / --status-{tone}-fg
      </code>
    </div>
  )
}
