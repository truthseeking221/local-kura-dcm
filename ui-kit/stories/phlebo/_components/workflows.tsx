import { Icon } from '@/components/atoms/icon.tsx'
import { Kbd } from '@/components/atoms/kbd.tsx'
import { SectionLabel } from '@/components/atoms/section-label.tsx'
import { Banner } from '@/components/molecules/banner.tsx'
import { ClinicalNumberField } from '@/components/molecules/clinical-number-field.tsx'
import { CompositeNumberField } from '@/components/molecules/composite-number-field.tsx'
import { DerivedValueField } from '@/components/molecules/derived-value-field.tsx'
import { ScanInput } from '@/components/molecules/scan-input.tsx'
import { SectionCard } from '@/components/molecules/section-card.tsx'
import { SegmentedControl } from '@/components/molecules/segmented-control.tsx'
import { StatusPill } from '@/components/molecules/status-pill.tsx'
import { TubeDot } from '@/components/molecules/tube-visual.tsx'
import { QueuePickList } from '@/components/organisms/queue-pick-list.tsx'
import { SampleDeferDialog } from '@/components/organisms/sample-defer-dialog.tsx'
import { SampleDetailPanel } from '@/components/organisms/sample-detail-panel.tsx'
import { SampleTable } from '@/components/organisms/sample-table.tsx'
import { ScanGatePanel } from '@/components/organisms/scan-gate-panel.tsx'
import { TubeRack } from '@/components/organisms/tube-rack.tsx'
import { Button } from '@/components/ui/button.tsx'

import {
  allSamples,
  DEFAULT_DEFER_REASON,
  FASTING_OPTIONS,
  PHLEBO_QUEUE,
  PRE_ANALYTICAL_CHECKS,
  queueForSection,
  TUBE_CATALOG,
  tubeByKey,
  VITAL_FIELD_GROUPS,
  type Patient,
  type Sample,
} from '../_fixtures/phlebo.ts'

import { PhleboBoothShell } from './booth-shell.tsx'
import { PatientContextCard, PatientStrip } from './patient-card.tsx'

function tubeRackItems(samples: Sample[]) {
  const required = new Map<string, { tubeKey: string; count: number; status?: Sample['status']; needsInvert: boolean }>()

  for (const sample of samples) {
    const current = required.get(sample.tube) ?? {
      tubeKey: sample.tube,
      count: 0,
      status: sample.status,
      needsInvert: false,
    }
    current.count += 1
    if (sample.status === 'deferred') current.status = 'deferred'
    if (sample.status === 'generated' && current.status === 'collected') current.status = 'generated'
    const tube = tubeByKey(sample.tube)
    if (sample.status === 'collected' && tube.inversions > 0 && !sample.inverted) {
      current.needsInvert = true
    }
    required.set(sample.tube, current)
  }

  return [...required.values()]
}

function relatedSamples(samples: Sample[]) {
  return samples.map((sample) => ({
    id: sample.id,
    tube: tubeByKey(sample.tube),
  }))
}

export function VitalSignsWorkspace({ patient }: { patient: Patient }) {
  const queue = queueForSection('vitals')
  return (
    <PhleboBoothShell active="vitals" patientLoaded queueCount={queue.length}>
      <div className="grid min-h-full gap-5 p-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <PatientContextCard patient={patient} active="vitals" />
        </aside>
        <section className="lg:col-span-9">
          <SectionCard padding="lg" className="min-h-full">
            <header className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <SectionLabel as="div">Booth / Vital Signs</SectionLabel>
                <h1 className="mt-1 text-2xl font-black text-[var(--ink-900)]">
                  Record vital signs
                </h1>
              </div>
              <div className="flex items-center gap-2 text-k-sm font-medium text-[var(--ink-500)]">
                <span>{patient.name}</span>
                <span>/</span>
                <span>PID {patient.pid}</span>
              </div>
            </header>

            <div className="grid gap-6">
              <section>
                <SectionLabel as="div">Biometrics</SectionLabel>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  {VITAL_FIELD_GROUPS.biometrics.map((field) => (
                    <ClinicalNumberField key={field.label} {...field} />
                  ))}
                  <DerivedValueField label="BMI" hint="auto" unit="kg/m²" />
                </div>
              </section>

              <section>
                <SectionLabel as="div">Vitals</SectionLabel>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  <ClinicalNumberField {...VITAL_FIELD_GROUPS.vitals[0]} />
                  <CompositeNumberField
                    label="Blood Pressure"
                    required
                    hint="80-200 / 40-130"
                    unit="mmHg"
                    fields={[
                      { name: 'systolic', 'aria-label': 'Systolic', defaultValue: 120 },
                      { name: 'diastolic', 'aria-label': 'Diastolic', defaultValue: 80 },
                    ]}
                  />
                  {VITAL_FIELD_GROUPS.vitals.slice(1).map((field) => (
                    <ClinicalNumberField key={field.label} {...field} />
                  ))}
                </div>
              </section>

              <section>
                <SectionLabel as="div">Pain (VAS 0-10)</SectionLabel>
                <SectionCard tone="default" className="mt-3">
                  <div className="flex items-center gap-4">
                    <StatusPill tone="success" icon={<Icon name="tabler:mood-smile" />}>
                      No pain
                    </StatusPill>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      defaultValue={0}
                      aria-label="Pain VAS"
                      className="h-2 flex-1 accent-[var(--brand-500)]"
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-11 text-center text-k-xs font-medium text-[var(--ink-500)]">
                    {Array.from({ length: 11 }, (_, index) => (
                      <span key={index}>{index}</span>
                    ))}
                  </div>
                </SectionCard>
              </section>

              <section>
                <SectionLabel as="div">Fasting status</SectionLabel>
                <div className="mt-3 flex flex-wrap gap-2">
                  {FASTING_OPTIONS.map((item, index) => (
                    <Button
                      key={item}
                      variant={index === 0 ? 'default' : 'outline'}
                      className={index === 0 ? '' : 'bg-[var(--surface)]'}
                    >
                      <Icon name={index === 0 ? 'tabler:circle-dot' : 'tabler:circle'} size={14} />
                      {item}
                    </Button>
                  ))}
                </div>
              </section>

              <section className="border-t border-[var(--border)] pt-4">
                <Button variant="ghost" className="gap-2">
                  <Icon name="tabler:chevron-down" size={14} />
                  Vaccination (optional)
                </Button>
              </section>
            </div>

            <footer className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
              <Button variant="outline">Clear form</Button>
              <div className="flex gap-2">
                <Button variant="outline">Cancel</Button>
                <Button disabled>
                  Submit and next patient
                  <Icon name="tabler:arrow-right" size={14} />
                </Button>
              </div>
            </footer>
          </SectionCard>
        </section>
      </div>
    </PhleboBoothShell>
  )
}

