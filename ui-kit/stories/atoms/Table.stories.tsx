import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'

const meta = {
  title: 'Atoms/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const TUBES = [
  { id: '660100172636', tube: 'Gold / SST', tests: 'Lipid panel, TFT', vol: '4 mL' },
  { id: '660100172637', tube: 'Lavender', tests: 'CBC, HbA1c', vol: '3 mL' },
  { id: '660100172638', tube: 'Dark Gray', tests: 'Fasting glucose', vol: '2 mL' },
  { id: '660100172639', tube: 'Red', tests: 'Cross-match', vol: '6 mL' },
]

export const Default: Story = {
  render: () => (
    <div className="w-[640px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-k-xs uppercase tracking-wider text-muted-foreground">Tube</TableHead>
            <TableHead className="text-k-xs uppercase tracking-wider text-muted-foreground">Sample ID</TableHead>
            <TableHead className="text-k-xs uppercase tracking-wider text-muted-foreground">Tests</TableHead>
            <TableHead className="text-right text-k-xs uppercase tracking-wider text-muted-foreground">Vol</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {TUBES.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.tube}</TableCell>
              <TableCell className="font-mono text-xs">{row.id}</TableCell>
              <TableCell>{row.tests}</TableCell>
              <TableCell className="text-right">{row.vol}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

export const WithCaption: Story = {
  render: () => (
    <div className="w-[640px]">
      <Table>
        <TableCaption>Outstanding tubes for sample 660100172636.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-k-xs uppercase tracking-wider text-muted-foreground">Tube</TableHead>
            <TableHead className="text-k-xs uppercase tracking-wider text-muted-foreground">Tests</TableHead>
            <TableHead className="text-right text-k-xs uppercase tracking-wider text-muted-foreground">Vol</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {TUBES.slice(0, 3).map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.tube}</TableCell>
              <TableCell>{row.tests}</TableCell>
              <TableCell className="text-right">{row.vol}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

export const WithSelectedRow: Story = {
  render: () => (
    <div className="w-[640px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-k-xs uppercase tracking-wider text-muted-foreground">Tube</TableHead>
            <TableHead className="text-k-xs uppercase tracking-wider text-muted-foreground">Sample ID</TableHead>
            <TableHead className="text-k-xs uppercase tracking-wider text-muted-foreground">Tests</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {TUBES.slice(0, 3).map((row, i) => (
            <TableRow
              key={row.id}
              data-state={i === 1 ? 'selected' : undefined}
              className={i === 1 ? 'bg-muted/60' : undefined}
            >
              <TableCell className="font-medium">{row.tube}</TableCell>
              <TableCell className="font-mono text-xs">{row.id}</TableCell>
              <TableCell>{row.tests}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <div className="w-[640px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-k-xs uppercase tracking-wider text-muted-foreground">Tube</TableHead>
            <TableHead className="text-k-xs uppercase tracking-wider text-muted-foreground">Tests</TableHead>
            <TableHead className="text-right text-k-xs uppercase tracking-wider text-muted-foreground">Vol</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {TUBES.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.tube}</TableCell>
              <TableCell>{row.tests}</TableCell>
              <TableCell className="text-right">{row.vol}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total volume</TableCell>
            <TableCell className="text-right font-medium">15 mL</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ),
}

export const Density: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid gap-8">
      {(['compact', 'cozy', 'comfortable'] as const).map((density) => (
        <div key={density} data-density={density} className="w-[640px] space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            data-density=&quot;{density}&quot;
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-k-xs uppercase tracking-wider text-muted-foreground">Tube</TableHead>
                <TableHead className="text-k-xs uppercase tracking-wider text-muted-foreground">Tests</TableHead>
                <TableHead className="text-right text-k-xs uppercase tracking-wider text-muted-foreground">Vol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TUBES.slice(0, 3).map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.tube}</TableCell>
                  <TableCell>{row.tests}</TableCell>
                  <TableCell className="text-right">{row.vol}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  ),
}
