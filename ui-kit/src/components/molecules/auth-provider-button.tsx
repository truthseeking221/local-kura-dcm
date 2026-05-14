import { type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type AuthProviderButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  /** Required leading icon — typically `<Icon name="logos:google-icon" strokeWidth={null} />`. */
  icon: ReactNode
  /** Localised label, e.g. "Continue with Google". */
  label: string
}

/**
 * AuthProviderButton — full-width outline button used by `SignInCard` to launch
 * a non-email sign-in flow (Google, Telegram, future). One look — provider
 * differentiation is the icon, not the chrome. Renders as a native `<button>`
 * so it inherits standard focus / keyboard semantics.
 */
function AuthProviderButton({
  icon,
  label,
  className,
  type,
  disabled,
  ...props
}: AuthProviderButtonProps) {
  return (
    <button
      data-slot="auth-provider-button"
      type={type ?? 'button'}
      disabled={disabled}
      className={cn(
        'flex h-11 w-full items-center justify-center gap-2.5 rounded-[var(--radius)] border border-border bg-card px-4 text-k-body font-medium text-[var(--ink-900)] transition-colors',
        'hover:bg-[var(--surface-2)]',
        'focus-visible:border-[var(--border-focus)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span aria-hidden className="inline-flex shrink-0 [&>svg]:size-5">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  )
}

export { AuthProviderButton, type AuthProviderButtonProps }
