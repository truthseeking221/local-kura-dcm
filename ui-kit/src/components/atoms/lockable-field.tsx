import { type ComponentProps, useId } from 'react'

import { cn } from '../../lib/cn.ts'
import { Input } from '../ui/input.tsx'

import { Icon } from './icon.tsx'
type LockableFieldProps = ComponentProps<typeof Input> & {
  /** When true: input is `readOnly`, a trailing lock icon renders, and the lock explanation is exposed via `aria-describedby`. */
  locked?: boolean
  /** Visually-hidden description announced to assistive tech when `locked`. */
  lockedDescription?: string
}

/**
 * Input variant: when `locked`, renders a trailing lock icon, sets
 * `readOnly` (focusable, value still submitted), and exposes the lock
 * explanation via `aria-describedby` to assistive tech.
 *
 * Why `readOnly` and not `disabled`: an auto-filled-from-ID field is part
 * of the form, IS submitted, and must be focusable so a screen-reader user
 * can encounter the value and the lock affordance. `disabled` would remove
 * the field from the tab order and from form data — wrong semantics for
 * "locked but real".
 *
 * @kuraModules receptionist, phlebo
 */
function LockableField({
  locked = false,
  lockedDescription = 'Locked — auto-filled. Unlock to edit.',
  className,
  ...props
}: LockableFieldProps) {
  const descId = useId()

  if (!locked) {
    return <Input {...props} className={className} />
  }

  return (
    <div className="relative">
      <Input
        {...props}
        readOnly
        aria-describedby={descId}
        data-locked
        className={cn('pr-9', className)}
      />
      <span id={descId} className="sr-only">
        {lockedDescription}
      </span>
      <Icon
        name="tabler:lock"
        size={14}
        strokeWidth={1.75}
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

export { LockableField }
