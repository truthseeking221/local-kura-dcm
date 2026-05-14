import type { BoothSection, Patient } from '../_fixtures/phlebo.ts'

import { QueuePickList } from '@/components/organisms/queue-pick-list.tsx'
import { ScanGatePanel } from '@/components/organisms/scan-gate-panel.tsx'

type ScanGateProps = {
  section: Exclude<BoothSection, 'inspector'>
  queue: Patient[]
  defaultQueueOpen?: boolean
}

function sectionMeta(section: Exclude<BoothSection, 'inspector'>) {
  if (section === 'phlebotomy') {
    return {
      icon: 'tabler:flask',
      tone: 'brand' as const,
    }
  }
  return {
    icon: 'tabler:heart',
    tone: 'info' as const,
  }
}

export function PhleboScanGate({ section, queue, defaultQueueOpen = false }: ScanGateProps) {
  const meta = sectionMeta(section)

  return (
    <ScanGatePanel
      icon={meta.icon}
      iconTone={meta.tone}
      title="Scan patient barcode"
      description="Hand-scan the printed bill or type the Patient ID."
      scanPlaceholder="P __ __ __ __ __ __"
      queueLabel="Browse queue"
      queueCount={queue.length}
      defaultQueueOpen={defaultQueueOpen}
      queue={
        <QueuePickList
          items={queue.map((patient) => ({
            id: patient.id,
            initials: patient.initials,
            title: patient.name,
            meta: `${patient.pid} / ${patient.checkInAt} / ${patient.waitingMinutes} min`,
          }))}
        />
      }
    />
  )
}
