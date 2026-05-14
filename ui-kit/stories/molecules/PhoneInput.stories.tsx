import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { PhoneInput } from '@/components/molecules/phone-input.tsx'
import { Label } from '@/components/ui/label.tsx'

const meta: Meta = {
  title: 'Molecules/PhoneInput',
  component: PhoneInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const [country, setCountry] = useState('KH')
    const [number, setNumber] = useState('')
    return (
      <div className="w-80 space-y-1.5">
        <Label>Mobile *</Label>
        <PhoneInput
          country={country}
          number={number}
          onCountryChange={setCountry}
          onNumberChange={setNumber}
        />
        <p className="text-xs text-muted-foreground">
          Enter a valid number — OTP will send automatically.
        </p>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => {
    const [country, setCountry] = useState('KH')
    const [number, setNumber] = useState('12345678')
    return (
      <div className="w-80 space-y-1.5">
        <Label>Mobile (disabled)</Label>
        <PhoneInput
          country={country}
          number={number}
          onCountryChange={setCountry}
          onNumberChange={setNumber}
          disabled
        />
      </div>
    )
  },
}

export const WithError: Story = {
  render: () => {
    const [country, setCountry] = useState('KH')
    const [number, setNumber] = useState('123')
    return (
      <div className="w-80 space-y-1.5">
        <Label htmlFor="mobile-err">Mobile *</Label>
        <PhoneInput
          country={country}
          number={number}
          onCountryChange={setCountry}
          onNumberChange={setNumber}
          aria-invalid
          aria-describedby="mobile-err-msg"
          className="[&_input]:border-destructive [&_input]:ring-1 [&_input]:ring-destructive/20"
        />
        <p id="mobile-err-msg" className="text-xs text-destructive">
          Number is too short — Cambodia mobile is 8 digits.
        </p>
      </div>
    )
  },
}

export const PrefilledVietnam: Story = {
  render: () => {
    const [country, setCountry] = useState('VN')
    const [number, setNumber] = useState('912345678')
    return (
      <div className="w-80 space-y-1.5">
        <Label>Mobile *</Label>
        <PhoneInput
          country={country}
          number={number}
          onCountryChange={setCountry}
          onNumberChange={setNumber}
        />
      </div>
    )
  },
}

export const CustomCountries: Story = {
  render: () => {
    const [country, setCountry] = useState('KH')
    const [number, setNumber] = useState('')
    return (
      <div className="w-80 space-y-1.5">
        <Label>Mobile (Mekong only)</Label>
        <PhoneInput
          country={country}
          number={number}
          onCountryChange={setCountry}
          onNumberChange={setNumber}
          countries={[
            { iso: 'KH', dial: '+855', name: 'Cambodia' },
            { iso: 'VN', dial: '+84', name: 'Vietnam' },
            { iso: 'LA', dial: '+856', name: 'Laos' },
            { iso: 'TH', dial: '+66', name: 'Thailand' },
          ]}
        />
      </div>
    )
  },
}

export const CustomPlaceholder: Story = {
  render: () => {
    const [country, setCountry] = useState('KH')
    const [number, setNumber] = useState('')
    return (
      <div className="w-80 space-y-1.5">
        <Label>Guardian mobile</Label>
        <PhoneInput
          country={country}
          number={number}
          onCountryChange={setCountry}
          onNumberChange={setNumber}
          placeholder="Same as patient if blank"
        />
      </div>
    )
  },
}

export const KhmerLabel: Story = {
  render: () => {
    const [country, setCountry] = useState('KH')
    const [number, setNumber] = useState('')
    return (
      <div className="w-80 space-y-1.5" lang="km">
        <Label>លេខទូរស័ព្ទចល័ត *</Label>
        <PhoneInput
          country={country}
          number={number}
          onCountryChange={setCountry}
          onNumberChange={setNumber}
        />
        <p className="text-xs text-muted-foreground">
          OTP នឹងផ្ញើទៅលេខនេះដោយស្វ័យប្រវត្តិ។
        </p>
      </div>
    )
  },
}
