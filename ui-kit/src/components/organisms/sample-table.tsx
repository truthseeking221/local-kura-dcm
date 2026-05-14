import { Icon } from '../atoms/icon.tsx'
import { SampleStatusBadge, type SampleCollectionStatus } from '../molecules/sample-status-badge.tsx'
import { SectionCard } from '../molecules/section-card.tsx'
import { TubeDot, type TubeVisualSpec } from '../molecules/tube-visual.tsx'
import { Badge } from '../ui/badge.tsx'
import { Button } from '../ui/button.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table.tsx'

type SampleTableSample = {
  id: string
  tube: string
  tests: string[]
  volumeMl: number
  container: string
  stat: boolean
  status: SampleCollectionStatus
  collectedAt?: string
  inverted?: boolean
}

type SampleTableProps = {
  samples: SampleTableSample[]
  tubes: TubeVisualSpec[]
  focusedSampleId?: string
}

/**
 * Phlebo sample collection table, ordered by tube draw sequence.
 *
 * @kuraModules phlebo
 */
function SampleTable({ samples, tubes, focusedSampleId }: SampleTableProps) {
  const tubeByKey = new Map(tubes.map((tube) => [tube.key, tube]))

  return (
    <SectionCard padding="sm" className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Tube</TableHead>
            <TableHead>Sample ID</TableHead>
            <TableHead>Tests</TableHead>
            <TableHead>Vol</TableHead>
            <TableHead>Container</TableHead>
            <TableHead>STAT</TableHead>
            <TableHead>Inversion</TableHead>
            <TableHead>Clot time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samples
            .slice()
            .sort((a, b) => (tubeByKey.get(a.tube)?.order ?? 0) - (tubeByKey.get(b.tube)?.order ?? 0))
            .map((sample) => {
              const tube = tubeByKey.get(sample.tube)
              if (!tube) return null
              const focused = focusedSampleId === sample.id
              const needsInvert = sample.status === 'collected' && tube.inversions > 0 && !sample.inverted

              return (
                <TableRow
                  key={sample.id}
                  data-state={focused ? 'selected' : undefined}
                  className={focused ? 'bg-[var(--brand-50)]' : undefined}
                >
                  <TableCell className="font-mono font-bold">{tube.order}</TableCell>
                  <TableCell>
                    <div className="flex min-w-40 items-center gap-2">
                      <TubeDot tube={tube} />
                      <div className="min-w-0">
                        <div className="font-bold text-[var(--ink-900)]">{tube.stopperLabel}</div>
                        <div className="truncate text-k-xs text-[var(--ink-500)]">{tube.additive}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-bold">{sample.id}</TableCell>
                  <TableCell>{sample.tests.join(', ')}</TableCell>
                  <TableCell>{sample.volumeMl} mL</TableCell>
                  <TableCell>{sample.container}</TableCell>
                  <TableCell>{sample.stat ? <Badge variant="danger">STAT</Badge> : null}</TableCell>
                  <TableCell>
                    {tube.inversions > 0 ? (
                      needsInvert ? (
                        <Button size="xs" variant="outline" className="bg-[var(--surface)]">
                          <Icon name="tabler:rotate-clockwise" size={12} />
                          Invert x{tube.inversions}
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-k-xs font-bold text-[var(--ink-500)]">
                          <Icon name="tabler:refresh" size={12} /> x{tube.inversions}
                        </span>
                      )
                    ) : (
                      <span className="text-[var(--ink-400)]">-</span>
                    )}
                  </TableCell>
                  <TableCell>{tube.timeLimitMin ? `${tube.timeLimitMin}m` : '-'}</TableCell>
                  <TableCell>
                    <SampleStatusBadge status={sample.status} collectedAt={sample.collectedAt} />
                  </TableCell>
                  <TableCell className="text-right">
                    {sample.status === 'generated' ? (
                      <div className="flex justify-end gap-2">
                        <Button size="xs">
                          <Icon name="tabler:check" size={12} />
                          Collect
                        </Button>
                        <Button size="xs" variant="ghost">
                          <Icon name="tabler:clock" size={12} />
                          Defer
                        </Button>
                      </div>
                    ) : (
                      <Button size="xs" variant="ghost">
                        <Icon name="tabler:refresh" size={12} />
                        Reset
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </SectionCard>
  )
}

export { SampleTable, type SampleTableProps, type SampleTableSample }
