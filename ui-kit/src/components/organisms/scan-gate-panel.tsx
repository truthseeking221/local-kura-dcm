import { type ReactNode, useState } from 'react'

import { Icon } from '../atoms/icon.tsx'
import { LabelSeparator } from '../atoms/label-separator.tsx'
import { KeyboardHint, KeyboardHintsBar } from '../molecules/keyboard-hint.tsx'
import { IconBadge, type IconBadgeTone } from '../molecules/icon-badge.tsx'
import { ScanInput } from '../molecules/scan-input.tsx'
import { SectionCard } from '../molecules/section-card.tsx'
import { Button } from '../ui/button.tsx'
import { cn } from '../../lib/cn.ts'

type ScanGatePanelProps = {
  icon: string
  iconTone?: IconBadgeTone
  title: string
  description: string
  scanLabel?: string
  scanPlaceholder?: string
  queueLabel?: string
  queueCount?: number
  defaultQueueOpen?: boolean
  queue?: ReactNode
  className?: string
}

/**
 * Scanner-first gate used before a patient/sample workspace is loaded.
 *
 * @kuraModules phlebo
 */
function ScanGatePanel({
  icon,
  iconTone = 'brand',
  title,
  description,
  scanLabel = 'Patient ID',
  scanPlaceholder = 'P __ __ __ __ __ __',
  queueLabel = 'Browse queue',
  queueCount,
  defaultQueueOpen = false,
  queue,
  className,
}: ScanGatePanelProps) {
  const [queueOpen, setQueueOpen] = useState(defaultQueueOpen)
  const hasQueue = Boolean(queue)

  return (
    <div className={cn('flex min-h-full items-center justify-center px-6 py-10', className)}>
      <SectionCard padding="lg" className="w-full max-w-xl bg-[var(--surface)]">
        <div className="flex flex-col items-center text-center">
          <IconBadge tone={iconTone} size="lg" className="mb-5 rounded-full">
            <Icon name={icon} size={28} />
          </IconBadge>
          <h1 className="text-2xl font-black text-[var(--ink-900)]">{title}</h1>
          <p className="mt-2 text-k-body text-[var(--ink-500)]">{description}</p>
        </div>

        <div className="mt-6">
          <ScanInput
            icon="tabler:scan"
            placeholder={scanPlaceholder}
            aria-label={scanLabel}
            onScan={() => undefined}
          />
        </div>

        {hasQueue ? (
          <>
            <div className="my-5">
              <LabelSeparator>Or</LabelSeparator>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="gap-2 bg-[var(--surface)]"
                aria-expanded={queueOpen}
                onClick={() => setQueueOpen((open) => !open)}
              >
                <Icon name="tabler:users" size={14} />
                {queueLabel}
                {typeof queueCount === 'number' ? (
                  <span className="inline-flex min-w-6 justify-center rounded-[var(--radius-pill)] bg-[var(--brand-50)] px-2 text-k-xs font-bold text-[var(--brand-700)]">
                    {queueCount}
                  </span>
                ) : null}
                <Icon
                  name="tabler:chevron-down"
                  size={14}
                  className={cn('text-[var(--ink-400)]', queueOpen && 'rotate-180')}
                />
              </Button>
            </div>

            {queueOpen ? <div className="mt-4">{queue}</div> : null}
          </>
        ) : null}

        <KeyboardHintsBar className="mt-5 justify-center">
          <KeyboardHint keys="Enter">submit</KeyboardHint>
          <KeyboardHint keys="Esc">clear</KeyboardHint>
          <KeyboardHint keys="Scan">scanner sends both for you</KeyboardHint>
        </KeyboardHintsBar>
      </SectionCard>
    </div>
  )
}

export { ScanGatePanel, type ScanGatePanelProps }
