import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from '@/components/atoms/icon.tsx'
import { ChecklistItem } from '@/components/molecules/checklist-item.tsx'
import { IconBadge } from '@/components/molecules/icon-badge.tsx'
import { StatusPill } from '@/components/molecules/status-pill.tsx'
import { IntakeCard } from '@/components/organisms/intake-card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { cn } from '@/lib/cn.ts'

const meta = {
  title: 'Organisms/IntakeCard',
  component: IntakeCard,
  tags: ['autodocs', 'module:receptionist'],
  args: {
    title: 'Visit Details',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof IntakeCard>

export default meta
type Story = StoryObj<typeof meta>

const TASKS: Array<{
  title: string
  status: 'pending' | 'done' | 'skipped'
  meta: string
}> = [
  { title: "Today's visit", status: 'pending', meta: 'PENDING' },
  { title: 'Pre-test prep', status: 'pending', meta: 'PENDING' },
  { title: 'Medications & supplements', status: 'pending', meta: 'PENDING' },
  { title: "Women's health", status: 'pending', meta: 'PENDING' },
  { title: 'Recent health events', status: 'pending', meta: 'PENDING' },
  { title: 'Lifestyle snapshot', status: 'pending', meta: 'PENDING' },
  { title: 'Sample comfort', status: 'pending', meta: 'PENDING' },
  { title: 'Consent & sensitive tests', status: 'done', meta: 'No sensitive tests' },
]

export const Default: Story = {
  name: 'Step 5 default — 8 pending tasks',
  render: () => (
    <div className="w-[800px]">
      <IntakeCard
        title="Visit Details"
        statusPill={
          <StatusPill tone="neutral" icon={<Icon name="tabler:clock" />} className="h-7 px-2.5 font-bold">
            1/8 · Not started
          </StatusPill>
        }
        cta={
          <div className="flex flex-wrap items-center gap-3">
            <IconBadge tone="brand" size="md">
              <Icon name="tabler:device-mobile" />
            </IconBadge>
            <div className="min-w-[240px] flex-1">
              <h5 className="text-k-body font-bold leading-tight text-[var(--ink-900)]">
                Patient intake form
              </h5>
              <p className="mt-0.5 text-k-sm leading-k-snug text-[var(--ink-500)]">
                Your patient can complete their visit details on their phone.
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm">
                <Icon name="tabler:pencil" size={14} />
                Fill on behalf of patient
              </Button>
              <Button size="sm">
                <Icon name="tabler:send" size={14} />
                Send intake link
              </Button>
            </div>
          </div>
        }
      >
        {TASKS.map((task, index) => (
          <ChecklistItem
            key={task.title}
            status={task.status}
            title={task.title}
            meta={
              <span
                className={cn(
                  'font-bold uppercase tracking-k-wider',
                  task.status === 'done' && 'normal-case tracking-normal',
                )}
              >
                {task.meta}
              </span>
            }
            className={cn(
              'rounded-none px-2.5 py-[7px] text-[12.5px]',
              index < TASKS.length - 1 && 'border-b border-[var(--border)]',
            )}
          />
        ))}
      </IntakeCard>
    </div>
  ),
}

export const Empty: Story = {
  name: 'No items — header only',
  render: () => (
    <div className="w-[800px]">
      <IntakeCard
        title="Visit Details"
        statusPill={<StatusPill tone="success">Done</StatusPill>}
      />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    title: 'Visit Details',
  },
  render: (args) => (
    <div className="w-[800px]">
      <IntakeCard {...args} statusPill={<StatusPill tone="neutral">Status</StatusPill>}>
        <ChecklistItem
          status="pending"
          title="Sample task"
          meta="PENDING"
          className="rounded-none px-2.5 py-[7px] text-[12.5px]"
        />
      </IntakeCard>
    </div>
  ),
}
