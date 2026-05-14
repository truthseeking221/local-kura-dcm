import type { Meta, StoryObj } from '@storybook/react-vite'

import { StatusDot } from '@/components/atoms/status-dot.tsx'

const meta = {
  title: 'Atoms/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
  args: { tone: 'success', size: 8 },
  argTypes: {
    tone: { control: 'select', options: ['success', 'warning', 'danger', 'info', 'neutral', 'ai'] },
    size: { control: { type: 'range', min: 4, max: 16, step: 1 } },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof StatusDot>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(['success', 'warning', 'danger', 'info', 'neutral', 'ai'] as const).map((tone) => (
        <div key={tone} className="flex items-center gap-2 text-sm">
          <StatusDot tone={tone} />
          <span className="capitalize">{tone}</span>
        </div>
      ))}
    </div>
  ),
}

export const InFilterChips: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {(
        [
          ['danger', 'Needs attention', 0],
          ['info', 'In progress', 1],
          ['success', 'Done', 1],
        ] as const
      ).map(([tone, label, count]) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs"
        >
          <StatusDot tone={tone} />
          {label}
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{count}</span>
        </span>
      ))}
    </div>
  ),
}
