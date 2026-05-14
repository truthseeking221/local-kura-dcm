import { type FormEvent, type ReactNode, useEffect, useState } from 'react'

import { cn } from '../../lib/cn.ts'
import { Icon } from '../atoms/icon.tsx'
import { OtpInput } from '../molecules/otp-input.tsx'
import { Button } from '../ui/button.tsx'

type VerifyEmailCardProps = {
  /** Email the verification code was sent to — rendered serif under the title. */
  email: string
  /** Controlled OTP value (digits only). */
  code: string
  /** Fires with the next OTP value on every keystroke / paste. */
  onCodeChange: (next: string) => void
  /** Submit handler — fires on form submit AND on clicking the Verify button. */
  onVerify: () => void
  /** When `true`, the Verify button shows the loading spinner + "Verifying…". */
  isVerifying: boolean
  /** Inline error rendered below the Verify button — typically a `<Banner tone="danger">`. */
  error?: ReactNode
  /** Resend-link click handler. */
  onResend: () => void
  /**
   * When supplied (future > now), the resend link is replaced by a
   * non-interactive countdown caption that decrements every second
   * ("Try sending again in 28s.").
   */
  resendDisabledUntil?: Date
  /** Outer card className override. */
  className?: string
}

/**
 * VerifyEmailCard — verify-code surface paired with the existing `OtpInput`
 * molecule. Stateless and controlled — the consumer owns the code + verifying
 * state.
 *
 * The user always presses the Verify button explicitly; the card does NOT
 * auto-call `onVerify` when the 6-digit code completes (button-explicit
 * verification is the canonical pattern for screen-reader accessibility).
 *
 * Card width is density-aware (380 / 460 / 540 px) — see `SignInCard`.
 */
function VerifyEmailCard({
  email,
  code,
  onCodeChange,
  onVerify,
  isVerifying,
  error,
  onResend,
  resendDisabledUntil,
  className,
}: VerifyEmailCardProps) {
  const canVerify = code.length === 6 && !isVerifying

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canVerify) return
    onVerify()
  }

  return (
    <section
      data-slot="verify-email-card"
      className={cn(
        'w-[460px] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)]',
        "[[data-density='compact']_&]:w-[380px]",
        "[[data-density='comfortable']_&]:w-[540px]",
        className,
      )}
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1 text-center">
          <h2 className="text-k-lg font-semibold text-[var(--ink-900)]">
            Enter the verification code sent to
          </h2>
          <p className="text-k-h font-semibold text-[var(--brand-500)] break-all">{email}</p>
        </div>

        <div className="flex justify-center">
          <OtpInput
            length={6}
            value={code}
            onChange={onCodeChange}
            disabled={isVerifying}
            autoFocus
            ariaLabel="Verification code"
          />
        </div>

        <Button type="submit" disabled={!canVerify} className="h-11 w-full">
          {isVerifying ? (
            <>
              <Icon name="tabler:loader-2" size={16} className="animate-spin" aria-hidden />
              <span>Verifying…</span>
            </>
          ) : (
            <span>Verify</span>
          )}
        </Button>

        {error ? <div>{error}</div> : null}

        <p className="text-center text-k-body text-[var(--ink-500)]">
          Not seeing the email in your inbox?{' '}
          <ResendLink onResend={onResend} resendDisabledUntil={resendDisabledUntil} />
        </p>
      </form>
    </section>
  )
}

/**
 * Resend link / countdown caption. When `resendDisabledUntil` is in the
 * future, renders as a non-interactive countdown text that decrements every
 * second. Otherwise renders as an inline link.
 */
function ResendLink({
  onResend,
  resendDisabledUntil,
}: {
  onResend: () => void
  resendDisabledUntil?: Date
}) {
  const [now, setNow] = useState(() => Date.now())
  const target = resendDisabledUntil ? resendDisabledUntil.getTime() : 0
  const remainingMs = Math.max(0, target - now)
  const remainingSeconds = Math.ceil(remainingMs / 1000)
  const isCoolingDown = remainingMs > 0

  useEffect(() => {
    if (!isCoolingDown) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [isCoolingDown])

  if (isCoolingDown) {
    return (
      <span className="tabular-nums text-[var(--ink-500)]">
        Try sending again in {remainingSeconds}s.
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onResend}
      className="font-medium text-[var(--color-text-link)] underline hover:text-[var(--color-text-link-hover)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-[var(--radius-sm)]"
    >
      Try sending again.
    </button>
  )
}

export { VerifyEmailCard, type VerifyEmailCardProps }
