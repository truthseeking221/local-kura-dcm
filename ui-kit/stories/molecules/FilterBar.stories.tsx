import type { Meta, StoryObj } from '@storybook/react-vite'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

import { FilterBar } from '@/components/molecules/filter-bar.tsx'
import { FilterGroup } from '@/components/molecules/filter-group.tsx'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx'

const meta: Meta<typeof FilterBar> = {
  title: 'Molecules/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof FilterBar>

export const Default: Story = {
  render: () => {
    function PriceAndCoverage() {
      const [price, setPrice] = useState('any')
      const [coverage, setCoverage] = useState('all')
      return (
        <FilterBar>
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
        </FilterBar>
      )
    }
    return <PriceAndCoverage />
  },
}

export const WithIcon: Story = {
  render: () => {
    function PriceWithIcon() {
      const [price, setPrice] = useState('any')
      const [coverage, setCoverage] = useState('all')
      return (
        <FilterBar>
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
        </FilterBar>
      )
    }
    return <PriceWithIcon />
  },
}

export const Playground: Story = {
  render: () => {
    function Playable() {
      const [value, setValue] = useState('any')
      return (
        <FilterBar>
          <FilterGroup
            label="Price"
            icon={<SlidersHorizontal size={12} strokeWidth={2} aria-hidden />}
          >
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
        </FilterBar>
      )
    }
    return <Playable />
  },
}
