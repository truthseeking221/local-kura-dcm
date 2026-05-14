import type { Meta, StoryObj } from '@storybook/react-vite'

import { Skeleton } from '@/components/ui/skeleton.tsx'

const meta = {
  title: 'Atoms/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Skeleton className="h-8 w-48 rounded-[var(--radius)]" />,
}

export const PatientRow: Story = {
  render: () => (
    <div className="flex w-96 items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-4">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3 rounded-[var(--radius-sm)]" />
        <Skeleton className="h-3 w-1/3 rounded-[var(--radius-sm)]" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  ),
}

export const TestList: Story = {
  render: () => (
    <div className="w-[480px] space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-[var(--radius)] border border-border p-3">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-40 rounded-[var(--radius-sm)]" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-12 rounded-[var(--radius-sm)]" />
              <Skeleton className="h-3 w-14 rounded-[var(--radius-sm)]" />
            </div>
          </div>
          <Skeleton className="h-8 w-16 rounded-[var(--radius)]" />
        </div>
      ))}
    </div>
  ),
}
