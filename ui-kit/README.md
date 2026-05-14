# `@kura/ui-kit`

Shared design tokens, theme, and React component primitives for Kura clinic apps (`receptionist`, `phlebo`, `patient`).

The kit ships:

1. The full Kura design system as CSS variables (`tokens.css`).
2. A theme entrypoint that wires tokens + fonts + `tw-animate-css` + `shadcn/tailwind.css` + a Tailwind v4 `@theme inline` mapping (`theme.css`), so consumer apps can drop one import and get the brand.
3. React component primitives organised by atomic layer — `atoms`, `molecules`, `organisms` — built on shadcn where possible and themed by `theme.css`. Documented in Storybook (`bun run storybook`).
4. The official logo SVG.

> Receptionist-specific compositions (`OrderCart`, `WizardHeader`, `IntakeChecklist`, `TestRow`, `BundleRow`, `EligibilityCard`, `PaymentSummary`, `BookingCodeInput`) live in `apps/receptionist`, not here. The kit only owns primitives that all three clinic apps can reuse.

## What's in the box

- **Tokens** (`@kura/ui-kit/styles/tokens.css`) — Kura DS verbatim: brand `#268CFF`, secondary-deep + secondary-light 10-stop ramps (anchored on the logo navy `#10069F` and cyan `#60CDFF`), ink scale, AI-accent purple ramp, status pairs (`--status-success-{bg,fg}`, …, `--status-ai-{bg,fg}`), spacing, radius (canonical: `--radius-sm` / `--radius` / `--radius-lg`), shadow, density variants on `[data-density]`, two themes (`light` / `dark`), canonical surface + border tokens (`--bg`, `--surface`, `--surface-2`, `--border`, `--border-strong`, …) plus backwards-compat aliases for the older `--color-bg-*` / `--color-border-*` / `--color-status-*` names. Type scale + semantic type classes (`.k-h1`, `.k-body`, `.k-mono`, `.k-num`, …).
- **Theme entrypoint** (`@kura/ui-kit/styles/theme.css`) — pulls in tokens + `tw-animate-css` + `shadcn/tailwind.css` + Noto Sans / Noto Sans Khmer / JetBrains Mono (via `@fontsource`), then maps shadcn semantic vars (`--color-primary`, `--color-card`, `--radius`, `--font-sans`, the `--color-purple-*` ramp, …) onto Kura tokens through `@theme inline { ... }` so any shadcn primitives a consumer adds locally render in Kura's brand without rewrites. Includes the base layer (body bg/color, focus ring, tabular numerals on data tables).
- **Logo** (`@kura/ui-kit/assets/kura-logo.svg`) — official mark.

## Consumer setup

Add the kit to `package.json` as a directory dep (workspace convention):

```jsonc
{
  "dependencies": {
    "@kura/ui-kit": "../../ui-kit"
  }
}
```

In your app's `globals.css`:

```css
@import 'tailwindcss';
@import '@kura/ui-kit/styles/theme.css';
```

In `index.html`, set the brand attributes:

```html
<html lang="en" data-theme="light" data-density="compact" data-module="receptionist">
```

## Brand non-negotiables

- One brand blue: `#268CFF` (`--brand-500`). The logo's navy `#10069F` (`--secondary-deep-500`) and cyan `#60CDFF` (`--secondary-light-500`) are **logo-only** at the `-500` step; the surrounding ramp stops are used for emphasis chrome (e.g. Phlebo header, dense data labels) and decorative tints (Patient intake illustrations) — never in product chrome on the `-500` stops themselves.
- AI accent purple (`--purple-*`) is the only non-brand chrome color in product UI, and it is reserved for AI surfaces (`AISidePanel`, `AIChip`, `WhyCard`). Don't use it elsewhere.
- Status colors always pair with an icon and a label. Never status-by-color-alone.
- Body never below 11 px. Compact density baseline is 12.5 px.
- Lucide line icons, 1.5 px stroke, sizes locked to 12 / 14 / 16 / 20 / 24 / 28.
- No emoji in product UI. No photographs. No gradients in chrome.

The full brand guide lives in the [Kura Design System](https://api.anthropic.com/v1/design/h/NxDCIBxK1Eh11QwKBPPWVA) bundle.
