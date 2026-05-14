import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProfileMenu } from '@/components/organisms/profile-menu.tsx'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta: Meta = {
  title: 'Organisms/ProfileMenu',
  component: ProfileMenu,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <ProfileMenu
      trigger={
        <Button variant="ghost" className="gap-2 px-2">
          <Avatar className="size-7">
            <AvatarFallback>LN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left leading-tight">
            <span className="text-sm font-semibold">Linh Nguyen</span>
            <span className="text-[11px] text-muted-foreground">Receptionist</span>
          </div>
        </Button>
      }
      signedInAs={{ name: 'Linh Nguyen', role: 'Receptionist' }}
      onSignOut={() => alert('Signed out')}
    >
      <DropdownMenuItem>
        <Icon name="tabler:user" />
        My profile
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Icon name="tabler:settings" />
        Preferences
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Icon name="tabler:help-circle" />
        Help &amp; shortcuts
      </DropdownMenuItem>
    </ProfileMenu>
  ),
}
