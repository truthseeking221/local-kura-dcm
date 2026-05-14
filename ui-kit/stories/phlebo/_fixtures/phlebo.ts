export type BoothSection = 'vitals' | 'phlebotomy' | 'inspector'

export type JourneyState = 'done' | 'pending' | 'waiting' | 'skipped'

export type Patient = {
  id: string
  pid: string
  name: string
  initials: string
  sex: 'F' | 'M'
  dob: string
  mobile: string
  orderId: string
  checkInAt: string
  waitingMinutes: number
  fasting: string
  allergies: string[]
  journey: {
    identity: JourneyState
    vitals: JourneyState
    phlebotomy: JourneyState
  }
  vitals?: VitalsRecord
  samples: Sample[]
}

export type VitalsRecord = {
  heightCm: number
  weightKg: number
  heartRate: number
  bpSys: number
  bpDia: number
  temperatureC: number
  spo2: number
  breathingRate: number
  painVas: number
  fasting: string
}

export type TubeTone =
  | 'yellow'
  | 'blue'
  | 'red'
  | 'gold'
  | 'green'
  | 'grayGreen'
  | 'lavender'
  | 'pink'
  | 'white'
  | 'darkGray'

export type TubeSpec = {
  key: string
  order: number
  tone: TubeTone
  stopperLabel: string
  additive: string
  short: string
  inversions: number
  timeLimitMin: number | null
  handling: string[]
}

export type SampleStatus = 'generated' | 'collected' | 'deferred'

export type Sample = {
  id: string
  tube: string
  tests: string[]
  volumeMl: number
  container: string
  stat: boolean
  status: SampleStatus
  collectedAt?: string
  collectedBy?: string
  inverted?: boolean
  deferReason?: string
}

export const TUBE_CATALOG: TubeSpec[] = [
  {
    key: 'yellow-sps',
    order: 1,
    tone: 'yellow',
    stopperLabel: 'Yellow (SPS)',
    additive: 'Sodium polyanethol sulfonate',
    short: 'SPS',
    inversions: 8,
    timeLimitMin: null,
    handling: ['Mix gently, do not shake', 'Send for incubation immediately', 'Do not refrigerate'],
  },
  {
    key: 'light-blue',
    order: 2,
    tone: 'blue',
    stopperLabel: 'Light Blue',
    additive: 'Sodium citrate 3.2%',
    short: 'Citrate',
    inversions: 4,
    timeLimitMin: 30,
    handling: ['Fill exactly to mark', 'Centrifuge within 30 min', 'Keep at room temperature'],
  },
  {
    key: 'red',
    order: 3,
    tone: 'red',
    stopperLabel: 'Red',
    additive: 'None / clot activator',
    short: 'Plain',
    inversions: 5,
    timeLimitMin: null,
    handling: ['Allow to clot 30 min upright before centrifuging'],
  },
  {
    key: 'gold-sst',
    order: 4,
    tone: 'gold',
    stopperLabel: 'Gold / SST',
    additive: 'Clot activator + gel',
    short: 'SST',
    inversions: 5,
    timeLimitMin: 30,
    handling: ['Allow 30 min clot time', 'Centrifuge within 30-60 min', 'Keep upright'],
  },
  {
    key: 'green',
    order: 5,
    tone: 'green',
    stopperLabel: 'Green',
    additive: 'Lithium heparin +/- gel',
    short: 'LiHep',
    inversions: 8,
    timeLimitMin: 30,
    handling: ['Mix immediately to prevent clotting', 'Centrifuge within 30 min for stat chemistry'],
  },
  {
    key: 'gray-green',
    order: 6,
    tone: 'grayGreen',
    stopperLabel: 'Gray-Green',
    additive: 'Sodium heparin',
    short: 'NaHep',
    inversions: 8,
    timeLimitMin: 30,
    handling: ['Mix immediately', 'Send chilled if HLA typing'],
  },
  {
    key: 'lavender',
    order: 7,
    tone: 'lavender',
    stopperLabel: 'Lavender',
    additive: 'K2 EDTA / K3 EDTA',
    short: 'EDTA',
    inversions: 8,
    timeLimitMin: null,
    handling: ['Mix thoroughly; clots invalidate CBC', 'Stable at room temperature 24h'],
  },
  {
    key: 'pink',
    order: 8,
    tone: 'pink',
    stopperLabel: 'Pink',
    additive: 'K2 EDTA',
    short: 'EDTA-Pink',
    inversions: 8,
    timeLimitMin: null,
    handling: ['Mix thoroughly', 'Label with two patient identifiers'],
  },
  {
    key: 'white',
    order: 9,
    tone: 'white',
    stopperLabel: 'White / Pearl',
    additive: 'K2 EDTA + gel',
    short: 'PCR',
    inversions: 8,
    timeLimitMin: null,
    handling: ['Avoid freeze/thaw cycles', 'Process per molecular SOP'],
  },
  {
    key: 'dark-gray',
    order: 10,
    tone: 'darkGray',
    stopperLabel: 'Dark Gray',
    additive: 'Sodium fluoride / K oxalate',
    short: 'NaF',
    inversions: 8,
    timeLimitMin: 30,
    handling: ['Mix immediately to inhibit glycolysis', 'Process within 30 min for accurate glucose'],
  },
]

