import { Icon } from '../atoms/icon.tsx'
import { SectionLabel } from '../atoms/section-label.tsx'
import { DataPoint } from '../molecules/data-point.tsx'
import { SampleStatusBadge, type SampleCollectionStatus } from '../molecules/sample-status-badge.tsx'
import { SectionCard } from '../molecules/section-card.tsx'
import { StatusPill } from '../molecules/status-pill.tsx'
import { TubeVisual, type TubeVisualSpec } from '../molecules/tube-visual.tsx'
import { Badge } from '../ui/badge.tsx'
import { Button } from '../ui/button.tsx'

type SampleDetailPanelSample = {
  id: string
  tube: string
  tests: string[]
  volumeMl: number
  container: string
  stat?: boolean
  status: SampleCollectionStatus
  collectedAt?: string
  inverted?: boolean
}

type SampleDetailPanelProps = {
  sample: SampleDetailPanelSample
  tube: TubeVisualSpec
  relatedSamples?: Array<{
    id: string
    tube: TubeVisualSpec
  }>
}

/**
 * Tube Inspector detail panel from the Phlebo prototype.
 *
 * @kuraModules phlebo
 */
function SampleDetailPanel({ sample, tube, relatedSamples = [] }: SampleDetailPanelProps) {
  return (
    <SectionCard padding="lg" className="mx-auto w-full max-w-lg overflow-hidden">
      <div className="flex items-start gap-4 border-b border-[var(--border)] pb-4">
        <TubeVisual tube={tube} count={1} status={sample.status} />
        <div className="min-w-0 flex-1">
          <SectionLabel as="div">Sample inspector - #{tube.order}</SectionLabel>
          <h2 className="mt-1 text-xl font-black text-[var(--ink-900)]">{tube.stopperLabel}</h2>
          <p className="text-k-body text-[var(--ink-600)]">{tube.additive}</p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Clear inspector">
          <Icon name="tabler:x" size={14} />
        </Button>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4">
        <DataPoint label="Sample ID">
          <span className="font-mono font-bold">{sample.id}</span>
        </DataPoint>
        <DataPoint label="Volume">{sample.volumeMl} mL</DataPoint>
        <DataPoint label="Container">{sample.container}</DataPoint>
        <DataPoint label="Status">
          <SampleStatusBadge
            status={sample.status}
            collectedAt={sample.collectedAt}
            generatedLabel="Pending"
          />
        </DataPoint>
      </dl>

      <div className="mt-5 border-t border-[var(--border)] pt-4">
        <SectionLabel as="div">Tests</SectionLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {sample.tests.map((test) => (
            <Badge key={test} variant="neutral">
              {test}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-2 border-t border-[var(--border)] pt-4">
        <SectionLabel as="div">Status</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius)] border border-[var(--border)] p-3">
            <SectionLabel as="div">Collection</SectionLabel>
            <div className="mt-2">
              <SampleStatusBadge
                status={sample.status}
                collectedAt={sample.collectedAt}
                generatedLabel="Pending"
              />
            </div>
          </div>
          <div className="rounded-[var(--radius)] border border-[var(--border)] p-3">
            <SectionLabel as="div">Inversions</SectionLabel>
            <div className="mt-2 flex items-center justify-between">
              <StatusPill
                tone={sample.inverted ? 'success' : 'neutral'}
                icon={<Icon name={sample.inverted ? 'tabler:circle-check' : 'tabler:refresh'} />}
              >
                {sample.inverted ? 'Confirmed' : 'After collect'}
              </StatusPill>
              <span className="font-mono text-k-sm font-bold">x{tube.inversions}</span>
            </div>
          </div>
        </div>
      </div>

      {tube.timeLimitMin ? (
        <div className="mt-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <div className="flex items-start gap-2">
            <Icon name="tabler:clock" size={16} className="mt-0.5 text-[var(--ink-500)]" />
            <div>
              <div className="text-k-body font-bold text-[var(--ink-900)]">
                Process within {tube.timeLimitMin} min
              </div>
              <div className="text-k-xs text-[var(--ink-500)]">Starts when collected</div>
            </div>
          </div>
        </div>
      ) : null}

      {tube.handling?.length ? (
        <div className="mt-5 border-t border-[var(--border)] pt-4">
          <SectionLabel as="div">Handling</SectionLabel>
          <ul className="mt-2 grid gap-1.5 text-k-body text-[var(--ink-700)]">
            {tube.handling.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Icon name="tabler:check" size={14} className="mt-0.5 text-[var(--success-600)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
        <div className="flex flex-wrap gap-2">
          {relatedSamples.slice(0, 4).map((option) => (
            <Badge key={option.id} variant={option.id === sample.id ? 'info' : 'neutral'}>
              {option.tube.short} {option.id.slice(-6)}
            </Badge>
          ))}
        </div>
        <Button size="sm">
          <Icon name="tabler:check" size={14} />
          Collect now
        </Button>
      </div>
    </SectionCard>
  )
}

export { SampleDetailPanel, type SampleDetailPanelProps, type SampleDetailPanelSample }
