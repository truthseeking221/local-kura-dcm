import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/components/ui/label.tsx'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'

const meta = {
  title: 'Atoms/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-72 space-y-1.5">
      <Label htmlFor="sex">Sex at birth *</Label>
      <Select>
        <SelectTrigger id="sex" className="w-full">
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="female">Female</SelectItem>
          <SelectItem value="male">Male</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Grouped: Story = {
  render: () => (
    <div className="w-80 space-y-1.5">
      <Label htmlFor="provider">Insurance provider *</Label>
      <Select>
        <SelectTrigger id="provider" className="w-full">
          <SelectValue placeholder="Select provider…" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Local</SelectLabel>
            <SelectItem value="forte">Forte Insurance</SelectItem>
            <SelectItem value="sovannaphum">Sovannaphum Life</SelectItem>
            <SelectItem value="asia">Asia Insurance</SelectItem>
            <SelectItem value="infinity">Infinity General Insurance</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>International</SelectLabel>
            <SelectItem value="prudential">Prudential</SelectItem>
            <SelectItem value="aia">AIA Cambodia</SelectItem>
            <SelectItem value="manulife">Manulife</SelectItem>
            <SelectItem value="bupa">Bupa Global</SelectItem>
            <SelectItem value="pacific-cross">Pacific Cross</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>National</SelectLabel>
            <SelectItem value="nssf">NSSF (National Social Security Fund)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}
