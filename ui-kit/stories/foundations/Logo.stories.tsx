import type { Meta, StoryObj } from '@storybook/react-vite'

const fullLogoUrl = new URL('./assets/kura-full-logo.svg', import.meta.url).href
const iconLogoUrl = new URL('./assets/kura-icon-logo.svg', import.meta.url).href

const symbolPaths = [
  'M108.739 109.317V175.771C108.739 179.104 106.032 181.811 102.698 181.811H78.535C75.201 181.811 72.4941 179.104 72.4941 175.771V109.317H108.739Z',
  'M211.952 181.811H181.229L108.734 109.317H154.043L216.229 171.503C220.032 175.306 217.338 181.807 211.961 181.807H211.947L211.952 181.811Z',
  'M216.221 10.3087L154.035 72.4945H108.727L181.235 0H211.958C217.344 0 220.038 6.50551 216.225 10.3087H216.221Z',
  'M108.739 6.04083V72.4945L72.4945 108.739H6.04083C2.70687 108.739 0 106.033 0 102.699V78.5353C0 75.2013 2.70687 72.4945 6.04083 72.4945H72.4945V6.04083C72.4945 2.70687 75.2013 0 78.5353 0H102.699C106.033 0 108.739 2.70687 108.739 6.04083Z',
] as const

const wordmarkPaths = [
  ...symbolPaths,
  'M306.283 56H335.192V182.131H312.319C308.985 182.131 306.283 179.429 306.283 176.095V162.786C302.457 168.651 297.436 173.334 291.205 176.857C284.975 180.381 277.626 182.131 269.144 182.131C254.518 182.131 243.091 177.489 234.875 168.186C226.642 158.884 222.541 146.197 222.541 130.128V56.0135H251.45V124.606C251.45 134.156 253.729 141.645 258.308 147.095C262.878 152.545 269.397 155.261 277.878 155.261C286.36 155.261 293.407 152.166 298.568 145.958C303.716 139.769 306.296 131.386 306.296 120.839V56H306.283Z',
  'M423.607 86.9215C422.272 86.2538 419.782 85.9154 416.132 85.9154C405.498 85.9154 397.139 89.7276 391.084 97.3429C385.016 104.967 381.985 115.141 381.985 127.863V182.131H359.351C356.017 182.131 353.314 179.429 353.314 176.095V56H381.732V80.1408C384.728 72.9405 389.546 67.2019 396.191 62.9341C402.837 58.6663 410.15 56.5278 418.126 56.5278C421.284 56.5278 423.111 56.7805 423.612 57.2813V86.9305H423.598V86.917L423.607 86.9215Z',
  'M556.001 59.1627V182.37H534.278C530.944 182.37 528.242 179.668 528.242 176.334V162.001C523.852 168.222 518.1 173.162 510.958 176.853C503.817 180.53 496.107 182.37 487.833 182.37C479.559 182.37 471.889 180.737 464.82 177.466C457.764 174.196 451.628 169.734 446.44 164.09C441.238 158.446 437.146 151.783 434.146 144.086C431.146 136.403 429.648 128.129 429.648 119.3C429.648 110.471 431.146 102.211 434.146 94.5144C437.146 86.8314 441.238 80.1544 446.44 74.5106C451.628 68.8668 457.764 64.405 464.82 61.1342C471.876 57.8634 479.545 56.2302 487.833 56.2302C496.12 56.2302 503.817 57.913 510.958 61.2605C518.1 64.617 523.866 69.3991 528.242 75.6204V59.1852L556.001 59.1627ZM457.89 119.291C457.89 124.529 458.824 129.397 460.692 133.895C462.559 138.393 465.081 142.327 468.239 145.674C471.406 149.031 475.173 151.683 479.559 153.655C483.948 155.622 488.645 156.605 493.684 156.605C498.723 156.605 503.424 155.622 507.814 153.655C512.203 151.688 515.961 149.031 519.133 145.674C522.291 142.318 524.813 138.397 526.681 133.895C528.548 129.397 529.482 124.529 529.482 119.291C529.482 114.053 528.548 109.186 526.681 104.688C524.813 100.19 522.291 96.2648 519.133 92.9083C515.961 89.5518 512.199 86.8945 507.814 84.9276C503.438 82.9606 498.714 81.9771 493.684 81.9771C488.654 81.9771 483.948 82.9606 479.559 84.9276C475.182 86.8945 471.406 89.5518 468.239 92.9083C465.081 96.2648 462.559 100.185 460.692 104.688C458.824 109.186 457.89 114.053 457.89 119.291Z',
] as const

type LogoTone = 'full-color' | 'inverse'
type LogoKind = 'full' | 'symbol'

