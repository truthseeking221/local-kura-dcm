import { Icon } from '../atoms/icon.tsx'
import { Badge } from '../ui/badge.tsx'

type SampleCollectionStatus = 'generated' | 'collected' | 'deferred'

type SampleStatusBadgeProps = {
  status: SampleCollectionStatus
  collectedAt?: string
  generatedLabel?: string
}

function statusLabel(status: SampleCollectionStatus, generatedLabel: string) {
  if (status === 'collected') return 'Collected'
  if (status === 'deferred') return 'Deferred'
  return generatedLabel
}

function statusVariant(status: SampleCollectionStatus): 'success' | 'warning' | 'info' {
  if (status === 'collected') return 'success'
  if (status === 'deferred') return 'warning'
  return 'info'
}

function statusIcon(status: SampleCollectionStatus) {
  if (status === 'collected') return 'tabler:circle-check'
  if (status === 'deferred') return 'tabler:clock'
  return 'tabler:barcode'
}

/**
 * Status badge for tube/sample collection rows.
 *
 * @kuraModules phlebo
 */
function SampleStatusBadge({
  status,
  collectedAt,
  generatedLabel = 'Generated',
}: SampleStatusBadgeProps) {
  return (
    <Badge variant={statusVariant(status)}>
      <Icon name={statusIcon(status)} size={12} />
      {statusLabel(status, generatedLabel)}
      {collectedAt ? <span>{collectedAt}</span> : null}
    </Badge>
  )
}

export { SampleStatusBadge, type SampleCollectionStatus, type SampleStatusBadgeProps }
