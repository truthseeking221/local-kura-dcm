import type { ReactNode } from 'react'

import { formatAge, type BoothSection, type Patient } from '../_fixtures/phlebo.ts'

import { SubjectContextCard } from '@/components/organisms/subject-context-card.tsx'
import { SectionCard } from '@/components/molecules/section-card.tsx'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx'
import { Badge } from '@/components/ui/badge.tsx'

type PatientContextCardProps = {
  patient: Patient
  active: Exclude<BoothSection, 'inspector'>
}

const JOURNEY_STEPS = [
  { id: 'identity', label: 'Identity', icon: 'tabler:shield-check' },
  { id: 'vitals', label: 'Vital Signs', icon: 'tabler:heart' },
  { id: 'phlebotomy', label: 'Phlebotomy', icon: 'tabler:flask' },
] as const

function formatDob(dob: string) {
  const date = new Date(dob)
  if (Number.isNaN(date.getTime())) return dob
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function detailValue(patient: Patient, key: 'waiting' | 'checkIn' | 'fasting' | 'mobile'): ReactNode {
  if (key === 'checkIn') return patient.checkInAt
  if (key === 'fasting') return patient.fasting
  if (key === 'mobile') return patient.mobile
  return (
    <span
      className={
        patient.waitingMinutes > 60
          ? 'font-bold text-[var(--danger-600)]'
          : patient.waitingMinutes > 30
            ? 'font-bold text-[var(--warn-600)]'
            : 'font-bold'
      }
    >
      {patient.waitingMinutes} min
    </span>
  )
}

export function PatientContextCard({ patient, active }: PatientContextCardProps) {
  return (
    <SubjectContextCard
      initials={patient.initials}
      title={patient.name}
      subtitle={
        <span className="flex flex-wrap items-center gap-1.5">
          <span>{formatDob(patient.dob)}</span>
          <span aria-hidden>/</span>
          <span>{formatAge(patient.dob)}</span>
          <span aria-hidden>/</span>
          <span>{patient.sex}</span>
        </span>
      }
      pills={[`PID ${patient.pid}`, `Order ${patient.orderId}`]}
      notice={
        patient.allergies.length > 0 ? (
          <>
            <span className="font-bold">Allergies:</span>
            <span>{patient.allergies.join(', ')}</span>
          </>
        ) : undefined
      }
      journey={{
        currentStep: active,
        steps: JOURNEY_STEPS.map((step) => ({
          ...step,
          status: patient.journey[step.id],
        })),
      }}
      details={[
        { label: 'Check-in', value: detailValue(patient, 'checkIn') },
        { label: 'Waiting', value: detailValue(patient, 'waiting') },
        { label: 'Fasting', value: detailValue(patient, 'fasting') },
        { label: 'Mobile', value: detailValue(patient, 'mobile') },
      ]}
    />
  )
}

export function PatientStrip({ patient }: { patient: Patient }) {
  return (
    <SectionCard padding="md" className="mx-auto flex w-full max-w-xl items-center gap-3">
      <Avatar className="size-9">
        <AvatarFallback className="bg-[var(--brand-500)] text-k-xs font-bold text-[var(--ink-0)]">
          {patient.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate text-k-body font-black text-[var(--ink-900)]">{patient.name}</div>
        <div className="text-k-xs font-medium text-[var(--ink-500)]">
          {patient.pid} / Order {patient.orderId}
        </div>
      </div>
      <Badge variant="neutral">{patient.samples.length} samples</Badge>
    </SectionCard>
  )
}
