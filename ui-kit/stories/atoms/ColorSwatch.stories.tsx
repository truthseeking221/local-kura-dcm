import type { Meta, StoryObj } from '@storybook/react-vite'

import { ColorSwatch } from '@/components/atoms/color-swatch.tsx'

const meta = {
  title: 'Atoms/ColorSwatch',
  component: ColorSwatch,
  tags: ['autodocs'],
  args: { color: '#FFC107', size: 'md', ring: true },
  argTypes: {
    color: { control: 'color' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    ring: { control: 'boolean' },
    label: { control: 'text' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ColorSwatch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
        <ColorSwatch color="#9C27B0" size="sm" />
        <span>sm · 8</span>
      </div>
      <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
        <ColorSwatch color="#9C27B0" size="md" />
        <span>md · 10</span>
      </div>
      <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
        <ColorSwatch color="#9C27B0" size="lg" />
        <span>lg · 12</span>
      </div>
    </div>
  ),
}

export const Palette: Story = {
  // Phlebotomy tube colours (CLSI standard) used here only to show realistic
  // usage. The kit does NOT ship this palette — apps own domain palettes.
  render: () => {
    const TUBES = [
      { color: '#FFC107', label: 'Gold / SST', additive: 'Clot activator + gel' },
      { color: '#9C27B0', label: 'Lavender', additive: 'K2 EDTA / K3 EDTA' },
      { color: '#37474F', label: 'Dark Gray', additive: 'Sodium fluoride / K oxalate' },
      { color: '#E53935', label: 'Red', additive: 'Plain / no additive' },
      { color: '#43A047', label: 'Green', additive: 'Lithium heparin' },
      { color: '#1E88E5', label: 'Blue', additive: 'Sodium citrate (3.2%)' },
    ]
    return (
      <ul className="grid w-[320px] grid-cols-1 gap-2 rounded-[var(--radius-lg)] border border-border bg-card p-3">
        {TUBES.map((t) => (
          <li key={t.label} className="flex items-center gap-3 text-sm">
            <ColorSwatch color={t.color} size="lg" label={`${t.label} tube`} />
            <span className="flex flex-col">
              <span className="font-medium">{t.label}</span>
              <span className="text-xs text-muted-foreground">{t.additive}</span>
            </span>
          </li>
        ))}
      </ul>
    )
  },
}

export const InlineWithText: Story = {
  render: () => (
    <p className="text-sm">
      Filter by category:{' '}
      <span className="inline-flex items-center gap-1.5">
        <ColorSwatch color="#268CFF" /> Brand
      </span>
      {' · '}
      <span className="inline-flex items-center gap-1.5">
        <ColorSwatch color="#9C27B0" /> AI
      </span>
      {' · '}
      <span className="inline-flex items-center gap-1.5">
        <ColorSwatch color="#43A047" /> Success
      </span>
    </p>
  ),
}

export const RingComparison: Story = {
  render: () => (
    <div className="flex items-center gap-8 rounded-[var(--radius)] bg-card p-6">
      <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
        <ColorSwatch color="#FFFFFF" size="lg" ring />
        <span>ring on (default)</span>
      </div>
      <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
        <ColorSwatch color="#FFFFFF" size="lg" ring={false} />
        <span>ring off</span>
      </div>
    </div>
  ),
}
