import type { Meta, StoryObj } from '@storybook/react-vite'
import { SectionLabel } from '@/components/atoms/section-label.tsx'
import { Banner } from '@/components/molecules/banner.tsx'
import { KeyboardHint } from '@/components/molecules/keyboard-hint.tsx'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta: Meta = {
  title: 'Receptionist/Modals',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

const SHORTCUTS: Array<{ group: string; rows: Array<{ keys: string | string[]; label: string }> }> = [
  {
    group: 'Navigation',
    rows: [
      { keys: ['F1', '–', 'F6'], label: 'Jump to step 1–6' },
      { keys: 'Tab', label: 'Next field' },
      { keys: ['Shift', 'Tab'], label: 'Previous field' },
      { keys: 'Enter', label: 'Next step' },
      { keys: 'Esc', label: 'Close panel / cancel' },
    ],
  },
  {
    group: 'Patient',
    rows: [
      { keys: ['Ctrl', 'N'], label: 'New walk-in' },
      { keys: '⌘K', label: 'Open command palette' },
      { keys: '/', label: 'Search patients' },
    ],
  },
  {
    group: 'Cart',
    rows: [
      { keys: ['↑', '↓'], label: 'Navigate cart items' },
      { keys: 'Space', label: 'Toggle item' },
      { keys: ['Ctrl', 'P'], label: 'Pay / confirm' },
    ],
  },
]

export const HotkeyCheatsheet: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button variant="outline">Open cheatsheet</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Reception runs hands-on-keyboard. Press <kbd className="rounded bg-muted px-1.5 font-mono text-[11px]">?</kbd> any time to reopen this panel.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {SHORTCUTS.map((group) => (
            <section key={group.group}>
              <SectionLabel as="div" className="mb-2 block">
                {group.group}
              </SectionLabel>
              <div className="grid grid-cols-1 gap-1.5">
                {group.rows.map((row, i) => (
                  <div key={i} className="flex items-center justify-between rounded-[var(--radius-sm)] px-2 py-1 text-sm hover:bg-accent">
                    <span className="text-muted-foreground">{row.label}</span>
                    <KeyboardHint keys={row.keys}>{''}</KeyboardHint>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const PaidEditPrompt: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button variant="outline">Show paid-edit prompt</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="tabler:alert-triangle" size={18} className="text-[var(--warn-500)]" />
            Cart edited after payment
          </DialogTitle>
          <DialogDescription>
            Payment is confirmed. Choose how to record the change to keep accounting in order.
          </DialogDescription>
        </DialogHeader>

        <Banner tone="warning" title="Original payment stays">
          Voiding the order requires a supervisor PIN. Supplemental adds a new charge on top.
        </Banner>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full">Add supplemental charge</Button>
          <Button variant="outline" className="w-full">
            Void original & recompute
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" className="w-full">
              Cancel edit
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const RecaptureConfirm: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button variant="outline">Show re-capture confirm</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="tabler:alert-triangle" size={18} className="text-[var(--warn-500)]" />
            Re-capture identity?
          </DialogTitle>
          <DialogDescription>
            You'll start over with QR / NFC / manual. Captured data stays until a new method
            overwrites it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>Yes, re-capture</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
