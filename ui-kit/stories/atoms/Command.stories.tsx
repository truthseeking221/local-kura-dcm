import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon } from '@/components/atoms/icon.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command.tsx'

const meta = {
  title: 'Atoms/Command',
  component: Command,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Command className="w-[480px] rounded-[var(--radius-lg)] border border-border bg-card shadow-md">
      <CommandInput placeholder="Search patient, phone, VID, booking" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        <CommandGroup heading="Recent">
          <CommandItem>
            <Icon name="tabler:clock" />
            Sok Sreymom
            <span className="ml-auto text-xs text-muted-foreground">Q-001</span>
          </CommandItem>
          <CommandItem>
            <Icon name="tabler:user" />
            Bao Nguyen
            <span className="ml-auto text-xs text-muted-foreground">Q-014</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick action">
          <CommandItem>
            <Icon name="tabler:plus" />
            New walk-in
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icon name="tabler:calendar" />
            Open today's queue
            <CommandShortcut>⌘Q</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}
