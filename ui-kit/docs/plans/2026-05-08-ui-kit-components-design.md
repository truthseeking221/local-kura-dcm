# `@kura/ui-kit` — components & Storybook design

**Date:** 2026-05-08
**Status:** Approved (boundary, shadcn approach, Storybook flavor, file layout, inventory, build sequence)
**Source of truth:** observed at `https://design-receptionist.kura.med/patients` (the only implemented route; all other sidebar items show "coming soon")

## 1. Context & scope

The kit is currently CSS-only: `tokens.css`, `theme.css`, the logo SVG. This plan adds **React components** for the first time. Tokens and theme are not modified.

**Boundary (Option A):** the kit ships only **reusable primitives** — atoms, molecules, and *neutral* organisms that can be consumed by `apps/receptionist`, `apps/phlebo`, and `apps/patient`. Receptionist-specific compositions (`OrderCart`, `WizardHeader`, `IntakeChecklist`, `PaymentSummary`, `EligibilityCard`, `TestRow`, `BundleRow`, `StillNeededPanel`, `BookingCodeInput`) stay in `apps/receptionist`.

**Approach:** lean on shadcn. Most atoms come from `pnpm dlx shadcn@latest add …`; the existing `theme.css` already maps shadcn semantic vars (`--color-primary`, `--radius`, `--color-purple-*`, `--font-sans`, …) onto Kura tokens. We hand-roll only the Kura-specific atoms/molecules/organisms with no shadcn equivalent.

**Distribution:** source-only (matches today). Receptionist's Vite already compiles TSX from the kit. No build step added.

**Scope of this plan:** the kit + Storybook. Wiring receptionist to consume the new components is a follow-up task.

## 2. Architecture & file layout

```
ui-kit/
├─ src/
│  ├─ assets/                 # existing (kura-logo.svg) — DO NOT TOUCH
│  ├─ styles/                 # existing (tokens.css, theme.css) — DO NOT TOUCH
│  ├─ components/
│  │  ├─ ui/                  # shadcn primitives (CLI-managed)
│  │  ├─ atoms/               # Kura-only atoms (Kbd, StatusDot)
│  │  ├─ molecules/           # Kura-only molecules
│  │  └─ organisms/           # neutral reusable organisms
│  ├─ lib/
│  │  └─ cn.ts                # shadcn util
│  └─ index.ts                # one barrel per layer
├─ stories/
│  ├─ Introduction.mdx
│  ├─ foundations/            # Colors, Typography, Spacing, Radius, Shadow, Icons
│  ├─ atoms/
│  ├─ molecules/
│  └─ organisms/
├─ .storybook/
│  ├─ main.ts
│  ├─ preview.tsx             # imports tokens.css + theme.css
│  └─ manager.ts
├─ components.json            # shadcn CLI config
├─ tsconfig.json              # NEW
├─ eslint.config.js           # NEW
└─ package.json               # peerDeps grow: react, react-dom, typescript
```

**Public exports** (`package.json#exports`):

```jsonc
{
  "./styles/tokens.css":  "./src/styles/tokens.css",
  "./styles/theme.css":   "./src/styles/theme.css",
  "./assets/kura-logo.svg": "./src/assets/kura-logo.svg",
  ".":                    "./src/index.ts",
  "./atoms":              "./src/components/atoms/index.ts",
  "./molecules":          "./src/components/molecules/index.ts",
  "./organisms":          "./src/components/organisms/index.ts"
}
```

**Setup decisions:**
- Package manager inside `ui-kit/`: **bun** (matches existing `bun.lock` and `packageManager: bun@1.3.11`).
- Storybook framework: `@storybook/react-vite`.

## 3. Atoms inventory

### Via `pnpm dlx shadcn@latest add …`

| Atom | Used at |
|---|---|
| `button` | "Continue", "Add policy", "+ Add", "Save policy", icon-only X |
| `input` | Latin/Khmer name, ID, policy number, expiry, promo |
| `textarea` | Chief complaint, medical history, delivery notes |
| `label` | Every form field |
| `select` | Preferred language, sex, provider, coverage, commune, specialty |
| `checkbox` / `radio-group` | Form primitives |
| `switch` / `toggle` / `toggle-group` | USD/KHR, Telegram/SMS, filter chips |
| `badge` | Extended with our variants (see below) |
| `avatar` | Profile, patient header, search results |
| `skeleton` | Loading rows |
| `separator` | Section dividers (extended for "OR CAPTURE NEW" text-divider) |
| `tooltip` | Info icons |
| `popover` | Backs StationPicker / ShiftPicker / Notifications / Profile |
| `dialog` | Reserved |
| `dropdown-menu` | Profile menu |
| `sonner` | Bottom-right stacking toasts |
| `calendar` | Step 5 day grid (extended for "today" cream-border) |
| `command` | Backs `⌘K` palette |
| `scroll-area` | Long category & test lists |

