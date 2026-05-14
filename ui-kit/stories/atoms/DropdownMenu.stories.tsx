import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Icon } from '@/components/atoms/icon.tsx'
import { SectionLabel } from '@/components/atoms/section-label.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'

const meta = {
  title: 'Atoms/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const ProfileMenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <Avatar className="size-7">
            <AvatarFallback>LN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left leading-tight">
            <span className="text-sm font-semibold">Linh Nguyen</span>
            <span className="text-[11px] text-muted-foreground">Receptionist</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col leading-tight">
            <SectionLabel>Signed in as</SectionLabel>
            <span className="text-sm font-semibold">Linh Nguyen</span>
            <span className="text-xs text-muted-foreground">Receptionist</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
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
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Icon name="tabler:logout" />
          Sign out
          <Icon name="tabler:chevron-right" className="ml-auto" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
