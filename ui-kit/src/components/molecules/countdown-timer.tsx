import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from 'react'

import { cn } from '../../lib/cn.ts'

type CountdownTimerProps = Omit<ComponentProps<'span'>, 'children'> & {
  /**
   * Total countdown duration in seconds. Re-mount the component (via a
   * different `key` prop) to reset; this avoids the
   * `react-hooks/set-state-in-effect` lint and makes resets explicit.
   */
  seconds: number
  /** Fires once when the timer reaches 0. */
  onComplete?: () => void
  /**
   * Custom formatter for the displayed text. Defaults to a compact
   * seconds-only format ("26s"). Receivers like "Resend in {format}" pass
   * `(s) => s` to inject just the number.
   */
  format?: (remainingSeconds: number) => ReactNode
}

/**
 * Pure-text countdown that ticks down from `seconds` to 0 once per second
 * and calls `onComplete` exactly once. Tabular numerals so the width
 * doesn't shift as digits change.
 *
 * Used by the receptionist's mobile-OTP "Resend in 26s" hint and the
 * KHQR-payment 60-second QR expiry.
 */
function CountdownTimer({
  seconds,
  onComplete,
  format,
  className,
  ...props
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const onCompleteRef = useRef(onComplete)

  // Keep the ref in sync without mutating during render — the
  // `react-hooks/refs` rule rejects render-time ref writes.
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (remaining <= 0) {
      onCompleteRef.current?.()
      return
    }
    const id = setTimeout(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearTimeout(id)
  }, [remaining])

  return (
    <span
      data-slot="countdown-timer"
      className={cn('tabular-nums', className)}
      {...props}
    >
      {format ? format(remaining) : `${remaining}s`}
    </span>
  )
}

export { CountdownTimer }
