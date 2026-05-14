/**
 * Mock data for receptionist Storybook scenarios. Static — no API, no logic.
 * Mirrors the shape of `Patient` in the old `@kura/domain` package, trimmed
 * to fields the receptionist screens actually render.
 */

export type Sex = 'Female' | 'Male' | 'Other'
export type Lang = 'English' | 'Khmer'
export type StationId = 'PSC-01' | 'PSC-02' | 'PSC-03'
export type ShiftId = 'morning' | 'afternoon' | 'night'

export type CartItem = {
  id: string
  kind: 'visit' | 'lab' | 'imaging' | 'ecg' | 'vitals' | 'telecon'
  name: string
  price: number
  qty: number
  auto?: boolean
}

export type Patient = {
  id: string
  queueNumber: string
  initials: string
  name: string
  nameKhmer?: string
  dob: string
  age: number
  sexAtBirth: Sex | ''
  countryCode: string
  phoneNumber: string
  idNumber: string
  language: Lang
  payer: 'direct' | 'insurance' | 'corporate' | 'referral'
  arrivedLabel: string
  status: { tone: 'info' | 'success' | 'warning' | 'danger'; label: string }
  identitySource: 'qr' | 'chip' | 'manual' | 'existing' | null
  lockedFields: Array<'name' | 'dob' | 'sexAtBirth' | 'idNumber'>
  capturedAt?: string
  cart: { items: CartItem[]; ccy: 'USD' | 'KHR' }
}

export const STATIONS: Array<{ id: StationId; caption: string }> = [
  { id: 'PSC-01', caption: 'Main reception' },
  { id: 'PSC-02', caption: 'Triage desk' },
  { id: 'PSC-03', caption: 'Express counter' },
]

export const SHIFTS: Array<{ id: ShiftId; label: string; time: string }> = [
  { id: 'morning', label: 'Morning', time: '07:00 – 13:00' },
  { id: 'afternoon', label: 'Afternoon', time: '13:00 – 19:00' },
  { id: 'night', label: 'Night', time: '19:00 – 23:00' },
]

export const RECEPTIONIST: { name: string; initials: string; role: string } = {
  name: 'Linh Nguyen',
  initials: 'LN',
  role: 'Receptionist',
}

export const BLANK_PATIENT: Patient = {
  id: 'p1',
  queueNumber: 'Q-001',
  initials: '—',
  name: '',
  dob: '',
  age: 0,
  sexAtBirth: '',
  countryCode: '+855',
  phoneNumber: '',
  idNumber: '',
  language: 'Khmer',
  payer: 'direct',
  arrivedLabel: 'Just now',
  status: { tone: 'info', label: 'Awaiting check-in' },
  identitySource: null,
  lockedFields: [],
  cart: {
    ccy: 'USD',
    items: [
      { id: 'vit-pkg', kind: 'vitals', name: 'Vital signs package', price: 0, qty: 1, auto: true },
      { id: 'telecon', kind: 'telecon', name: 'Teleconsultation', price: 0, qty: 1, auto: true },
    ],
  },
}

export const CAPTURED_PATIENT: Patient = {
  id: 'p2',
  queueNumber: 'Q-002',
  initials: 'MT',
  name: 'Maya Tran',
  nameKhmer: 'មាយ៉ា ត្រាន',
  dob: '1996-02-14',
  age: 29,
  sexAtBirth: 'Female',
  countryCode: '+855',
  phoneNumber: '12 345 678',
  idNumber: '012345678',
  language: 'English',
  payer: 'direct',
  arrivedLabel: '08:24 · 12 min ago',
  status: { tone: 'success', label: 'Identity captured' },
  identitySource: 'qr',
  lockedFields: ['name', 'dob', 'sexAtBirth', 'idNumber'],
  capturedAt: '08:23',
  cart: {
    ccy: 'USD',
    items: [
      { id: 'vit-pkg', kind: 'vitals', name: 'Vital signs package', price: 0, qty: 1, auto: true },
      { id: 'cbc', kind: 'lab', name: 'CBC (Complete Blood Count)', price: 12, qty: 1 },
      { id: 'lipid', kind: 'lab', name: 'Lipid panel', price: 18, qty: 1 },
      { id: 'telecon', kind: 'telecon', name: 'Teleconsultation', price: 15, qty: 1, auto: true },
    ],
  },
}

export const EMPTY_CART_PATIENT: Patient = {
  ...CAPTURED_PATIENT,
  id: 'p-empty-cart',
  queueNumber: 'Q-005',
  cart: {
    ...CAPTURED_PATIENT.cart,
    items: [],
  },
}

export const QUEUE: Patient[] = [
  CAPTURED_PATIENT,
  {
    ...BLANK_PATIENT,
    id: 'p3',
    queueNumber: 'Q-003',
    name: 'Sok Sreymom',
    initials: 'SS',
    dob: '1988-07-02',
    age: 37,
    sexAtBirth: 'Female',
    phoneNumber: '92 110 008',
    idNumber: '110800077',
    arrivedLabel: '08:31 · 5 min ago',
    status: { tone: 'warning', label: 'Verify patient' },
    identitySource: 'manual',
    cart: BLANK_PATIENT.cart,
  },
  {
    ...BLANK_PATIENT,
    id: 'p4',
    queueNumber: 'Q-004',
    arrivedLabel: 'Just now',
    status: { tone: 'info', label: 'Awaiting check-in' },
  },
]

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

// Wizard step labels for the receptionist's 6-step intake wizard. Used by
// the step-level stories to build a `StepperStep[]` driven by
// `currentStep` + `doneThroughStep`.
export const WIZARD_LABELS = [
  'Identity',
  'Patient',
  'Insurance',
  'Orders',
  'Pre & post consult',
  'Payment',
] as const

export type WizardStepStatus = 'locked' | 'active' | 'done'

export function buildSteps(
  currentStep: number,
  doneThroughStep: number,
): Array<{ label: string; status: WizardStepStatus }> {
  return WIZARD_LABELS.map((label, index) => {
    const stepNumber = index + 1
    const status: WizardStepStatus =
      stepNumber <= doneThroughStep ? 'done' : stepNumber === currentStep ? 'active' : 'locked'
    return { label, status }
  })
}