function PreAnalyticalChecklist() {
  return (
    <SectionCard title="Pre-analytical" meta="0/5 confirmed" padding="lg">
      <div className="flex flex-wrap gap-2">
        {PRE_ANALYTICAL_CHECKS.map((check) => (
          <Button key={check} variant="outline" size="sm" className="bg-[var(--surface)]">
            <Icon name="tabler:circle" size={14} />
            {check}
          </Button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SectionLabel as="div">Arm</SectionLabel>
        <SegmentedControl
          value="left"
          onValueChange={() => {}}
          aria-label="Arm"
          options={[
            { value: 'left', icon: 'tabler:armchair', label: 'Left' },
            { value: 'right', icon: 'tabler:armchair', label: 'Right' },
          ]}
        />
        <SectionLabel as="div">Site</SectionLabel>
        <Button variant="outline" size="sm" className="h-8 bg-[var(--surface)]">
          Antecubital fossa
          <Icon name="tabler:chevron-down" size={14} />
        </Button>
      </div>
    </SectionCard>
  )
}

export function PhlebotomyWorkspace({
  patient,
  focusedSample,
}: {
  patient: Patient
  focusedSample?: Sample
}) {
  const queue = queueForSection('phlebotomy')
  const focus = focusedSample ?? patient.samples[0]
  const focusedTube = tubeByKey(focus.tube)
  const collectedCount = patient.samples.filter((sample) => sample.status === 'collected').length
  return (
    <PhleboBoothShell active="phlebotomy" patientLoaded queueCount={queue.length}>
      <div className="grid min-h-full gap-5 p-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <PatientContextCard patient={patient} active="phlebotomy" />
        </aside>
        <section className="space-y-4 lg:col-span-9">
          {patient.journey.vitals !== 'done' ? (
            <Banner
              tone="warning"
              icon={<Icon name="tabler:alert-triangle" />}
              title="Vital Signs not yet recorded."
              action={
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-[var(--surface)]">
                    Continue anyway
                  </Button>
                  <Button variant="outline" size="sm" className="bg-[var(--surface)]">
                    Mark done at another booth
                  </Button>
                </div>
              }
            >
              You can continue, or send the patient to the Vital Signs booth first.
            </Banner>
          ) : null}

          <header className="flex items-end justify-between">
            <div>
              <SectionLabel as="div">Booth / Phlebotomy</SectionLabel>
              <h1 className="mt-1 text-2xl font-black text-[var(--ink-900)]">
                Collection workspace
              </h1>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-[var(--ink-900)]">
                {collectedCount}
                <span className="text-lg text-[var(--ink-500)]">/{patient.samples.length}</span>
              </div>
              <SectionLabel as="div">Collected</SectionLabel>
            </div>
          </header>

          <PreAnalyticalChecklist />
          <TubeRack
            tubes={TUBE_CATALOG}
            items={tubeRackItems(patient.samples)}
            focusedTubeKey={focusedTube.key}
          />

          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-80 flex-1">
              <ScanInput
                placeholder="Scan tube barcode - collect, or open inspector if already done"
                onScan={() => undefined}
              />
            </div>
            <Button variant="outline" className="bg-[var(--surface)]">
              <Icon name="tabler:check" size={14} />
              Mark all collected
            </Button>
            <Button variant="outline" className="bg-[var(--surface)]">
              <Icon name="tabler:printer" size={14} />
              Print barcode labels
            </Button>
          </div>

          <SampleTable samples={patient.samples} tubes={TUBE_CATALOG} focusedSampleId={focus.id} />

          <footer className="sticky bottom-0 flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface)] p-3">
            <Button variant="outline">Save draft</Button>
            <Button disabled>
              Submit collection and next patient
              <Icon name="tabler:arrow-right" size={14} />
            </Button>
          </footer>
        </section>
      </div>
    </PhleboBoothShell>
  )
}

export function TubeInspectorScan() {
  const samples = allSamples()
  return (
    <PhleboBoothShell active="inspector">
      <ScanGatePanel
        icon="tabler:scan"
        iconTone="brand"
        title="Tube Inspector"
        description="Scan any tube barcode to inspect its spec, status, and handling instructions."
        scanLabel="Sample ID"
        scanPlaceholder="Scan or type sample ID"
        queueLabel="Pick from queue"
        queueCount={samples.length}
        defaultQueueOpen
        queue={
          <QueuePickList
            items={samples.slice(0, 8).map(({ patient, sample }) => {
              const tube = tubeByKey(sample.tube)
              return {
                id: sample.id,
                initials: patient.initials,
                title: `${tube.short} ${sample.id.slice(-6)}`,
                meta: patient.name,
                trailing: <TubeDot tube={tube} />,
              }
            })}
          />
        }
      />
    </PhleboBoothShell>
  )
}

export function TubeInspectorFound({
  patient,
  sample,
}: {
  patient: Patient
  sample: Sample
}) {
  return (
    <PhleboBoothShell active="inspector">
      <div className="flex min-h-full items-start justify-center px-6 py-10">
        <div className="grid w-full max-w-2xl gap-3">
          <PatientStrip patient={patient} />
          <SampleDetailPanel
            sample={sample}
            tube={tubeByKey(sample.tube)}
            relatedSamples={relatedSamples(patient.samples)}
          />
        </div>
      </div>
    </PhleboBoothShell>
  )
}

export function DeferSampleDialog({ sample = PHLEBO_QUEUE[0].samples[0] }: { sample?: Sample }) {
  return (
    <SampleDeferDialog
      defaultOpen
      sample={sample}
      tube={tubeByKey(sample.tube)}
      defaultReason={DEFAULT_DEFER_REASON}
      trigger={<Button variant="outline">Open defer sample</Button>}
    />
  )
}

export function CollectionCompleteVariant({ patient }: { patient: Patient }) {
  const collectedSamples = patient.samples.map((sample) => ({
    ...sample,
    status: 'collected' as const,
    collectedAt: '08:24',
    collectedBy: 'Linh Nguyen',
    inverted: true,
  }))
  return (
    <PhleboBoothShell active="phlebotomy" patientLoaded queueCount={queueForSection('phlebotomy').length}>
      <div className="grid min-h-full gap-5 p-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <PatientContextCard patient={patient} active="phlebotomy" />
        </aside>
        <section className="space-y-4 lg:col-span-9">
          <Banner
            tone="success"
            icon={<Icon name="tabler:circle-check" />}
            title="Collection complete."
          >
            All required tubes are collected and inversion checks are confirmed. Submit to move to the next patient.
          </Banner>
          <TubeRack
            tubes={TUBE_CATALOG}
            items={tubeRackItems(collectedSamples)}
            focusedTubeKey={tubeByKey(collectedSamples[0].tube).key}
          />
          <SampleTable
            samples={collectedSamples}
            tubes={TUBE_CATALOG}
            focusedSampleId={collectedSamples[0]?.id}
          />
          <footer className="flex justify-end">
            <Button>
              Submit collection and next patient
              <Icon name="tabler:arrow-right" size={14} />
            </Button>
          </footer>
        </section>
      </div>
    </PhleboBoothShell>
  )
}

export function TubeInspectorCollectedDetail({ patient }: { patient: Patient }) {
  const sample = {
    ...patient.samples[0],
    status: 'collected' as const,
    collectedAt: '08:24',
    collectedBy: 'Linh Nguyen',
    inverted: true,
  }
  return (
    <PhleboBoothShell active="inspector">
      <div className="flex min-h-full items-start justify-center px-6 py-10">
        <div className="grid w-full max-w-2xl gap-3">
          <PatientStrip patient={patient} />
          <SampleDetailPanel
            sample={sample}
            tube={tubeByKey(sample.tube)}
            relatedSamples={relatedSamples([sample, ...patient.samples.slice(1)])}
          />
          <div className="text-center text-k-xs text-[var(--ink-500)]">
            <Kbd>Esc</Kbd> returns focus to scanner.
          </div>
        </div>
      </div>
    </PhleboBoothShell>
  )
}