### Badge variants (extending shadcn cva)

`default`, `success` (Verified, ELIGIBLE), `warning` (Verify patient, Attach card), `danger`, `info` (Manual entry), `neutral` (PENDING, COMING SOON), plus a `category` slot taking a color token name for HAEM / BIOCHEM / VITALS / URINE / POPULAR / HORMONE etc.

### Custom hand-rolled atoms

- `Kbd` — kbd-styled key chip (`⌘K`, `F1–F6`, `Ctrl+N`, `Space`, `Enter`, `Esc`, `/`, `↑`, `↓`)
- `StatusDot` — small colored dot for command-palette filter chips (`● Needs attention`, `● In progress`, `● Done`)

Spinner is **not** added — use Lucide's `Loader2` with `animate-spin`.

## 4. Molecules inventory

### Form-input molecules
- `OtpInput` — 6-digit segmented input + Verify button + Resend with countdown timer (auto-advance, paste-aware)
- `PhoneInput` — country-code select + number input. Country-code list seeded from Cambodia (`+855`), extensible

### Display molecules
- `StatusPill` — pill with optional leading icon + label, tones: `info` / `success` / `warning` / `danger` / `neutral` / `ai` mapped to `--status-*` token pairs. Backs the wizard-header pill ("Capture identity" → "Ready to check in")
- `IconBadge` — square soft-tinted icon container (sizes `sm` / `md` / `lg`, tones match StatusPill). Used for notification type icons, capture-method card icons, intake-form phone icon
- `KeyboardHint` — `Kbd` + label (`"Space add/remove"`)
- `KeyboardHintsBar` — row of `KeyboardHint` (`/ search · ↑↓ navigate · Space add/remove · Enter add/remove · Esc clear`)
- `CountBadge` — small numeric pill (`12`, `1`) for category nav and cart counts. Variants `default` / `accent`
- `DataPoint` — uppercase label above value (`MEMBER NAME / Sok Sreymom`). Stacks via flex; consumers compose grids
- `Banner` — inline notice with leading icon, tones: `info` / `success` / `warning` / `danger`. Backs "Filling on behalf of patient", "No TAT-bound tests in cart — book any slot", "No payment due"

### Layout molecules
- `EmptyState` — illustration slot + heading + subtitle + actions row. Backs "No insurance on file" + "No recent searches yet"
- `ChecklistItem` — leading circle (pending / done / skipped) + title + trailing meta. Backs the 8-item Visit details checklist
- `SearchInput` — input with leading search icon + trailing `Kbd` slot + clear-X. Backs both the global `⌘K` search bar and the order catalog `/` search

### Skipped (would belong to receptionist)
`BookingCodeInput`, `IntakeChecklist`, `TestRow`, `BundleRow`, `InsuranceCard` — too domain-specific.

## 5. Reusable organisms inventory

### Application chrome (slot-based)
- `AppHeader` — bar with `leading` / `left` / `center` / `right` slots, fixed height & token-driven border. Receptionist drops in Station/Shift pickers
- `AppSidebar` — collapsible rail with: `header` slot (logo + wordmark when expanded), `nav` slot (list of items), `footer` slot (locale, debug toggles), Collapse button. Owns expand/collapse state
- `SidebarNavItem` — icon + label (label hidden when collapsed) + active/disabled states; works as `<button>` or `<a>`

### Overlays
- `CommandPalette` — `⌘K` shell composing shadcn `command` + `dialog`: search input, optional filter-chip row, eyebrow-labeled sections (`RECENT`, `QUICK ACTION`, results), `renderItem` prop
- `NotificationsPanel` + `NotificationItem` — popover with header (unread count + "Mark all as read"), list of items (`IconBadge` tone + title + description + relative time + action link + unread dot), and footer "View all"
- `ProfileMenu` — popover with signed-in header (eyebrow + name + role), divider, menu items, destructive sign-out

### Wizard chrome
- `Stepper` — horizontal stepper. Steps with active / done / locked states; connector lines tinted by progression; optional kbd-shortcut hint label slot ("F1–F6 steps"). Owns nothing about the wizard's content; consumer drives `currentStep`

### Date & time pickers
- `DatePicker` — wraps shadcn `calendar` + `popover`, adds Kura "today" cream-border, struck-through-unavailable, past-disabled states
- `TimeSlotPicker` — chip grid of selectable time slots with disabled state
- `DateTimePicker` — `DatePicker` + `TimeSlotPicker` composed, with a "Skip" link slot and a primary "Confirm" action slot

### Toasts
- `<ToastProvider />` — Sonner provider preconfigured (bottom-right, max 3 stacked, Kura tones)
- `toast.success` / `info` / `warning` / `danger` — thin wrapper exposing the brand-aligned variants

## 6. Storybook setup

