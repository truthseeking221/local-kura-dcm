import { type FormEvent, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'
import { LabelSeparator } from '../atoms/label-separator.tsx'
import { Icon } from '../atoms/icon.tsx'
import { AuthProviderButton } from '../molecules/auth-provider-button.tsx'
import { Button } from '../ui/button.tsx'
import { Input } from '../ui/input.tsx'

type SignInProviderConfig = {
  /** Stable identifier — informational, not used for theming. Day-one `'google'` / `'telegram'`. */
  id: 'google' | 'telegram' | (string & {})
  /** Localised label, e.g. "Continue with Google". */
  label: string
  /** Provider icon — typically `<Icon name="logos:google-icon" strokeWidth={null} />`. */
  icon: ReactNode
  /** Click handler — opens the provider's OAuth/OTP flow. */
  onClick: () => void
}

type SignInCardProps = {
  /** Controlled email value. */
  email: string
  /** Fires on every keystroke; receives the next email value. */
  onEmailChange: (next: string) => void
  /**
   * Additional sign-in providers rendered above the email row. When the array
   * is empty (or omitted) the card renders email-only and the "OR" separator
   * is suppressed.
   */
  providers?: SignInProviderConfig[]
  /** Submit handler — fires on form submit AND on clicking the Continue button. */
  onSubmitEmail: () => void
  /** When `true`, the submit button shows the loading spinner + "Sending…". */
  isSubmitting: boolean
  /** Inline error rendered below the submit button — typically a `<Banner tone="danger">`. */
  error?: ReactNode
  /** Privacy policy link target. Required — apps must supply. */
  privacyPolicyHref: string
  /** Outer card className override. */
  className?: string
}

/**
 * SignInCard — the canonical Kura sign-in surface. Renders an optional row of
 * provider buttons (Google / Telegram / future), a "OR" separator, an email
 * input, a brand-tinted submit button, and a privacy-policy line.
 *
 * Stateless and controlled — the consumer owns the email + submitting state
 * and routes the submit through whatever auth runtime they wire (`@kura/auth`,
 * direct API call, etc.). Day-one configuration is email-only: pass
 * `providers={[]}` (or omit) to render the email row alone.
 *
 * Card width is density-aware: 380 px at compact, 460 px at cozy (default),
 * 540 px at comfortable — driven by `[data-density]` attribute selectors on
 * the document root (set by the Storybook toolbar or the consumer app shell).
 */
function SignInCard({
  email,
  onEmailChange,
  providers,
  onSubmitEmail,
  isSubmitting,
  error,
  privacyPolicyHref,
  className,
}: SignInCardProps) {
  const hasProviders = !!providers && providers.length > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    onSubmitEmail()
  }

  return (
    <section
      data-slot="sign-in-card"
      className={cn(
        'w-[460px] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)]',
        "[[data-density='compact']_&]:w-[380px]",
        "[[data-density='comfortable']_&]:w-[540px]",
        className,
      )}
    >
      <form className="space-y-3" onSubmit={handleSubmit} noValidate>
        {hasProviders ? (
          <>
            <div className="space-y-2">
              {providers!.map((provider) => (
                <AuthProviderButton
                  key={provider.id}
                  icon={provider.icon}
                  label={provider.label}
                  onClick={provider.onClick}
                  disabled={isSubmitting}
                />
              ))}
            </div>
            <LabelSeparator>OR</LabelSeparator>
          </>
        ) : null}

        <div className="space-y-1.5">
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => onEmailChange(event.currentTarget.value)}
            disabled={isSubmitting}
            aria-label="Email address"
            className="h-11"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || email.trim().length === 0}
          className="h-11 w-full"
        >
          {isSubmitting ? (
            <>
              <Icon name="tabler:loader-2" size={16} className="animate-spin" aria-hidden />
              <span>Sending…</span>
            </>
          ) : (
            <span>Continue with email</span>
          )}
        </Button>

        {error ? <div>{error}</div> : null}

        <p className="pt-1 text-center text-k-body text-[var(--ink-500)]">
          By continuing, you acknowledge Kura's{' '}
          <a
            href={privacyPolicyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--color-text-link)] underline hover:text-[var(--color-text-link-hover)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-[var(--radius-sm)]"
          >
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </section>
  )
}

export { SignInCard, type SignInCardProps, type SignInProviderConfig }
