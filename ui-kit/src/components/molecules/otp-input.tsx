import {
  type ClipboardEvent,
  type ComponentProps,
  type KeyboardEvent,
  useEffect,
  useRef,
} from 'react'

import { cn } from '../../lib/cn.ts'

type OtpInputProps = Omit<ComponentProps<'div'>, 'onChange' | 'children'> & {
  /** Total number of digits. Defaults to 6. */
  length?: number
  /** Current value (digits only). May be shorter than `length` while typing. */
  value: string
  /** Fired with the next value on every change. */
  onChange: (next: string) => void
  /** Fired once when the value reaches `length` digits — useful for auto-submit. */
  onComplete?: (code: string) => void
  /** Disables every box. */
  disabled?: boolean
  /** Focuses the first empty box on mount. */
  autoFocus?: boolean
  /** ARIA label for the group. Defaults to "One-time code". */
  ariaLabel?: string
}

/**
 * OtpInput — segmented N-digit code input with auto-advance, backspace
 * navigation, paste support (full-code paste fills every box), and an
 * `onComplete` callback that fires once the full code is entered.
 *
 * Pure input — pair with a Verify button + Resend countdown in your form
 * (see the receptionist flow's mobile-verification step).
 */
function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled,
  autoFocus,
  ariaLabel = 'One-time code',
  className,
  ...props
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  useEffect(() => {
    if (!autoFocus) return
    const firstEmpty = digits.findIndex((d) => !d)
    refs.current[firstEmpty === -1 ? length - 1 : firstEmpty]?.focus()
    // We deliberately only focus on first mount + when length changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus, length])

  function commit(next: string) {
    onChange(next)
    if (next.length === length) onComplete?.(next)
  }

  function setDigitAt(index: number, digit: string) {
    const chars = digits.slice()
    chars[index] = digit
    while (chars.length && chars[chars.length - 1] === '') chars.pop()
    commit(chars.join(''))
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1)
    if (!digit) {
      setDigitAt(index, '')
      return
    }
    setDigitAt(index, digit)
    if (index < length - 1) refs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      refs.current[index - 1]?.focus()
      setDigitAt(index - 1, '')
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      refs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault()
      refs.current[index + 1]?.focus()
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    event.preventDefault()
    const next = pasted.slice(0, length)
    commit(next)
    refs.current[Math.min(next.length, length - 1)]?.focus()
  }

  return (
    <div
      data-slot="otp-input"
      role="group"
      aria-label={ariaLabel}
      className={cn('inline-flex items-center gap-2', className)}
      {...props}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.currentTarget.select()}
          className={cn(
            'h-10 w-10 rounded-[var(--radius-sm)] border border-border bg-card text-center font-mono text-base tabular-nums shadow-[var(--shadow-xs)] outline-none transition-[box-shadow,border-color]',
            'focus-visible:border-[var(--border-focus)] focus-visible:shadow-[var(--shadow-focus)]',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        />
      ))}
    </div>
  )
}

export { OtpInput }
