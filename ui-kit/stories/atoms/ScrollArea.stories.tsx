import type { Meta, StoryObj } from '@storybook/react-vite'

import { SectionLabel } from '@/components/atoms/section-label.tsx'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'

const meta = {
  title: 'Atoms/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

const TESTS = [
  ['Complete Blood Count (CBC)', 'HAEM'],
  ['Blood Glucose (Fasting)', 'BIOCHEM'],
  ['Lipid Panel', 'BIOCHEM'],
  ['HbA1c (Diabetes)', 'BIOCHEM'],
  ['Thyroid Stimulating Hormone', 'HORMONE'],
  ['Urinalysis', 'URINE'],
  ['Liver Function Tests', 'BIOCHEM'],
  ['Kidney Function Tests', 'BIOCHEM'],
  ['Vitamin D', 'BIOCHEM'],
  ['Iron Studies', 'HAEM'],
  ['Pap Smear', "WOMEN'S"],
  ['ECG — 12 lead', 'CARDIO'],
] as const

export const TestList: Story = {
  render: () => (
    <ScrollArea className="h-72 w-80 rounded-[var(--radius-lg)] border border-border bg-card">
      <ul className="divide-y divide-border">
        {TESTS.map(([name, tag]) => (
          <li key={name} className="flex items-center justify-between px-4 py-2.5">
            <div>
              <div className="text-sm">{name}</div>
              <SectionLabel as="div">{tag}</SectionLabel>
            </div>
            <span className="font-mono text-sm tabular-nums">$8.00</span>
          </li>
        ))}
      </ul>
    </ScrollArea>
  ),
}
