import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { SectionLabel } from '@/components/atoms/section-label.tsx'
import {
  ContextPickerPopover,
  type ContextPickerItem,
} from '@/components/molecules/context-picker-popover.tsx'

const meta: Meta<typeof ContextPickerPopover> = {
  title: 'Molecules/ContextPickerPopover',
  component: ContextPickerPopover,
  tags: ['autodocs', 'module:receptionist', 'module:phlebo'],
  argTypes: {
    label: { control: 'text' },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
    },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof ContextPickerPopover>

const STATIONS: ContextPickerItem[] = [
  { id: 'station-a', primary: 'Station A', subtitle: 'Reception · Front desk' },
  { id: 'station-b', primary: 'Station B', subtitle: 'Reception · Back desk' },
  { id: 'station-c', primary: 'Station C', subtitle: 'Phlebo room 1' },
  { id: 'station-d', primary: 'Station D', subtitle: 'Phlebo room 2' },
]

const SHIFTS: ContextPickerItem[] = [
  { id: 'morning', primary: 'Morning', subtitle: '07:00 – 13:00' },
  { id: 'afternoon', primary: 'Afternoon', subtitle: '13:00 – 19:00' },
  { id: 'evening', primary: 'Evening', subtitle: '19:00 – 23:00' },
]

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState('station-a')
    const item = STATIONS.find((s) => s.id === value)
    return (
      <ContextPickerPopover
        label="Station"
        triggerLabel={item?.primary ?? 'Pick station'}
        value={value}
        onValueChange={setValue}
        items={STATIONS}
      />
    )
  },
}

export const Playground: Story = {
  args: {
    label: 'Station',
    align: 'start',
  },
  render: function PlaygroundStory(args) {
    const [value, setValue] = useState('station-a')
    const item = STATIONS.find((s) => s.id === value)
    return (
      <ContextPickerPopover
        {...args}
        triggerLabel={item?.primary ?? 'Pick station'}
        value={value}
        onValueChange={setValue}
        items={STATIONS}
      />
    )
  },
}

export const Stations: Story = {
  render: function StationsStory() {
    const [value, setValue] = useState('station-a')
    const item = STATIONS.find((s) => s.id === value)
    return (
      <ContextPickerPopover
        label="Station"
        triggerLabel={
          <span className="inline-flex items-center gap-1.5">
            <SectionLabel>Station</SectionLabel>
            <span className="font-medium">{item?.primary}</span>
          </span>
        }
        value={value}
        onValueChange={setValue}
        items={STATIONS}
      />
    )
  },
}

export const Shifts: Story = {
  render: function ShiftsStory() {
    const [value, setValue] = useState('morning')
    const item = SHIFTS.find((s) => s.id === value)
    return (
      <ContextPickerPopover
        label="Shift"
        triggerLabel={
          <span className="inline-flex items-center gap-1.5">
            <SectionLabel>Shift</SectionLabel>
            <span className="font-medium">{item?.primary}</span>
            <span className="text-xs text-muted-foreground">{item?.subtitle}</span>
          </span>
        }
        value={value}
        onValueChange={setValue}
        items={SHIFTS}
      />
    )
  },
}

export const LongList: Story = {
  render: function LongListStory() {
    const items: ContextPickerItem[] = Array.from({ length: 12 }, (_, i) => ({
      id: `room-${i + 1}`,
      primary: `Room ${i + 1}`,
      subtitle: i % 2 === 0 ? 'Reception' : 'Phlebo',
    }))
    const [value, setValue] = useState('room-1')
    const item = items.find((s) => s.id === value)
    return (
      <ContextPickerPopover
        label="Room"
        triggerLabel={item?.primary ?? 'Pick room'}
        value={value}
        onValueChange={setValue}
        items={items}
      />
    )
  },
}

export const KeyboardOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Open with Enter/Space, then ↑/↓ to navigate, Home/End to jump to first/last, Enter to select, Esc to close.',
      },
    },
  },
  render: function KeyboardOnlyStory() {
    const [value, setValue] = useState('station-a')
    const item = STATIONS.find((s) => s.id === value)
    return (
      <ContextPickerPopover
        label="Station"
        triggerLabel={item?.primary ?? 'Pick station'}
        value={value}
        onValueChange={setValue}
        items={STATIONS}
      />
    )
  },
}