type LogoMarkProps = {
  kind: LogoKind
  tone?: LogoTone
  className?: string
}

const logoRatio = {
  full: 'aspect-[556/182]',
  symbol: 'aspect-[219/182]',
} satisfies Record<LogoKind, string>

const meta = {
  title: 'Foundations/Logo',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function LogoMark({ kind, tone = 'full-color', className }: LogoMarkProps) {
  if (tone === 'full-color') {
    return (
      <img
        src={kind === 'full' ? fullLogoUrl : iconLogoUrl}
        alt={kind === 'full' ? 'Kura full logo' : 'Kura icon logo'}
        className={className}
      />
    )
  }

  return (
    <svg
      aria-label={kind === 'full' ? 'Kura full logo' : 'Kura icon logo'}
      viewBox={kind === 'full' ? '0 0 556 182' : '0 0 219 182'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {(kind === 'full' ? wordmarkPaths : symbolPaths).map((path) => (
        <path key={path} d={path} fill="currentColor" />
      ))}
    </svg>
  )
}

function LogoCard({
  title,
  note,
  kind,
  tone = 'full-color',
  background,
}: {
  title: string
  note: string
  kind: LogoKind
  tone?: LogoTone
  background: 'surface' | 'brand' | 'navy'
}) {
  const backgroundClass = {
    surface: 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink-900)]',
    brand: 'border-[var(--brand-600)] bg-[var(--brand-500)] text-[var(--ink-0)]',
    navy: 'border-[var(--secondary-deep-700)] bg-[var(--secondary-deep-500)] text-[var(--ink-0)]',
  }[background]

  return (
    <section className="min-w-0 space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-k-sm font-semibold text-[var(--ink-800)]">{title}</h3>
        <span className="text-k-xs font-mono text-[var(--ink-500)]">{note}</span>
      </div>
      <div
        className={[
          'grid min-h-[136px] place-items-center rounded-[var(--radius-lg)] border p-8',
          backgroundClass,
        ].join(' ')}
      >
        <LogoMark
          kind={kind}
          tone={tone}
          className={[
            'block h-auto max-h-[82px] w-full object-contain',
            kind === 'full' ? 'max-w-[360px]' : 'max-w-[132px]',
            logoRatio[kind],
          ].join(' ')}
        />
      </div>
    </section>
  )
}

function SpecRow({
  label,
  value,
  children,
}: {
  label: string
  value: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 gap-2 border-t border-[var(--border)] py-4 text-k-sm first:border-t-0 sm:grid-cols-[minmax(120px,0.6fr)_minmax(160px,1fr)_auto] sm:items-center sm:gap-4">
      <div className="font-semibold text-[var(--ink-800)]">{label}</div>
      <div className="font-mono text-k-xs text-[var(--ink-500)]">{value}</div>
      <div className="justify-self-start sm:justify-self-end">{children}</div>
    </div>
  )
}

function UsageTile({
  label,
  guidance,
  children,
}: {
  label: string
  guidance: string
  children: React.ReactNode
}) {
  return (
    <section className="flex min-h-[190px] flex-col justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]">
      <div className="space-y-1.5">
        <h3 className="text-k-h font-semibold text-[var(--ink-900)]">{label}</h3>
        <p className="text-k-body text-[var(--ink-500)]">{guidance}</p>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  )
}

export const LogoSet: Story = {
  name: 'Logo set',
  render: () => (
    <main className="min-h-screen bg-[var(--bg)] p-8 text-[var(--ink-900)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="space-y-2">
          <p className="text-k-xs font-semibold uppercase tracking-k-caps text-[var(--brand-600)]">
            Kura brand assets
          </p>
          <h1 className="text-k-display font-semibold text-[var(--ink-900)]">
            Logo lockups
          </h1>
          <p className="max-w-3xl text-k-body text-[var(--ink-600)]">
            Use the full-color lockups on quiet light surfaces. Use the single-color
            inverse lockups only when the logo sits on brand blue or logo navy.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)]">
          <LogoCard
            title="Full logo"
            note="556 / 182"
            kind="full"
            background="surface"
          />
          <LogoCard
            title="Symbol logo"
            note="219 / 182"
            kind="symbol"
            background="surface"
          />
          <LogoCard
            title="Full logo · inverse"
            note="brand blue"
            kind="full"
            tone="inverse"
            background="brand"
          />
          <LogoCard
            title="Symbol logo · inverse"
            note="brand blue"
            kind="symbol"
            tone="inverse"
            background="brand"
          />
          <LogoCard
            title="Full logo · inverse"
            note="logo navy"
            kind="full"
            tone="inverse"
            background="navy"
          />
          <LogoCard
            title="Symbol logo · inverse"
            note="logo navy"
            kind="symbol"
            tone="inverse"
            background="navy"
          />
        </div>
      </div>
    </main>
  ),
}

