import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChecklistItem } from '@/components/molecules/checklist-item.tsx'

const meta = {
  title: 'Molecules/ChecklistItem',
  component: ChecklistItem,
  tags: ['autodocs'],
  args: { title: "Today's visit", status: 'pending', meta: 'PENDING' },
  argTypes: {
    status: { control: 'inline-radio', options: ['pending', 'done', 'skipped'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ChecklistItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const VisitDetailsList: Story = {
  render: () => (
    <ul className="w-[560px] divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card">
      {[
        ['pending', "Today's visit"],
        ['pending', 'Pre-test prep'],
        ['pending', 'Medications & supplements'],
        ['pending', "Women's health"],
        ['pending', 'Recent health events'],
        ['pending', 'Lifestyle snapshot'],
        ['pending', 'Sample comfort'],
        ['done', 'Consent & sensitive tests'],
      ].map(([status, title]) => (
        <li key={String(title)}>
          <ChecklistItem
            status={status as 'pending' | 'done'}
            title={title}
            meta={status === 'done' ? 'No sensitive tests' : 'PENDING'}
          />
        </li>
      ))}
    </ul>
  ),
}

export const StatusVariants: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-1 rounded-[var(--radius-lg)] border border-border bg-card p-1">
      <ChecklistItem status="pending" title="Pending item" meta="PENDING" />
      <ChecklistItem status="done" title="Done item" meta="2 min" />
      <ChecklistItem status="skipped" title="Skipped item" meta="N/A" />
    </div>
  ),
}
