import { useEffect, useState } from 'react'

import { cn } from '../../lib/cn.ts'
import { Icon } from '../atoms/icon.tsx'
import { MailProviderTile } from '../molecules/mail-provider-tile.tsx'

const checkInboxIconUrl = new URL('../../assets/kura-auth-check-inbox-icon.png', import.meta.url).href
const outlookLogoUrl = new URL('../../assets/outlook.svg', import.meta.url).href

type CheckInboxCardProps = {
  /** Email the magic link was sent to — rendered serif under the title. */
  email: string
  /** Tile click — typically navigates to https://mail.google.com (Gmail). */
  onOpenGmail: () => void
  /** Tile click — typically navigates to https://outlook.live.com (Outlook). */
  onOpenOutlook: () => void
  /** "Enter verification code" link — navigates to the consumer's `/verify` route. */
  onEnterCode: () => void
  /** "Resend email" link click handler. */
  onResend: () => void
  /** When `true`, the resend link is disabled and shows a spinner. */
  isResending: boolean
  /**
   * When supplied (future > now), the resend link is replaced by a
   * non-interactive countdown caption that decrements every second.
   */
  resendDisabledUntil?: Date
  /** Outer card className override. */
  className?: string
}

/**
 * CheckInboxCard — "we sent you a magic link" surface. Centered secure inbox
 * icon → "To continue, click the link sent to" → serif email echo →
 * 2-column grid of `MailProviderTile` (Gmail / Outlook) → text action links
 * (enter code manually / resend email).
 *
 * Stateless and controlled — the consumer owns the resending state. Card
 * width is density-aware (380 / 460 / 540 px) — see `SignInCard`.
 */
function CheckInboxCard({
  email,
  onOpenGmail,
  onOpenOutlook,
  onEnterCode,
  onResend,
  isResending,
  resendDisabledUntil,
  className,
}: CheckInboxCardProps) {
  return (
    <section
      data-slot="check-inbox-card"
      className={cn(
        'w-[460px] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)]',
        "[[data-density='compact']_&]:w-[380px]",
        "[[data-density='comfortable']_&]:w-[540px]",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <img
          src={checkInboxIconUrl}
          alt=""
          aria-hidden
          className="block size-24 object-contain"
        />

        <div className="space-y-1 text-center">
          <p className="text-k-lg font-semibold text-[var(--ink-900)]">
            To continue, click the link sent to
          </p>
          <p className="text-k-h font-semibold text-[var(--brand-500)] break-all">{email}</p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 pt-2">
          <MailProviderTile
            icon={<Icon name="logos:google-gmail" strokeWidth={null} />}
            label="Open Gmail"
            href="https://mail.google.com"
            onClick={(event) => {
              event.preventDefault()
              onOpenGmail()
            }}
          />
          <MailProviderTile
            icon={<img src={outlookLogoUrl} alt="" />}
            label="Open Outlook"
            href="https://outlook.live.com"
            onClick={(event) => {
              event.preventDefault()
              onOpenOutlook()
            }}
          />
        </div>

        <div className="flex w-full flex-col items-center gap-2 pt-2 text-k-body">
          <button
            type="button"
            onClick={onEnterCode}
            className="font-medium text-[var(--color-text-link)] underline hover:text-[var(--color-text-link-hover)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-[var(--radius-sm)]"
          >
            Enter verification code
          </button>
          <ResendAction
            onResend={onResend}
            isResending={isResending}
            resendDisabledUntil={resendDisabledUntil}
          />
        </div>
      </div>
    </section>
  )
}

/**
 * Resend action — flips between three render modes:
 *   1. cooldown countdown (non-interactive, decrements every second)
 *   2. resending state (disabled link + leading spinner)
 *   3. interactive link
 */
function ResendAction({
  onResend,
  isResending,
  resendDisabledUntil,
}: {
  onResend: () => void
  isResending: boolean
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
        Resend email in {remainingSeconds}s.
      </span>
    )
  }

  if (isResending) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[var(--ink-500)]">
        <Icon name="tabler:loader-2" size={14} className="animate-spin" aria-hidden />
        Resending email…
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onResend}
      className="font-medium text-[var(--color-text-link)] underline hover:text-[var(--color-text-link-hover)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-[var(--radius-sm)]"
    >
      Resend email
    </button>
  )
}

export { CheckInboxCard, type CheckInboxCardProps }
