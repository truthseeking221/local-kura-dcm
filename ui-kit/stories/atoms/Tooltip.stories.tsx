import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  decorators: [(Story) => (<TooltipProvider><Story /></TooltipProvider>)],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="What's this?">
          <Icon name="tabler:info" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Tracks HbA1c trend plus end-organ markers.</TooltipContent>
    </Tooltip>
  ),
}

export const OnText: Story = {
  render: () => (
    <p className="max-w-md text-sm">
      Slots are based on{' '}
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help underline decoration-dotted">estimated result availability</span>
        </TooltipTrigger>
        <TooltipContent>Calculated from current lab queue load + the slowest test in the cart.</TooltipContent>
      </Tooltip>
      . We'll notify the patient if the lab is delayed.
    </p>
  ),
}
