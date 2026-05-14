import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Foundations/Hello',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ThemeSmoke: Story = {
  render: () => (
    <div className="min-h-screen bg-background text-foreground p-12 font-sans">
      <div className="max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Kura UI Kit</h1>
          <p className="text-muted-foreground">
            Theme is loading correctly when this card renders with the Kura brand blue
            border, the brand-tinted accent block, and Noto Sans typography.
          </p>
        </header>

        <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="inline-block size-6 rounded-full"
              style={{ background: 'var(--brand-500)' }}
              aria-hidden
            />
            <code className="font-mono text-sm">--brand-500 · #268CFF</code>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="inline-block size-6 rounded-full"
              style={{ background: 'var(--secondary-deep-500)' }}
              aria-hidden
            />
            <code className="font-mono text-sm">--secondary-deep-500 · #10069F</code>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="inline-block size-6 rounded-full"
              style={{ background: 'var(--secondary-light-500)' }}
              aria-hidden
            />
            <code className="font-mono text-sm">--secondary-light-500 · #60CDFF</code>
          </div>
        </div>

        <div className="rounded-[var(--radius)] bg-accent text-accent-foreground p-4 text-sm">
          Brand-tinted accent surface (uses <code>--color-accent</code>).
        </div>

        <p className="font-mono text-sm text-muted-foreground">
          JetBrains Mono renders here · 0123456789 · MRN-001-K
        </p>
      </div>
    </div>
  ),
}
