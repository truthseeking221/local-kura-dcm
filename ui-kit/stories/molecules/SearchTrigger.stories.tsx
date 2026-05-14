import type { Meta, StoryObj } from '@storybook/react-vite'

import { Kbd } from '@/components/atoms/kbd.tsx'
import { SearchTrigger } from '@/components/molecules/search-trigger.tsx'

const meta = {
  title: 'Molecules/SearchTrigger',
  component: SearchTrigger,
  tags: ['autodocs', 'module:receptionist', 'module:phlebo'],
  args: {
    placeholder: 'Search patient, phone, VID, booking',
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SearchTrigger>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[480px]">
      <SearchTrigger
        placeholder="Search patient, phone, VID, booking"
        onClick={() => {}}
      />
    </div>
  ),
}

export const WithShortcut: Story = {
  render: () => (
    <div className="w-[480px]">
      <SearchTrigger
        placeholder="Search patient, phone, VID, booking"
        shortcut={<Kbd>⌘K</Kbd>}
        aria-keyshortcuts="Meta+K"
        onClick={() => alert('Open CommandPalette')}
      />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-[480px]">
      <SearchTrigger
        placeholder="Search patient, phone, VID, booking"
        shortcut={<Kbd>⌘K</Kbd>}
        aria-keyshortcuts="Meta+K"
        disabled
        onClick={() => {}}
      />
    </div>
  ),
}
