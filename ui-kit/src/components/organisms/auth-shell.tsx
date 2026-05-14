import { type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type AuthShellProps = {
  /**
   * Brand mark for the header. Defaults to the 40 × 40 dark-square Kura
   * lockup composed from the inlined `kura-logo.svg` paths (recoloured to
   * white inside the dark container). Pass any `ReactNode` to override
   * (consumer logo, alternate mark, etc.).
   */
  logo?: ReactNode
  /** Optional tiny-caps eyebrow above the card, e.g. "SIGN IN TO CONTINUE TO KURA". */
  eyebrow?: string
  /**
   * The card content slot — typically `<SignInCard>` / `<VerifyEmailCard>` /
   * `<CheckInboxCard>` / a `<Skeleton>` while the auth callback is in flight.
   */
  children: ReactNode
  /**
   * Optional footer line below the card, e.g. "Kura · Receptionist". Omit
   * to render the auth surface without a footer (the default for most apps).
   */
  footer?: string
  /** Class hook for the outer wrapper. */
  className?: string
}

/**
 * AuthShell — full-viewport auth layout preset shared by every Kura app's
 * `/sign-in`, `/check-inbox`, `/verify`, and `/callback` routes. Centered
 * vertical stack: logo / optional eyebrow → card slot → optional footer. Stateless and
 * slot-driven; the card child owns its own (density-aware) width.
 *
 * Page canvas resolves to `--bg` (the canonical canvas alias) so it flips
 * automatically under `[data-theme="dark"]`.
 */
function AuthShell({ logo, eyebrow, children, footer, className }: AuthShellProps) {
  return (
    <div
      data-slot="auth-shell"
      className={cn(
        'flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-[var(--bg)] px-4 py-12',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        {logo ?? <AuthShellDefaultLogo />}
        {eyebrow ? (
          <span className="text-k-xs font-semibold uppercase tracking-k-caps text-[var(--ink-700)]">
            {eyebrow}
          </span>
        ) : null}
      </div>
      {children}
      {footer ? <p className="text-k-body text-[var(--ink-500)]">{footer}</p> : null}
    </div>
  )
}

/**
 * Default Kura lockup — 40 × 40 dark `--ink-900` square containing the
 * inlined `kura-logo.svg` glyph paths cast to `--ink-0` via `fill="currentColor"`.
 * The source asset's navy + cyan fills are replaced here so the mark renders
 * white-on-dark inside the auth lockup, leaving the original asset untouched
 * for full-colour brand usage elsewhere.
 */
function AuthShellDefaultLogo() {
  return (
    <span
      data-slot="auth-shell-logo"
      aria-hidden
      className="inline-flex size-[40px] items-center justify-center rounded-[var(--radius)] bg-[var(--ink-900)]"
    >
      <svg
        viewBox="0 0 427 426"
        width="22"
        height="22"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[var(--ink-0)]"
      >
        <path d="M139.09 38.2648L134.557 42.8629V107.236V171.61H73.8905C5.8905 171.61 5.35716 171.61 1.8905 180.265C0.290497 184.051 -0.109503 191.354 0.0238303 213.804C0.157164 229.627 0.557164 244.097 1.0905 245.99C1.62383 247.884 4.02383 250.724 6.42383 252.347L10.9572 255.457H69.4905C133.891 255.457 132.157 255.592 139.224 247.072C141.224 244.638 154.024 230.979 167.757 216.914C181.357 202.714 197.491 185.945 203.624 179.589L214.557 167.823V105.343V42.8629L210.024 38.2648L205.491 33.6667H174.557H143.624L139.09 38.2648Z" />
        <path d="M326.69 47.4609C320.957 53.6818 299.624 77.4837 279.224 100.609C258.824 123.6 239.757 145.238 236.69 148.619C224.69 162.008 222.69 164.848 223.49 167.147C224.024 168.499 224.957 169.987 225.757 170.528C228.424 172.421 310.957 171.745 314.024 169.851C315.624 168.905 341.624 140.099 371.757 105.613C413.624 57.8742 426.557 42.3218 426.29 40.0228L425.89 37.0475L381.49 36.6418L337.224 36.3714L326.69 47.4609Z" />
        <path d="M137.224 259.514C134.69 262.084 134.557 263.977 134.557 321.724C134.557 385.286 134.69 387.179 141.09 390.695C142.69 391.507 156.157 392.048 175.224 392.048H206.824L210.69 388.126L214.557 384.204V323.211V262.354L211.09 259.65C207.757 256.945 205.89 256.81 173.757 256.81C141.624 256.81 139.757 256.945 137.224 259.514Z" />
        <path d="M224.69 258.838C220.957 262.76 218.024 258.703 257.757 303.467C314.29 367.029 335.09 389.613 337.757 390.425C339.357 390.966 359.757 391.101 383.224 390.695C424.69 389.884 425.89 389.884 426.29 387.314C426.424 385.827 424.69 382.446 422.424 379.876C420.157 377.307 412.424 368.381 405.224 360.267C398.024 352.017 383.89 335.924 373.757 324.293C363.49 312.798 348.024 295.217 339.224 285.21C330.424 275.337 321.357 264.924 318.957 262.354L314.824 257.486L270.824 257.08C231.89 256.81 226.557 256.945 224.69 258.838Z" />
      </svg>
    </span>
  )
}

export { AuthShell, type AuthShellProps }
