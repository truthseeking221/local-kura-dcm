import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/ui/button.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
import { SectionLabel } from '@/components/atoms/section-label.tsx'
const meta = {
  title: 'Atoms/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          PSC-01
          <Icon name="tabler:chevron-down" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <SectionLabel as="div" className="block border-b border-border px-3 py-2">
          Station
        </SectionLabel>
        <ul className="p-1.5">
          {[
            ['PSC-01 · Main reception', 'Main reception', true],
            ['PSC-02 · Triage desk', 'Triage desk', false],
            ['PSC-03 · Express counter', 'Express counter', false],
          ].map(([primary, secondary, active]) => (
            <li key={String(primary)}>
              <button
                type="button"
                data-active={active || undefined}
                className="flex w-full flex-col items-start rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left hover:bg-accent data-[active]:bg-accent"
              >
                <span className="text-sm font-medium">{primary}</span>
                <span className="text-xs text-muted-foreground">{secondary}</span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  ),
}