export const VITAL_FIELD_GROUPS = {
  biometrics: [
    { label: 'Height', range: '50-250 cm', unit: 'cm', required: true },
    { label: 'Weight', range: '1-300 kg', unit: 'kg', required: true },
  ],
  vitals: [
    { label: 'Heart Rate', range: '30-250 bpm', unit: 'bpm', required: true },
    { label: 'Temperature', range: '34-42 C', unit: 'C' },
    { label: 'SpO2', range: '85-100%', unit: '%' },
    { label: 'Breathing rate', range: '8-35 /min', unit: '/min' },
  ],
} as const

export const FASTING_OPTIONS = [
  'Not fasting',
  'Fasting < 8h',
  'Fasting 8-12h',
  'Fasting >= 12h',
] as const

export const PRE_ANALYTICAL_CHECKS = [
  'Patient ID confirmed',
  'Fasting status checked',
  'Allergies reviewed',
  'Patient consented',
  'Site confirmed (L/R arm)',
] as const

export const DEFAULT_DEFER_REASON = 'Difficult vein'

export function tubeByKey(key: string) {
  return TUBE_CATALOG.find((tube) => tube.key === key) ?? TUBE_CATALOG[0]
}

export const PHLEBO_QUEUE: Patient[] = [
  {
    id: 'p-001',
    pid: 'P123456',
    name: 'Maya Tran',
    initials: 'MT',
    sex: 'F',
    dob: '1995-02-14',
    mobile: '+855 12 222 333',
    orderId: '4521',
    checkInAt: '07:42',
    waitingMinutes: 23,
    fasting: '8-12h',
    allergies: ['Penicillin'],
    journey: { identity: 'done', vitals: 'pending', phlebotomy: 'waiting' },
    samples: [
      {
        id: '660100172636',
        tube: 'gold-sst',
        tests: ['Lipid panel', 'TFT'],
        volumeMl: 4,
        container: '4 mL SST',
        stat: false,
        status: 'generated',
      },
      {
        id: '660100172637',
        tube: 'lavender',
        tests: ['CBC', 'HbA1c'],
        volumeMl: 3,
        container: '3 mL EDTA',
        stat: false,
        status: 'generated',
      },
      {
        id: '660100172638',
        tube: 'dark-gray',
        tests: ['Fasting glucose'],
        volumeMl: 2,
        container: '2 mL NaF',
        stat: false,
        status: 'generated',
      },
    ],
  },
  {
    id: 'p-002',
    pid: 'P123457',
    name: 'Sophan Chea',
    initials: 'SC',
    sex: 'M',
    dob: '1978-07-03',
    mobile: '+855 96 555 411',
    orderId: '4522',
    checkInAt: '07:55',
    waitingMinutes: 12,
    fasting: '>=12h',
    allergies: [],
    journey: { identity: 'done', vitals: 'done', phlebotomy: 'pending' },
    vitals: {
      heightCm: 172,
      weightKg: 78,
      heartRate: 84,
      bpSys: 134,
      bpDia: 86,
      temperatureC: 36.8,
      spo2: 98,
      breathingRate: 16,
      painVas: 2,
      fasting: '>=12h',
    },
    samples: [
      {
        id: '660100172701',
        tube: 'light-blue',
        tests: ['PT/INR', 'APTT'],
        volumeMl: 2.7,
        container: '2.7 mL Citrate',
        stat: true,
        status: 'generated',
      },
      {
        id: '660100172702',
        tube: 'gold-sst',
        tests: ['Comprehensive metabolic'],
        volumeMl: 4,
        container: '4 mL SST',
        stat: false,
        status: 'generated',
      },
      {
        id: '660100172703',
        tube: 'lavender',
        tests: ['CBC'],
        volumeMl: 3,
        container: '3 mL EDTA',
        stat: false,
        status: 'generated',
      },
    ],
  },
  {
    id: 'p-003',
    pid: 'P123458',
    name: 'Aiko Nakamura',
    initials: 'AN',
    sex: 'F',
    dob: '1989-11-21',
    mobile: '+855 11 998 220',
    orderId: '4523',
    checkInAt: '07:30',
    waitingMinutes: 38,
    fasting: '8-12h',
    allergies: ['Latex'],
    journey: { identity: 'done', vitals: 'pending', phlebotomy: 'waiting' },
    samples: [
      {
        id: '660100172810',
        tube: 'gold-sst',
        tests: ['TFT panel'],
        volumeMl: 4,
        container: '4 mL SST',
        stat: false,
        status: 'generated',
      },
      {
        id: '660100172811',
        tube: 'lavender',
        tests: ['CBC', 'ESR'],
        volumeMl: 3,
        container: '3 mL EDTA',
        stat: false,
        status: 'generated',
      },
    ],
  },
  {
    id: 'p-004',
    pid: 'P123460',
    name: 'Nina Patel',
    initials: 'NP',
    sex: 'F',
    dob: '1968-09-30',
    mobile: '+855 70 414 700',
    orderId: '4525',
    checkInAt: '07:18',
    waitingMinutes: 64,
    fasting: '>=12h',
    allergies: ['Sulfa drugs'],
    journey: { identity: 'done', vitals: 'pending', phlebotomy: 'waiting' },
    samples: [
      {
        id: '660100173005',
        tube: 'yellow-sps',
        tests: ['Blood cultures x2'],
        volumeMl: 10,
        container: '10 mL SPS',
        stat: true,
        status: 'generated',
      },
      {
        id: '660100173006',
        tube: 'gold-sst',
        tests: ['CMP', 'CRP'],
        volumeMl: 4,
        container: '4 mL SST',
        stat: true,
        status: 'generated',
      },
      {
        id: '660100173007',
        tube: 'lavender',
        tests: ['CBC'],
        volumeMl: 3,
        container: '3 mL EDTA',
        stat: false,
        status: 'generated',
      },
    ],
  },
  {
    id: 'p-005',
    pid: 'P123461',
    name: 'Srey Mom',
    initials: 'SM',
    sex: 'F',
    dob: '1982-12-09',
    mobile: '+855 15 808 221',
    orderId: '4526',
    checkInAt: '07:34',
    waitingMinutes: 47,
    fasting: '8-12h',
    allergies: [],
    journey: { identity: 'done', vitals: 'pending', phlebotomy: 'waiting' },
    samples: [
      {
        id: '660100173101',
        tube: 'gold-sst',
        tests: ['Liver function', 'Electrolytes'],
        volumeMl: 4,
        container: '4 mL SST',
        stat: false,
        status: 'generated',
      },
      {
        id: '660100173102',
        tube: 'lavender',
        tests: ['CBC'],
        volumeMl: 3,
        container: '3 mL EDTA',
        stat: false,
        status: 'generated',
      },
    ],
  },
  {
    id: 'p-006',
    pid: 'P123462',
    name: 'Vuthy Sok',
    initials: 'VS',
    sex: 'M',
    dob: '1971-05-18',
    mobile: '+855 77 240 919',
    orderId: '4527',
    checkInAt: '07:49',
    waitingMinutes: 31,
    fasting: 'not fasting',
    allergies: ['Iodine'],
    journey: { identity: 'done', vitals: 'done', phlebotomy: 'pending' },
    vitals: {
      heightCm: 168,
      weightKg: 69,
      heartRate: 96,
      bpSys: 146,
      bpDia: 88,
      temperatureC: 37.1,
      spo2: 97,
      breathingRate: 18,
      painVas: 3,
      fasting: 'not fasting',
    },
    samples: [
      {
        id: '660100173201',
        tube: 'green',
        tests: ['STAT electrolytes'],
        volumeMl: 4,
        container: '4 mL LiHep',
        stat: true,
        status: 'collected',
        collectedAt: '08:11',
        collectedBy: 'Linh Nguyen',
        inverted: false,
      },
      {
        id: '660100173202',
        tube: 'gold-sst',
        tests: ['Troponin I'],
        volumeMl: 4,
        container: '4 mL SST',
        stat: true,
        status: 'generated',
      },
    ],
  },
  {
    id: 'p-007',
    pid: 'P123463',
    name: 'Hana Kim',
    initials: 'HK',
    sex: 'F',
    dob: '1999-03-27',
    mobile: '+855 12 621 004',
    orderId: '4528',
    checkInAt: '08:09',
    waitingMinutes: 18,
    fasting: '<8h',
    allergies: [],
    journey: { identity: 'done', vitals: 'pending', phlebotomy: 'waiting' },
    samples: [
      {
        id: '660100173301',
        tube: 'lavender',
        tests: ['CBC', 'Ferritin'],
        volumeMl: 3,
        container: '3 mL EDTA',
        stat: false,
        status: 'generated',
      },
      {
        id: '660100173302',
        tube: 'gold-sst',
        tests: ['Iron studies'],
        volumeMl: 4,
        container: '4 mL SST',
        stat: false,
        status: 'generated',
      },
    ],
  },
  {
    id: 'p-008',
    pid: 'P123465',
    name: 'Marcus Lee',
    initials: 'ML',
    sex: 'M',
    dob: '1990-01-19',
    mobile: '+855 96 117 552',
    orderId: '4530',
    checkInAt: '08:18',
    waitingMinutes: 9,
    fasting: 'not fasting',
    allergies: [],
    journey: { identity: 'done', vitals: 'pending', phlebotomy: 'waiting' },
    samples: [
      {
        id: '660100173501',
        tube: 'gold-sst',
        tests: ['Vitamin D', 'B12'],
        volumeMl: 4,
        container: '4 mL SST',
        stat: false,
        status: 'deferred',
        deferReason: 'Difficult vein',
      },
    ],
  },
]

export const MAYA = PHLEBO_QUEUE[0]
export const SOPHAN = PHLEBO_QUEUE[1]
export const VUTHY = PHLEBO_QUEUE[5]

export function queueForSection(section: BoothSection) {
  if (section === 'vitals') {
    return PHLEBO_QUEUE.filter((patient) => patient.journey.vitals !== 'done')
  }
  if (section === 'phlebotomy') {
    return PHLEBO_QUEUE.filter((patient) => patient.journey.phlebotomy !== 'done')
  }
  return PHLEBO_QUEUE
}

export function allSamples() {
  return PHLEBO_QUEUE.flatMap((patient) =>
    patient.samples.map((sample) => ({ patient, sample })),
  )
}

export function formatAge(dob: string) {
  const birthDate = new Date(dob)
  if (Number.isNaN(birthDate.getTime())) return ''
  const today = new Date('2026-05-12T00:00:00')
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthOffset = today.getMonth() - birthDate.getMonth()
  if (monthOffset < 0 || (monthOffset === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }
  return `${age}y`
}
