import type { Meta, StoryObj } from '@storybook/react-vite'

import { KeyboardHint, KeyboardHintsBar } from '@/components/molecules/keyboard-hint.tsx'

const meta: Meta = {
  title: 'Molecules/KeyboardHint',
  component: KeyboardHint,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

export const Single: Story = {
  render: () => <KeyboardHint keys="⌘K">open search</KeyboardHint>,
}

export const Sequence: Story = {
  render: () => (
    <KeyboardHint keys={['↑', 'Enter']}>add/remove &amp; next</KeyboardHint>
  ),
}

export const CatalogStrip: Story = {
  render: () => (
    <KeyboardHintsBar>
      <KeyboardHint keys="/">search</KeyboardHint>
      <KeyboardHint keys={['↑', '↓']}>navigate</KeyboardHint>
      <KeyboardHint keys="Space">add/remove</KeyboardHint>
      <KeyboardHint keys="Enter">add/remove</KeyboardHint>
      <KeyboardHint keys={['↑', 'Enter']}>add/remove &amp; next</KeyboardHint>
      <KeyboardHint keys="Esc">clear</KeyboardHint>
    </KeyboardHintsBar>
  ),
}

const compactKbdClass =
  'h-[18px] min-w-[18px] rounded-[var(--radius-xs)] bg-[var(--surface)] px-[5px] text-[9.5px]'

export const Compact: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`density='compact'` shrinks the bar text to 10.5px (density-exempt per CLAUDE.md) " +
          'for dense catalog rails and order-cart footer strips. Pair with a small `kbdClassName` ' +
          'for the per-chip sizing. Mirrors the canonical Step 4 Orders catalog hint strip.',
      },
    },
  },
  render: () => (
    <KeyboardHintsBar density="compact" className="gap-x-3.5 gap-y-1">
      <KeyboardHint keys="/" kbdClassName={compactKbdClass} className="gap-1">
        search
      </KeyboardHint>
      <KeyboardHint keys={['↑', '↓']} kbdClassName={compactKbdClass} className="gap-1">
        navigate
      </KeyboardHint>
      <KeyboardHint keys="Space" kbdClassName={compactKbdClass} className="gap-1">
        add/remove
      </KeyboardHint>
      <KeyboardHint keys="Enter" kbdClassName={compactKbdClass} className="gap-1">
        add/remove
      </KeyboardHint>
      <KeyboardHint
        keys={['⇧', 'Enter']}
        keySeparator={<span className="font-semibold text-[var(--ink-400)]">+</span>}
        kbdClassName={compactKbdClass}
        className="gap-1"
      >
        add/remove &amp; next
      </KeyboardHint>
      <KeyboardHint keys="Esc" kbdClassName={compactKbdClass} className="gap-1">
        clear
      </KeyboardHint>
    </KeyboardHintsBar>
  ),
}
