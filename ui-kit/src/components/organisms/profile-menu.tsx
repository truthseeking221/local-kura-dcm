import { type ReactNode } from 'react'

import { Icon } from '../atoms/icon.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.tsx'

type SignedInUser = {
  /** Display name. */
  name: string
  /** Optional role label rendered under the name. */
  role?: string
}

type ProfileMenuProps = {
  /** Trigger — typically the avatar + name button. */
  trigger: ReactNode
  /** Currently signed-in user. */
  signedInAs: SignedInUser
  /** Additional menu items rendered between the header and the sign-out row. */
  children?: ReactNode
  /** Fires when the user clicks Sign out. Required. */
  onSignOut: () => void
  /** Override the sign-out row label. */
  signOutLabel?: ReactNode
  /** Eyebrow label above the user name. */
  signedInLabel?: ReactNode
  /** Popover alignment. Defaults to `end`. */
  align?: 'start' | 'center' | 'end'
}

/**
 * ProfileMenu — popover with `SIGNED IN AS` eyebrow, name + role, divider,
 * arbitrary middle items, and a destructive Sign-out row.
 *
 * Children should be a list of `<DropdownMenuItem>`s (re-exported from
 * `@kura/ui-kit/ui/dropdown-menu`) or `DropdownMenuSeparator`s.
 */
function ProfileMenu({
  trigger,
  signedInAs,
  children,
  onSignOut,
  signOutLabel = 'Sign out',
  signedInLabel = 'Signed in as',
  align = 'end',
}: ProfileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col leading-tight">
            <span className="text-k-xs font-semibold uppercase tracking-k-caps text-muted-foreground">
              {signedInLabel}
            </span>
            <span className="text-sm font-semibold">{signedInAs.name}</span>
            {signedInAs.role ? (
              <span className="text-xs text-muted-foreground">{signedInAs.role}</span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        {children ? (
          <>
            <DropdownMenuSeparator />
            {children}
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onSignOut}>
          <Icon name="tabler:logout" />
          {signOutLabel}
          <Icon name="tabler:chevron-right" className="ml-auto" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ProfileMenu, type SignedInUser }