export const UsageGuidance: Story = {
  name: 'Usage guidance',
  render: () => (
    <main className="min-h-screen bg-[var(--bg)] p-8 text-[var(--ink-900)]">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)]">
          <div className="space-y-2 pb-5">
            <p className="text-k-xs font-semibold uppercase tracking-k-caps text-[var(--brand-600)]">
              Production rules
            </p>
            <h1 className="text-k-display font-semibold text-[var(--ink-900)]">
              Asset contract
            </h1>
            <p className="text-k-body text-[var(--ink-600)]">
              The logo colors are reserved for the lockup. Product UI still uses
              the semantic token system; never pull the logo navy or cyan into
              ordinary controls.
            </p>
          </div>

          <SpecRow label="Full logo" value="Primary brand lockup">
            <LogoMark kind="full" className="h-auto w-[176px]" />
          </SpecRow>
          <SpecRow label="Symbol logo" value="Compact mark / square contexts">
            <LogoMark kind="symbol" className="h-auto w-[56px]" />
          </SpecRow>
          <SpecRow label="Brand blue" value="--brand-500 / #268CFF">
            <span className="block size-8 rounded-[var(--radius-sm)] bg-[var(--brand-500)]" />
          </SpecRow>
          <SpecRow label="Logo navy" value="--secondary-deep-500 / #10069F">
            <span className="block size-8 rounded-[var(--radius-sm)] bg-[var(--secondary-deep-500)]" />
          </SpecRow>
          <SpecRow label="Logo cyan" value="--secondary-light-500 / #60CDFF">
            <span className="block size-8 rounded-[var(--radius-sm)] bg-[var(--secondary-light-500)]" />
          </SpecRow>
        </section>

        <div className="grid gap-4">
          <UsageTile
            label="App shell"
            guidance="Prefer the full logo when there is enough horizontal room."
          >
            <div className="flex h-14 items-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] px-4">
              <LogoMark kind="full" className="h-auto w-[132px]" />
            </div>
          </UsageTile>
          <UsageTile
            label="Compact rail"
            guidance="Use the symbol where a wordmark would be cramped."
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius)] bg-[var(--brand-500)] text-[var(--ink-0)]">
              <LogoMark kind="symbol" tone="inverse" className="h-auto w-8" />
            </div>
          </UsageTile>
          <UsageTile
            label="Inverse lockup"
            guidance="Use single-color white only on approved brand backgrounds."
          >
            <div className="flex h-16 items-center rounded-[var(--radius)] bg-[var(--secondary-deep-500)] px-4 text-[var(--ink-0)]">
              <LogoMark kind="full" tone="inverse" className="h-auto w-[136px]" />
            </div>
          </UsageTile>
        </div>
      </div>
    </main>
  ),
}

export const MinimumSizes: Story = {
  name: 'Minimum sizes',
  render: () => (
    <main className="min-h-screen bg-[var(--bg)] p-8 text-[var(--ink-900)]">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="space-y-2">
          <p className="text-k-xs font-semibold uppercase tracking-k-caps text-[var(--brand-600)]">
            Scale checks
          </p>
          <h1 className="text-k-display font-semibold text-[var(--ink-900)]">
            Smallest usable renderings
          </h1>
          <p className="max-w-3xl text-k-body text-[var(--ink-600)]">
            Keep the wordmark legible by switching to the symbol at tight sizes.
          </p>
        </header>

        <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)]">
          <div className="grid grid-cols-[112px_1fr] items-center gap-5">
            <span className="font-mono text-k-xs text-[var(--ink-500)]">160 px</span>
            <LogoMark kind="full" className="h-auto w-[160px]" />
          </div>
          <div className="grid grid-cols-[112px_1fr] items-center gap-5">
            <span className="font-mono text-k-xs text-[var(--ink-500)]">120 px</span>
            <LogoMark kind="full" className="h-auto w-[120px]" />
          </div>
          <div className="grid grid-cols-[112px_1fr] items-center gap-5">
            <span className="font-mono text-k-xs text-[var(--ink-500)]">56 px</span>
            <LogoMark kind="symbol" className="h-auto w-[56px]" />
          </div>
          <div className="grid grid-cols-[112px_1fr] items-center gap-5">
            <span className="font-mono text-k-xs text-[var(--ink-500)]">32 px</span>
            <LogoMark kind="symbol" className="h-auto w-[32px]" />
          </div>
        </section>
      </div>
    </main>
  ),
}
