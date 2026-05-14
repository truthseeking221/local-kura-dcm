import type { Meta, StoryObj } from '@storybook/react-vite'

import { SubjectContextCard } from '@/components/organisms/subject-context-card.tsx'
import { PHLEBO_QUEUE } from '../phlebo/_fixtures/phlebo.ts'

const patient = PHLEBO_QUEUE[0]

const meta = {
  title: 'Organisms/SubjectContextCard',
  component: SubjectContextCard,
  tags: ['autodocs', 'module:phlebo'],
  parameters: { layout: 'centered' },
  args: {
    initials: patient.initials,
    title: patient.name,
    subtitle: `${patient.dob} / ${patient.sex}`,
    pills: [`PID ${patient.pid}`, `Order ${patient.orderId}`],
  },
} satisfies Meta<typeof SubjectContextCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-[min(360px,calc(100vw-3rem))]">
      <SubjectContextCard {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    notice: (
      <>
        <span className="font-bold">Allergies:</span>
        <span>{patient.allergies.join(', ')}</span>
      </>
    ),
  },
  render: Default.render,
}

export const States: Story = {
  render: () => (
    <div className="grid w-[min(760px,calc(100vw-3rem))] gap-4 md:grid-cols-2">
      <SubjectContextCard
        initials={patient.initials}
        title={patient.name}
        subtitle={`${patient.dob} / ${patient.sex}`}
        pills={[`PID ${patient.pid}`, `Order ${patient.orderId}`]}
      />
      <SubjectContextCard
        initials={patient.initials}
        title={patient.name}
        subtitle={`${patient.dob} / ${patient.sex}`}
        pills={[`PID ${patient.pid}`, `Order ${patient.orderId}`]}
        notice={<><span className="font-bold">Allergies:</span><span>{patient.allergies.join(', ')}</span></>}
        journey={{
          currentStep: 'vitals',
          steps: [
            { id: 'identity', label: 'Identity', icon: 'tabler:shield-check', status: 'done' },
            { id: 'vitals', label: 'Vital Signs', icon: 'tabler:heart', status: 'pending' },
            { id: 'phlebotomy', label: 'Phlebotomy', icon: 'tabler:flask', status: 'waiting' },
          ],
        }}
      />
    </div>
  ),
}

export const PhleboPatientScenario: Story = {
  args: {
    notice: (
      <>
        <span className="font-bold">Allergies:</span>
        <span>{patient.allergies.join(', ')}</span>
      </>
    ),
    journey: {
      currentStep: 'vitals',
      steps: [
        { id: 'identity', label: 'Identity', icon: 'tabler:shield-check', status: 'done' },
        { id: 'vitals', label: 'Vital Signs', icon: 'tabler:heart', status: 'pending' },
        { id: 'phlebotomy', label: 'Phlebotomy', icon: 'tabler:flask', status: 'waiting' },
      ],
    },
    details: [
      { label: 'Check-in', value: patient.checkInAt },
      { label: 'Waiting', value: `${patient.waitingMinutes} min` },
      { label: 'Fasting', value: patient.fasting },
      { label: 'Mobile', value: patient.mobile },
    ],
  },
  render: Default.render,
}
