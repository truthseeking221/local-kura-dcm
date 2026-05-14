import type { Meta, StoryObj } from '@storybook/react-vite'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

import { FilterGroup } from '@/components/molecules/filter-group.tsx'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx'

const meta: Meta<typeof FilterGroup> = {
  title: 'Molecules/FilterGroup',
  component: FilterGroup,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof FilterGroup>

export const Default: Story = {
  render: () => {
    const [price, setPrice] = useState('any')
    return (
      <FilterGroup label="Price">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={price}
          onValueChange={(v) => v && setPrice(v)}
        >
          <ToggleGroupItem value="any">Any</ToggleGroupItem>
          <ToggleGroupItem value="free">Free</ToggleGroupItem>
          <ToggleGroupItem value="lt25">≤ $25</ToggleGroupItem>
          <ToggleGroupItem value="25to50">$25–$50</ToggleGroupItem>
          <ToggleGroupItem value="gt50">$50+</ToggleGroupItem>
        </ToggleGroup>
      </FilterGroup>
    )
  },
}

export const WithIcon: Story = {
  render: () => {
    const [price, setPrice] = useState('any')
    return (
      <FilterGroup
        label="Price"
        icon={<SlidersHorizontal size={12} strokeWidth={2} aria-hidden />}
      >
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={price}
          onValueChange={(v) => v && setPrice(v)}
        >
          <ToggleGroupItem value="any">Any</ToggleGroupItem>
          <ToggleGroupItem value="free">Free</ToggleGroupItem>
          <ToggleGroupItem value="lt25">≤ $25</ToggleGroupItem>
          <ToggleGroupItem value="25to50">$25–$50</ToggleGroupItem>
          <ToggleGroupItem value="gt50">$50+</ToggleGroupItem>
        </ToggleGroup>
      </FilterGroup>
    )
  },
}

export const MultipleGroups: Story = {
  render: () => {
    const [price, setPrice] = useState('any')
    const [coverage, setCoverage] = useState('all')
    return (
      <div className="flex items-center gap-4">
        <FilterGroup
          label="Price"
          icon={<SlidersHorizontal size={12} strokeWidth={2} aria-hidden />}
        >
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={price}
            onValueChange={(v) => v && setPrice(v)}
          >
            <ToggleGroupItem value="any">Any</ToggleGroupItem>
            <ToggleGroupItem value="free">Free</ToggleGroupItem>
            <ToggleGroupItem value="lt25">≤ $25</ToggleGroupItem>
            <ToggleGroupItem value="25to50">$25–$50</ToggleGroupItem>
            <ToggleGroupItem value="gt50">$50+</ToggleGroupItem>
          </ToggleGroup>
        </FilterGroup>

        <FilterGroup label="Coverage">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={coverage}
            onValueChange={(v) => v && setCoverage(v)}
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="covered">Covered</ToggleGroupItem>
            <ToggleGroupItem value="not-covered">Not covered</ToggleGroupItem>
          </ToggleGroup>
        </FilterGroup>
      </div>
    )
  },
}

export const Playground: Story = {
  args: {
    label: 'Price',
    icon: <SlidersHorizontal size={12} strokeWidth={2} aria-hidden />,
  },
  render: (args) => {
    const [value, setValue] = useState('any')
    return (
      <FilterGroup {...args}>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={value}
          onValueChange={(v) => v && setValue(v)}
        >
          <ToggleGroupItem value="any">Any</ToggleGroupItem>
          <ToggleGroupItem value="free">Free</ToggleGroupItem>
          <ToggleGroupItem value="lt25">≤ $25</ToggleGroupItem>
        </ToggleGroup>
      </FilterGroup>
    )
  },
}
