import { Icon } from '../atoms/icon.tsx'
import { TubeVisual, type TubeVisualSpec, type TubeVisualStatus } from '../molecules/tube-visual.tsx'
import { SectionCard } from '../molecules/section-card.tsx'

type TubeRackItem = {
  tubeKey: string
  count: number
  status?: TubeVisualStatus
  needsInvert?: boolean
}

type TubeRackProps = {
  tubes: TubeVisualSpec[]
  items: TubeRackItem[]
  focusedTubeKey?: string
  title?: string
  meta?: string
}

/**
 * Order-of-draw tube rack based on the Phlebo prototype.
 *
 * @kuraModules phlebo
 */
function TubeRack({
  tubes,
  items,
  focusedTubeKey,
  title = 'Tube rack',
  meta = 'Order of draw - CLSI',
}: TubeRackProps) {
  const itemByTube = new Map(items.map((item) => [item.tubeKey, item]))

  return (
    <SectionCard title={title} meta={meta} padding="lg" className="overflow-hidden">
      <div className="mb-4 flex flex-wrap items-center justify-end gap-3 text-k-xs font-medium text-[var(--ink-600)]">
        <span className="inline-flex items-center gap-1.5 text-[var(--success-600)]">
          <Icon name="tabler:circle-check" size={12} /> Collected
        </span>
        <span className="inline-flex items-center gap-1.5 text-[var(--warn-700)]">
          <Icon name="tabler:rotate-clockwise" size={12} /> Needs invert
        </span>
        <span className="inline-flex items-center gap-1.5 text-[var(--ink-500)]">
          <Icon name="tabler:circle-dashed" size={12} /> Not needed
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {tubes.map((tube) => {
          const item = itemByTube.get(tube.key)
          return (
            <TubeVisual
              key={tube.key}
              tube={tube}
              count={item?.count ?? 0}
              status={item?.status}
              needsInvert={item?.needsInvert}
              focused={focusedTubeKey === tube.key}
            />
          )
        })}
      </div>
    </SectionCard>
  )
}

export { TubeRack, type TubeRackItem, type TubeRackProps }
