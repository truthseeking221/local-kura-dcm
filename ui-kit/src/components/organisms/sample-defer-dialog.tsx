import { type ReactNode } from 'react'

import { Icon } from '../atoms/icon.tsx'
import { TubeDot, type TubeVisualSpec } from '../molecules/tube-visual.tsx'
import { Button } from '../ui/button.tsx'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog.tsx'
import { Textarea } from '../ui/textarea.tsx'

type SampleDeferDialogSample = {
  id: string
  tests: string[]
}

type SampleDeferDialogProps = {
  sample: SampleDeferDialogSample
  tube: TubeVisualSpec
  defaultReason?: string
  trigger?: ReactNode
  defaultOpen?: boolean
}

/**
 * Defer-sample modal from the Phlebo prototype.
 *
 * @kuraModules phlebo
 */
function SampleDeferDialog({
  sample,
  tube,
  defaultReason = 'Difficult vein',
  trigger,
  defaultOpen,
}: SampleDeferDialogProps) {
  return (
    <Dialog defaultOpen={defaultOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Defer sample</DialogTitle>
          <DialogDescription>
            Record why this collection cannot be completed in the current attempt.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-[var(--radius)] bg-[var(--surface-2)] px-3 py-2">
          <TubeDot tube={tube} />
          <span className="font-mono text-k-sm font-bold">{sample.id}</span>
          <span className="text-[var(--ink-400)]">/</span>
          <span className="text-k-sm font-bold text-[var(--ink-900)]">{tube.stopperLabel}</span>
          <span className="text-[var(--ink-400)]">/</span>
          <span className="truncate text-k-sm text-[var(--ink-600)]">{sample.tests.join(', ')}</span>
        </div>

        <label className="grid gap-1.5">
          <span className="text-k-body font-bold text-[var(--ink-900)]">Reason</span>
          <Button type="button" variant="outline" className="justify-between bg-[var(--surface)]">
            {defaultReason}
            <Icon name="tabler:chevron-down" size={14} />
          </Button>
        </label>
        <label className="grid gap-1.5">
          <span className="text-k-body font-bold text-[var(--ink-900)]">Note (optional)</span>
          <Textarea placeholder="Add context for the next attempt..." rows={3} />
        </label>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>
            <Icon name="tabler:clock" size={14} />
            Confirm defer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { SampleDeferDialog, type SampleDeferDialogProps, type SampleDeferDialogSample }
