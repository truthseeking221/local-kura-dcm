import { type ChangeEvent, type ComponentProps, useId } from 'react'

import { Input } from '../ui/input.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.tsx'
import { cn } from '../../lib/cn.ts'

type Country = {
  /** ISO-3166-1 alpha-2 code, e.g. `KH`. */
  iso: string
  /** International dialling code with leading `+`, e.g. `+855`. */
  dial: string
  /** Display name. */
  name: string
}

const DEFAULT_COUNTRIES: Country[] = [
  { iso: 'KH', dial: '+855', name: 'Cambodia' },
  { iso: 'VN', dial: '+84', name: 'Vietnam' },
  { iso: 'TH', dial: '+66', name: 'Thailand' },
  { iso: 'LA', dial: '+856', name: 'Laos' },
  { iso: 'MY', dial: '+60', name: 'Malaysia' },
  { iso: 'SG', dial: '+65', name: 'Singapore' },
  { iso: 'US', dial: '+1', name: 'United States' },
  { iso: 'GB', dial: '+44', name: 'United Kingdom' },
  { iso: 'FR', dial: '+33', name: 'France' },
  { iso: 'AU', dial: '+61', name: 'Australia' },
]

type PhoneInputProps = Omit<ComponentProps<'div'>, 'onChange' | 'children' | 'defaultValue'> & {
  /** ISO code of the currently selected country. */
  country: string
  /** Local number (digits only — country code is stored separately). */
  number: string
  /** Fired with the next ISO code when the country changes. */
  onCountryChange: (iso: string) => void
  /** Fired with the next number string when the user types. */
  onNumberChange: (next: string) => void
  /** Country list. Defaults to a Cambodia-first regional list. */
  countries?: Country[]
  /** Number-input placeholder. */
  placeholder?: string
  /** Disable both the country select and the number input. */
  disabled?: boolean
}

/**
 * PhoneInput — country dial-code select + local number input. Stores the two
 * halves separately on the consumer; combine via `dialOf(country) + number`
 * when submitting.
 *
 * Defaults to Cambodia (+855) at the top of a regional country list. Pass
 * `countries` to extend.
 */
function PhoneInput({
  country,
  number,
  onCountryChange,
  onNumberChange,
  countries = DEFAULT_COUNTRIES,
  placeholder = '12 345 678',
  disabled,
  className,
  ...props
}: PhoneInputProps) {
  const inputId = useId()
  const dialOf = (iso: string) => countries.find((c) => c.iso === iso)?.dial ?? ''

  function handleNumberChange(event: ChangeEvent<HTMLInputElement>) {
    onNumberChange(event.target.value.replace(/[^\d ]/g, ''))
  }

  return (
    <div
      data-slot="phone-input"
      className={cn('flex w-full items-stretch gap-1.5', className)}
      {...props}
    >
      <Select value={country} onValueChange={onCountryChange} disabled={disabled}>
        <SelectTrigger className="w-[88px] shrink-0" aria-label="Country code">
          <SelectValue>{dialOf(country)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {countries.map((c) => (
            <SelectItem key={c.iso} value={c.iso}>
              <span className="font-mono text-xs tabular-nums">{c.dial}</span>
              <span className="ml-2 text-muted-foreground">{c.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={inputId}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={number}
        onChange={handleNumberChange}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
    </div>
  )
}

export { PhoneInput, DEFAULT_COUNTRIES, type Country }