### Stack
```
ui-kit/.storybook/
├─ main.ts            # framework: @storybook/react-vite, story globs
├─ preview.tsx        # imports ./src/styles/tokens.css + theme.css; mounts decorators
└─ manager.ts         # branding (Kura logo)
```

### Addons
- `@storybook/addon-essentials` (controls, docs, viewport, backgrounds)
- `@storybook/addon-a11y` — flags WCAG issues per story
- `@storybook/addon-themes` — global toolbar toggles for `data-theme="light|dark"` and `data-density="compact|comfortable"`. Also a `data-module` toggle (`receptionist|phlebo|patient`) for module-aware tints
- `@storybook/addon-interactions` — for OTP / command-palette test flows

### Story location

Separate `stories/` folder mirroring layered exports, so the shadcn CLI never touches story files:

```
ui-kit/stories/
├─ Introduction.mdx
├─ foundations/
│  ├─ Colors.mdx          # render tokens (brand-50…900, secondary-deep/light, ink, AI purple, status pairs)
│  ├─ Typography.mdx      # .k-h1 / .k-body / .k-mono / .k-num samples
│  ├─ Spacing.mdx         # --space-* boxes
│  ├─ Radius.mdx          # --radius-sm / --radius / --radius-lg / --radius-pill
│  ├─ Shadow.mdx          # --shadow-* tiles
│  └─ Icons.mdx           # Lucide rules: 1.5px stroke, sizes 12/14/16/20/24/28
├─ atoms/
├─ molecules/
└─ organisms/
```

Foundation pages **read** tokens via CSS — no modification of `tokens.css`/`theme.css`.

### Per-component conventions
- A `Default` story
- A controls-driven `Playground`
- A `States` story showing all variants/tones in a single grid
- For interactive ones (`OtpInput`, `CommandPalette`, `DatePicker`), an `Interactive` story with a `play` function

### Scripts (added to `ui-kit/package.json`)
```json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

## 7. Build sequence (phased)

Each phase is a self-contained deliverable. Verification gate at every phase:
1. `tsc --noEmit` clean
2. `eslint` clean
3. `bun run storybook` → manually inspect new stories in light + dark + compact + comfortable
4. `addon-a11y` shows no critical violations on new stories

### Phase 0 — Bootstrap
- Add `react`, `react-dom`, `typescript` as `peerDependencies`; matching `devDependencies`
- Add `tsconfig.json`, `eslint.config.js`, `lib/cn.ts`, `components.json`
- Add `.storybook/` config + Storybook scripts; verify a hello-world story renders with `tokens.css` / `theme.css` loaded
- Update `package.json#exports` (component subpaths) and `README.md` (drop "no React components" line)

### Phase 1 — Foundations stories
- `Introduction.mdx`, `foundations/Colors.mdx` … `Icons.mdx`
- `data-theme` / `data-density` / `data-module` toolbar globals via `addon-themes`

### Phase 2 — Atoms
- 2a: `pnpm dlx shadcn@latest add button input textarea label select checkbox radio-group switch toggle toggle-group badge avatar skeleton separator tooltip popover dialog dropdown-menu sonner calendar command scroll-area`
- 2b: extend `badge` with tone + category variants
- 2c: add custom atoms `Kbd`, `StatusDot`
- 2d: stories for each (`Default` / `Playground` / `States`)

### Phase 3 — Molecules
`OtpInput`, `PhoneInput`, `SearchInput`, `StatusPill`, `IconBadge`, `KeyboardHint` + `KeyboardHintsBar`, `CountBadge`, `DataPoint`, `Banner`, `EmptyState`, `ChecklistItem` + stories

### Phase 4 — Reusable organisms
- 4a: chrome — `AppHeader`, `AppSidebar`, `SidebarNavItem`
- 4b: overlays — `CommandPalette`, `NotificationsPanel`, `NotificationItem`, `ProfileMenu`
- 4c: wizard chrome — `Stepper`
- 4d: date/time — `DatePicker`, `TimeSlotPicker`, `DateTimePicker`
- 4e: toasts — `ToastProvider` + `toast` wrapper

## 8. Out of scope

- Wiring `apps/receptionist` to consume the new components
- Receptionist-specific compositions (listed under §1 boundary)
- Phlebo & patient apps
- Visual regression tooling (Chromatic etc.) — can be added later
- The `apps/receptionist` shape itself; this plan only owns the kit

## 9. Observations excluded from scope (notes for future work)

- F1–F6 keyboard step navigation in the wizard — receptionist concern
- Telegram OTP verification flow (only SMS path was walked)
- Tooltips on the test-row info icons (not hovered)
- `Scan QR` and `Scan booking code` flows
- Payment flow with non-zero balance (only the `$0.00` happy path was walked)
- "Test blank state" debug button behaviour (resets to fresh wizard)
