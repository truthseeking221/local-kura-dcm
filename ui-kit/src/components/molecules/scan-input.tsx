import {
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
  useCallback,
  useId,
} from 'react'

import { Kbd } from '../atoms/kbd.tsx'
import { Input } from '../ui/input.tsx'
import { cn } from '../../lib/cn.ts'
import { tintedRing } from '../../lib/tokens.ts'

import { Icon } from '../atoms/icon.tsx'
type ScanInputState = 'default' | 'success' | 'error'

const STATE_BORDER: Record<ScanInputState, string> = {
  default: '',
  success:
    'border-[var(--status-success-fg)] focus-visible:border-[var(--status-success-fg)] focus-visible:ring-[var(--status-success-fg)]/40',
  error:
    'border-[var(--status-danger-fg)] focus-visible:border-[var(--status-danger-fg)] focus-visible:ring-[var(--status-danger-fg)]/40',
}

const STATE_RING_COLOR: Record<Exclude<ScanInputState, 'default'>, string> = {
  success: 'var(--status-success-fg)',
  error: 'var(--status-danger-fg)',
}

const STATE_ICON: Record<Exclude<ScanInputState, 'default'>, string> = {
  success: 'tabler:circle-check',
  error: 'tabler:alert-triangle',
}

const STATE_HELPER_CLASS: Record<Exclude<ScanInputState, 'default'>, string> = {
  success: 'text-[var(--status-success-fg)]',
  error: 'text-[var(--status-danger-fg)]',
}

type ScanInputBaseProps = Omit<ComponentProps<typeof Input>, 'type' | 'onChange'> & {
  /** Controlled value (optional). When set together with `onChange`, the component is fully controlled. */
  value?: string
  /** Fires on every keystroke. */
  onChange?: (value: string) => void
  /** Fires when Enter is pressed and the input has a non-empty trimmed value. Required. */
  onScan: (value: string) => void
  /** Clears the input after `onScan`. Defaults to `true`. */
  clearOnScan?: boolean
  /** Override the leading icon. Defaults to `ScanLine`. */
  icon?: string
}

// Discriminated union: when `state` is non-default, `helperText` is required.
// This is how "status by color alone is forbidden" (CLAUDE.md brand rule) is
// enforced at compile time — TypeScript refuses to build a `state="success"`
// call without a paired label, so the icon-+-label rule cannot be skipped by
// accident.
type ScanInputProps =
  | (ScanInputBaseProps & {
      /** Visual feedback state. `default` skips the success/error chrome. */
      state?: 'default'
      /** Optional sub-line below the input. Renders in `text-muted-foreground` when present. */
      helperText?: string
    })
  | (ScanInputBaseProps & {
      /** Visual feedback state. `success` and `error` apply transient colour treatment. */
      state: 'success' | 'error'
      /** **Required** when `state` is `'success'` or `'error'` — pairs colour with a label per brand rules. */
      helperText: string
    })

/**
 * ScanInput — barcode/scanner-driven input with a leading scan icon, an
 * `Enter` keycap hint, and optional success/error feedback.
 *
 * Designed for kiosk and operator workflows: tube-barcode scan in phlebo,
 * patient-ID or booking-code scan in receptionist. The component owns the
 * transient visual feedback (border + helper colour transition over ~250 ms);
 * the caller decides when each state fires.
 *
 * Brand-rule note: when `state` is `success` or `error`, `helperText` should
 * be provided and is paired with a status icon — colour alone never carries
 * the signal.
 */
function ScanInput({
  value,
  onChange,
  onScan,
  clearOnScan = true,
  state = 'default',
  helperText,
  icon = 'tabler:scan',
  placeholder = 'Scan barcode',
  className,
  disabled,
  onKeyDown,
  ...rest
}: ScanInputProps) {
  const helperId = useId()

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.value)
    },
    [onChange],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        const current = (event.currentTarget.value ?? '').trim()
        if (current.length > 0) {
          event.preventDefault()
          onScan(current)
          if (clearOnScan) {
            onChange?.('')
            event.currentTarget.value = ''
          }
        }
      }
      onKeyDown?.(event)
    },
    [clearOnScan, onChange, onKeyDown, onScan],
  )

  const statusIconName = state !== 'default' ? STATE_ICON[state] : null

  return (
    <div
      data-slot="scan-input"
      data-state={state}
      data-disabled={disabled ? '' : undefined}
      className={cn('w-full', className)}
    >
      <div className="relative">
        <Icon
          name={icon}
          size={16}
          strokeWidth={1.5}
          aria-hidden
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
            disabled && 'opacity-50',
          )}
        />
        <Input
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-describedby={helperText ? helperId : undefined}
          disabled={disabled}
          className={cn(
            'pl-9 pr-16 transition-[border-color,box-shadow] duration-200',
            STATE_BORDER[state],
          )}
          style={
            state !== 'default'
              ? { boxShadow: tintedRing({ color: STATE_RING_COLOR[state] }) }
              : undefined
          }
          {...rest}
        />
        <span
          className={cn(
            'pointer-events-none absolute right-2 top-1/2 -translate-y-1/2',
            disabled && 'opacity-50',
          )}
        >
          <Kbd>Enter</Kbd>
        </span>
      </div>
      {helperText ? (
        <p
          id={helperId}
          className={cn(
            'mt-1.5 flex items-center gap-1.5 text-xs',
            state === 'default' ? 'text-muted-foreground' : STATE_HELPER_CLASS[state],
          )}
        >
          {statusIconName ? <Icon name={statusIconName} size={14} strokeWidth={1.75} aria-hidden /> : null}
          <span>{helperText}</span>
        </p>
      ) : null}
    </div>
  )
}

export { ScanInput, type ScanInputState }
