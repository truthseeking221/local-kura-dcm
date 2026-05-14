import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Icon } from '@/components/atoms/icon.tsx'
import { MetaPill } from '@/components/atoms/meta-pill.tsx'
import { SubjectHeader } from '@/components/organisms/subject-header.tsx'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx'

const meta: Meta<typeof SubjectHeader> = {
  title: 'Organisms/SubjectHeader',
  component: SubjectHeader,
  tags: ['autodocs', 'module:receptionist', 'module:phlebo'],
  argTypes: {
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4'],
    },
  },
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'n/a — matched to live prototype PatientHeader at https://design-receptionist.kura.med/patients',
    },
  },
}

export default meta
type Story = StoryObj<typeof SubjectHeader>

const nextActionClassName =
  'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--warn-100)] bg-[var(--warn-50)] px-3 text-xs font-[650] text-[var(--warn-700)] transition-[background,border-color,transform] duration-150 hover:-translate-y-px hover:bg-[var(--warn-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-300)] disabled:cursor-default disabled:hover:translate-y-0 max-[640px]:h-[26px] max-[640px]:min-w-0 max-[640px]:px-[11px] max-[640px]:pl-[9px] max-[640px]:text-[11.5px] max-[640px]:[&>span]:truncate max-[359px]:h-6 max-[359px]:px-2 max-[359px]:text-[10.5px] max-[359px]:[&>svg]:hidden'

const stepSwitcherClassName =
  'hidden min-w-0 items-center justify-center gap-1 rounded-[var(--radius-pill)] border border-border bg-[var(--surface)] px-[7px] py-[3px] text-[9.5px] font-semibold uppercase tracking-[0.035em] text-[var(--ink-500)] transition-colors duration-150 hover:border-[var(--ink-200)] hover:bg-[var(--surface-2)] hover:text-[var(--ink-700)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--brand-300)] max-[640px]:inline-flex max-[640px]:min-h-[26px] max-[359px]:min-h-6 max-[359px]:gap-0.5 max-[359px]:px-[5px] max-[359px]:text-[8.5px]'

const stepSwitcherLabelClassName =
  'min-w-0 truncate text-[11px] font-bold normal-case tracking-normal text-[var(--ink-800)] max-[359px]:text-[10px]'

export const Default: Story = {
  render: () => (
    <div className="min-h-40 bg-[var(--bg)]">
      <SubjectHeader
        avatar={
          <Avatar>
            <AvatarFallback className="bg-[var(--ink-100)] text-[var(--ink-400)]">
              <Icon name="tabler:user" size={14} />
            </AvatarFallback>
          </Avatar>
        }
        title="New visit"
      />
    </div>
  ),
}

export const Playground: Story = {
  args: { as: 'h2' },
  render: (args) => (
    <div className="min-h-40 bg-[var(--bg)]">
      <SubjectHeader
        {...args}
        avatar={
          <Avatar>
            <AvatarFallback className="bg-[var(--brand-500)] text-[var(--ink-0)]">
              SC
            </AvatarFallback>
          </Avatar>
        }
        title="Sok Channary"
        pills={
          <>
            <MetaPill icon={<Icon name="tabler:calendar" size={9} />}>
              14 Jun 1993 · 32y
            </MetaPill>
            <MetaPill icon={<Icon name="tabler:user" size={9} />}>F</MetaPill>
            <MetaPill icon={<Icon name="tabler:phone" size={9} />}>
              +855 12 345 678
            </MetaPill>
          </>
        }
        status={
          <button type="button" className={nextActionClassName}>
            <Icon name="tabler:alert-circle" size={12} strokeWidth={2.25} />
            <span>Verify patient</span>
          </button>
        }
      />
    </div>
  ),
}

export const WithPatient: Story = {
  render: () => (
    <div className="min-h-40 bg-[var(--bg)]">
      <SubjectHeader
        avatar={
          <Avatar>
            <AvatarFallback className="bg-[var(--brand-500)] text-[var(--ink-0)]">
              SC
            </AvatarFallback>
          </Avatar>
        }
        title="Sok Channary"
        pills={
          <>
            <MetaPill icon={<Icon name="tabler:calendar" size={9} />}>
              14 Jun 1993 · 32y
            </MetaPill>
            <MetaPill icon={<Icon name="tabler:user" size={9} />}>F</MetaPill>
            <MetaPill icon={<Icon name="tabler:phone" size={9} />}>
              +855 12 345 678
            </MetaPill>
          </>
        }
        status={
          <button type="button" className={nextActionClassName}>
            <Icon name="tabler:user-check" size={12} strokeWidth={2.25} />
            <span>Verify patient</span>
          </button>
        }
      />
    </div>
  ),
}

export const NextAction: Story = {
  render: function Render() {
    const [label, setLabel] = useState('Capture identity')

    return (
      <div className="min-h-40 bg-[var(--bg)]">
        <SubjectHeader
          avatar={
            <Avatar>
              <AvatarFallback className="bg-[var(--ink-100)] text-[var(--ink-400)]">
                <Icon name="tabler:user" size={14} />
              </AvatarFallback>
            </Avatar>
          }
          title="New visit"
          status={
            <button
              type="button"
              className={nextActionClassName}
              onClick={() => setLabel('Verify patient')}
              aria-label={`${label}. Jump to required step`}
            >
              <Icon name="tabler:user" size={12} strokeWidth={2.25} />
              <span>{label}</span>
            </button>
          }
        />
      </div>
    )
  },
}

export const Mobile: Story = {
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  render: () => (
    <div className="min-h-40 bg-[var(--bg)]">
      <SubjectHeader
        avatar={
          <Avatar>
            <AvatarFallback className="bg-[var(--brand-500)] text-[var(--ink-0)]">
              SC
            </AvatarFallback>
          </Avatar>
        }
        title="Sok Channary"
        pills={
          <>
            <MetaPill icon={<Icon name="tabler:calendar" size={9} />}>
              14 Jun 1993 · 32y
            </MetaPill>
            <MetaPill icon={<Icon name="tabler:user" size={9} />}>F</MetaPill>
            <MetaPill icon={<Icon name="tabler:phone" size={9} />}>
              +855 12 345 678
            </MetaPill>
          </>
        }
        actions={
          <button
            type="button"
            className={stepSwitcherClassName}
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-label="Open check-in steps. Step 1/6 · Identity"
          >
            <span>
              <span className="max-[359px]:hidden">Step </span>1/6
            </span>
            <strong className={stepSwitcherLabelClassName}>Identity</strong>
            <Icon name="tabler:chevron-down" size={10} strokeWidth={2.4} />
          </button>
        }
        status={
          <button type="button" className={nextActionClassName}>
            <Icon name="tabler:shield" size={12} strokeWidth={2.25} />
            <span>Choose insurance</span>
          </button>
        }
      />
    </div>
  ),
}
