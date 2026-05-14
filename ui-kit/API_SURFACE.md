# `@kura/ui-kit` — public API surface

The Kura design system as a single package: tokens, theme, React components (atoms / molecules / organisms / shadcn primitives), and a small `cn` helper. **Source-only** — consumers (`apps/receptionist`, `apps/phlebo`, `apps/patient`) read the TypeScript directly via `package.json#exports`; no build step. Anything not listed below is private — don't deep-import.

## Styles (CSS)

| Subpath | Contents |
|---|---|
| `@kura/ui-kit/styles/tokens.css` | All Kura DS tokens. **Brand** (`--brand-50…900`, `--brand-rgb`), **secondary-deep** + **secondary-light** 10-stop ramps (logo navy/cyan + emphasis chrome + decorative tints), **ink** 0–900, **AI-accent purple** 50–700, **status** scales (`--success-*`, `--warn-*`, `--danger-*`, `--info-*`) with canonical pair tokens (`--status-success-{bg,fg}` … `--status-ai-{bg,fg}`). **Canonical surfaces** (`--bg`, `--surface`, `--surface-2`, `--surface-raised`, `--surface-sunken`, `--surface-inverse`, `--surface-brand`, `--overlay`, `--scrim`) and **canonical borders** (`--border`, `--border-strong`, `--border-emphasis`, `--border-focus`). **Radius** canonical scale (`--radius-sm` 6 / `--radius` 8 / `--radius-lg` 12 / `--radius-pill` 999). **Spacing**, **shadow** (incl. derived halos `--shadow-selected` for persistent active/selected state and `--shadow-focus-compact` for WCAG-2.4.7-compliant width-based focus on dense surfaces), **motion**, **type scale**, **semantic type classes** (`.k-h1`, `.k-body`, `.k-mono`, `.k-num`, …). **Density variants** on `[data-density]` and **theme variants** on `[data-theme]`. Backwards-compat aliases for older names (`--color-bg-*`, `--color-border-*`, `--color-status-*`, `--radius-md`, `--radius-xs`, `--radius-xl`) point to canonical tokens. Pure CSS. |
| `@kura/ui-kit/styles/theme.css` | The runtime entrypoint. Composes tokens + Noto Sans / Noto Sans Khmer / JetBrains Mono fonts (via `@fontsource`) + `tw-animate-css` + `shadcn/tailwind.css` + Tailwind v4 `@theme inline { ... }` mapping that aliases shadcn semantic vars (`--color-primary`, `--radius`, `--font-sans`, `--color-purple-*`, …) onto Kura tokens, plus density-aware utility bridges: `text-k-{body,h,sm,xs,lg}` (typography), `tracking-k-{tight,base,wide,wider,caps}` (letter-spacing), `leading-k-{tight,snug,base,relaxed}` (line-height) — these resolve from the underlying density tokens so the `data-density` toolbar drives typography across the kit. The single import every consumer needs after `@import 'tailwindcss'`. |

## Assets

| Subpath | Contents |
|---|---|
| `@kura/ui-kit/assets/kura-logo.svg` | Official Kura logo mark (navy `#10069F` + cyan `#60CDFF`). Lockup-only — never recolored, never used as product chrome. |

## Components

Layer purity is enforced: atoms ⊄ molecules ⊄ organisms. Atoms don't import from molecules or organisms; molecules don't import from organisms; organisms compose freely from any layer below. Each layer has a barrel; deep imports of individual component files are not part of the public surface.

### `@kura/ui-kit/atoms`

Indivisible primitives. Kura-specific atoms with no shadcn equivalent live here; for shadcn primitives (Avatar, Badge, Button, …) see `@kura/ui-kit/ui/*` below.

| Export | Notes |
|---|---|
| `Icon`, `IconProps` | Iconify-backed single-icon primitive. Accepts any Iconify identifier (`tabler:*`, `healthicons:*`, `circle-flags:*`, …). Defaults: `size=16`, `strokeWidth=1.5`. Pass `strokeWidth={null}` for filled / coloured collections that own their own stroke. Canonical size scale `12 / 14 / 16 / 20 / 24 / 28`; canonical stroke `1.5` with graduated heavier strokes (`1.75`–`2.5`) for icons ≤ 14 px to retain legibility. The kit's normalization layer over Iconify — `ui/*` shadcn primitives may consume `Icon` (the documented sole `ui → atoms` exception). |
| `Kbd` | Keyboard-key chip (`⌘K`, `F1`, `Enter`, `Esc`, `/`, `↑`, `↓`). Pure visual; semantics live on the surrounding label. |
| `StatusDot`, `StatusDotTone` | Single colored dot for category indicators (`info / success / warning / danger / neutral / ai`). `tone` pulls the matching `--status-<tone>-fg` token. |
| `LabelSeparator` | Horizontal hairline with a centered uppercase label (e.g., "OR CAPTURE NEW"). For a plain rule without text, use `<Separator />`. |
| `ColorSwatch`, `ColorSwatchSize` | Round chip rendering an arbitrary CSS color. For color-coded data — tube colors, category tags, palette previews. Distinct from `StatusDot`, which is locked to status tones. Sizes `sm` 8 / `md` 10 / `lg` 12 px; defaults to an inset 1 px ring so pale fills stay visible on light surfaces. |
| `MetaPill` | Compact icon + text rounded chip for inline metadata (DOB, sex, phone, telegram handle). Decorative — distinct from `Badge` (variant-driven, more emphatic) and `StatusPill` (status tone + icon + label). |
| `SectionLabel` | 11 px uppercase tracking-`k-caps` muted-foreground label. The kit's canonical tiny-caps chrome label — consolidates the pattern previously implicit in `DataPoint`, `CollapsibleSection`, and inline call sites. Accepts an `as` prop (`'span' \| 'div' \| 'dt'`, default `'span'`) for semantic flexibility. (Floor is 11 px, per the brand body-min-11 rule; raised from 10 px in v0.7.0.) |
| `LockableField` | `Input` variant with a trailing lock icon when `locked`. Uses `readOnly` (focusable, value still submitted) + `aria-describedby` for the lock explanation — auto-filled fields stay traversable by assistive tech. `@kuraModules receptionist, phlebo` |
| `SpecialtyBadge`, `SpecialtyBadgeTone` | Tone-coded uppercase category badge for the receptionist orders catalog (`haem / biochem / urine / vitals / popular`). The badge always carries its own text label paired with the tone color — satisfies "status by color alone is forbidden" by construction. `popular` uses neutral ink-tint (not brand) to avoid colliding with brand-tinted category tones. `@kuraModules receptionist` |

### `@kura/ui-kit/molecules`

Compositions of atoms and `ui/` shadcn primitives.

| Export | Notes |
|---|---|
| `AuthProviderButton`, `AuthProviderButtonProps` | Full-width outline button used by `SignInCard` to launch a non-email sign-in provider (Google, Telegram, future). Required `icon` + `label`; renders as a native `<button>` so it inherits standard focus / keyboard semantics. One look — provider differentiation is the icon, not the chrome. |
| `Banner`, `BannerTone` | Page-banner with tone (info / success / warning / danger / ai / brand) for system messages. |
| `BookingCalendar`, `BookingCalendarProps` | Single-date booking calendar built on `react-day-picker`. Custom `DayButton` matches the receptionist booking visual (brand-tinted "today", ink-tinted "selected", line-through "unavailable"). Accepts the full `Matcher` API for `disabled` (Date / Date[] / { from, to } / predicate). `@kuraModules receptionist, phlebo` |
| `Callout`, `CalloutTone` | Tone-only padded container (`info / success / warning / danger`) — pairs with stacked `<InfoSection>` content. Distinct from `Banner` (which has a leading icon + bold title row + action); `Callout` wraps stacked content without a header. |
| `CatalogBundleRow`, `CatalogBundleRowProps` | Receptionist catalog bundle row: cube icon + name + description + tests count + total + Add button. Layout locked to the canonical story spec. `@kuraModules receptionist` |
| `CatalogNavItem`, `CatalogNavItemProps` | Compact operational catalogue/worklist category row: icon slot + label + optional `CountBadge` count + optional shortcut key. Controlled `active` state; caller owns category data and click handling. |
| `CatalogTestRow`, `CatalogTestRowProps`, `CatalogTestRowTag` | Receptionist catalog test row: name + `SpecialtyBadge` tags + price + brand-tinted Add button + optional AI-reasoning info button. The optional info button is named `onShowAiReason` and bakes in AI purple — the kit enforces the brand AI-purple-reserved rule structurally. `@kuraModules receptionist` |
| `ChecklistItem`, `ChecklistItemStatus` | Single row of a status-tagged checklist (`pending / done / skipped`). |
| `ClinicalNumberField`, `ClinicalNumberFieldProps`, `ClinicalNumberFieldState` | Labeled numeric input for clinical measurements with reference-range and unit slots, plus explicit status helper states (`default / info / success / warning / danger`). Used by Phlebo vital-signs forms. `@kuraModules phlebo` |
| `CompositeNumberField`, `CompositeNumberFieldField`, `CompositeNumberFieldProps` | N numeric inputs sharing one bordered shell, separated by a string (default `'/'`). Used for paired clinical values like blood pressure (systolic / diastolic). Shell carries a `focus-within` ring (`--shadow-focus` + `--border-focus`) so keyboard focus is visible across the pair even though individual inputs are stripped of their own focus rings. Per-field `aria-label` required; forwards all standard `<Input>` props per field (type is locked to `'number'`). `@kuraModules phlebo` |
| `CountBadge` | Small numeric badge — notifications, cart items, category counts. Variants: `default / accent / destructive`. |
| `CountdownTimer` | Display-only countdown (`mm:ss` / `hh:mm:ss`). |
| `DataPoint` | Compact label/value pair for read-only data display. |
| `DerivedValueField`, `DerivedValueFieldProps` | Labeled read-only display for a value computed from other inputs. Dashed border + recessed `--surface-2` fill visually distinguishes the field as non-interactive; mirrors `ClinicalNumberField`'s header pattern (label + optional right-aligned `hint`). Bold mono numerals in `--ink-900` when populated; dimmed `--ink-400` placeholder when empty. Optional `unit` slot renders adjacent to the value in muted `--ink-500`. Does not accept user input. `@kuraModules phlebo` |
| `EmptyState` | Centered zero-state pattern: optional icon, bold heading, supporting copy, action row. |
| `ExpandableItemRow`, `ExpandableItemRowProps` | Row primitive with trailing info-toggle button and a slotted expansion area below. Controlled (`open` + `onOpenChange`) and uncontrolled (`defaultOpen`) modes. Distinct from `CollapsibleSection` (page-level chevron + section title) — `ExpandableItemRow` is row-level (row content + trailing info button + below-expansion). |
| `FilterBar` | Horizontal container for `FilterGroup` rows — a named anchor for the orders-step / catalog-style filter row pattern. |
| `FilterChip`, `FilterChipProps`, `FilterChipTone` | Toggleable filter pill — composes `<StatusDot>` for the optional leading tone indicator and renders an optional trailing tabular-num `count` (rendered when `typeof count === 'number'`, so `0` is shown). Two states only: inactive (`bg-muted`, hover → `bg-accent`) and active (`--brand-500` border + `--ink-900` fill + `--ink-0` text). One size — designed for clinic-PC keyboard-first workflows; not a touch-target. `aria-pressed={active}` toggle semantics. |
| `FilterGroup` | Tiny-caps label + optional leading icon + control slot (typically a `ToggleGroup`). Composes `SectionLabel`; pairs with `FilterBar`. |
| `IconBadge`, `IconBadgeTone`, `IconBadgeSize` | Square soft-tinted container for a leading icon. Tones match the kit's status palette plus `brand`; sizes `sm` 28 / `md` 36 / `lg` 48 px. |
| `InfoSection` | Icon + tiny-caps label + body paragraph — structured doc-style content. Typically stacked inside a `<Callout>` to form an info-tinted panel of multiple labelled sub-sections (e.g. "What it measures" / "Looks for" / "Results by"). |
| `JourneyList`, `JourneyListProps`, `JourneyListStatus`, `JourneyListStep` | Ordered clinical journey list with icon + label + explicit status pill per step. Encodes the Phlebo patient-card journey contract without app-side card chrome. `@kuraModules phlebo` |
| `KeyboardHint`, `KeyboardHintsBar`, `KeyboardHintsBarDensity` | Inline keyboard-shortcut hint (`<Kbd>` + label) and a horizontal bar that aligns several hints. Supports key sequences, custom separators, and class hooks for compact helper strips. `<KeyboardHintsBar>` accepts `density?: 'default' \| 'compact'` — `compact` drops the bar text to `10.5 px` (density-exempt per CLAUDE.md) for dense catalog rails / order-cart footer strips. |
| `MailProviderTile`, `MailProviderTileProps` | Square 80 × full-width tile that deep-links into a webmail provider (Gmail, Outlook). Renders as `<a target="_blank" rel="noopener noreferrer">`; required `icon` + `label` + `href`. Used by `CheckInboxCard` in a 2-column grid below the email-echo line. |
| `MediaFrame`, `MediaFrameProps`, `MediaFrameTone`, `MediaFrameBackground`, `MediaFramePadding` | Bordered media-container frame for camera previews, QR codes, and image placeholders. `tone: 'default' \| 'danger'` (danger border for expired/error state), `dashed?: boolean` (capture-target style; default solid), `bg: 'surface' \| 'muted' \| 'white'` (`white` is locked to QR-scan-readability cases — JSDoc-documented; dark mode does NOT invert), `padding: 'sm' \| 'md' \| 'lg'`. Children render in the centered content slot. `@kuraModules receptionist` |
| `OtpInput` | Multi-cell one-time-password input. |
| `PhoneInput`, `DEFAULT_COUNTRIES`, `Country` | International phone-number input with country picker. `DEFAULT_COUNTRIES` is the seed list; `Country` is the country-record shape. |
| `SearchInput`, `SearchInputDensity`, `SearchInputProps` | Input with leading search icon, optional trailing slot (typically `<Kbd>⌘K</Kbd>`), and optional clear-X button when controlled. Includes class hooks for the wrapper, inner input, leading icon, and trailing slot. Optional `density` prop: `'default'` (canonical `h-9` Input + standard focus ring; unchanged) or `'compact'` (`h-7`, `--radius-sm`, `--surface-2` bg, `text-k-xs`, `--shadow-focus-compact` on focus) for dense catalog/order-cart surfaces. |
| `SearchTrigger`, `SearchTriggerProps` | `<button>` styled to visually mirror `<SearchInput density="default">` — used as the global header affordance that opens a `<CommandPalette>` (clicking or pressing the bound shortcut). Optional `shortcut?: ReactNode` slot (typically `<Kbd>⌘K</Kbd>`) is decorative (`aria-hidden`); the shortcut is announced via the consumer-provided `aria-keyshortcuts` prop on the button. Forwards `ref` to the underlying `HTMLButtonElement` so consumers can restore focus after closing the palette. `@kuraModules receptionist, phlebo` |
| `StatusPill`, `StatusPillTone` | Color + icon + label pill — the kit's primitive for satisfying the brand rule "status by color alone is forbidden". |
| `ScanInput`, `ScanInputState` | Barcode/scanner-driven input with leading scan icon, `Enter` keycap hint, disabled state, and transient success/error feedback. `state` and `helperText` are a discriminated union — a non-default state without a paired label is a compile-time error, enforcing the icon-+-label brand rule for status indicators. |
| `CollapsibleSection` | Disclosure section: header (chevron + title + optional `<CountBadge>` + optional trailing meta slot) over a body that expands/collapses. Built on `@radix-ui/react-collapsible` — `data-state="open"|"closed"` available for animation hooks. Controlled and uncontrolled modes. |
| `IconChoiceCard`, `IconChoiceCardProps` | Selectable card composing `<IconBadge>` + title + description + optional `trailing` slot. `trailing` defaults to a "Start →" CTA arrow on interactive cards; pass `null` to suppress or a custom node (e.g. `<Kbd>F2</Kbd>`) to replace. `iconBadgeTone` defaults to `brand` (or `neutral` when `comingSoon`). When `comingSoon`, renders as `aria-disabled` `<div>` with a dashed border, dimmed opacity, and an inline "Coming soon" pill next to the title — screen-reader announced. |
| `ContextPickerPopover`, `ContextPickerItem` | Listbox-pattern picker — trigger button + popover with `role="listbox"` and `role="option"` items (primary + optional subtitle). Arrow ↑/↓/Home/End keyboard navigation. `@kuraModules receptionist, phlebo` |
| `RadioCard`, `RadioCardProps`, `RadioCardLayout` | Radio-bound clickable card. Two layouts: `tile` (vertical block; icon top-left; label + optional caption stacked) and `pill` (horizontal pill; icon + label inline). Selected state is detected via `:has([data-state=checked])` on the wrapping `<label>` so brand-tinted bg + border activates without external state. `hideRadioControl` visually hides the radio dot for the pill pattern where the entire pill is the visible affordance. Designed for use inside a controlling `<RadioGroup>`. |
| `SampleStatusBadge`, `SampleCollectionStatus`, `SampleStatusBadgeProps` | Tube/sample collection status badge (`generated / collected / deferred`) with icon + text label. Supports the prototype's alternate `Pending` label for inspector details. `@kuraModules phlebo` |
| `SectionCard`, `SectionCardProps`, `SectionCardMetaTone`, `SectionCardPadding`, `SectionCardTone` | Bordered section card. Optional `title` (header band suppressed when omitted, giving a generic bordered surface for search/prompt panels). Optional right-aligned `meta` pill (`metaTone: 'success' \| 'neutral'`) or muted `hint`. `padding: 'sm' \| 'md' \| 'lg'` (`sm = px-3.5 py-3`, `md = p-4`, `lg = p-5`). `tone: 'default' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'brand'` for tinted surfaces. `@kuraModules receptionist, phlebo` |
| `SegmentedControl`, `SegmentedControlOption`, `SegmentedControlProps` | Single-select segmented control with a recessed `--surface-2` tray. Each option renders as an item with optional Tabler `icon` slot; active item is filled with `--brand-500` + `--ink-0` text + `--shadow-xs` lift, inactive items are transparent and brighten to `--surface` on hover. Per-option `disabled` supported. Wraps Radix `ToggleGroup` (`type="single"`). 150 ms ease transition on selection change. `@kuraModules phlebo` |
| `SummaryCard`, `SummaryCardProps`, `SummaryCardTone` | Composed display card: leading `<IconBadge>` (driven by `iconBadgeIcon` + `iconBadgeTone` + `iconBadgeSize`) + optional `eyebrow` + title + optional `subtitle` + optional inline `statusPill` + optional `actions` slot + optional `<Separator>` + body (children, optional) + optional `footer`. `tone` (`default \| info \| success \| warning \| danger \| brand`) tints both bg and border for callout-style header-only cards (e.g. paid receipt, pay-later, zero-payment). Children may be omitted for header-only mode (divider auto-suppressed). |
| `TubeDot`, `TubeVisual`, `TubeDotProps`, `TubeVisualProps`, `TubeVisualSpec`, `TubeVisualStatus`, `TubeVisualTone` | Phlebo tube marker and tube drawing used by order-of-draw racks, sample tables, and inspector panels. Tone values map the prototype tube catalog to Kura tokens, not source hex colors. `@kuraModules phlebo` |
| `WizardStepBody`, `WizardStepBodyProps` | Universal layout preset for a wizard step body: optional title + subtitle + actions slot in a header band, then vertically-stacked children. Slot-based; no state. Use as the immediate child of `<WizardLayout>`'s body for any clinic-app wizard. |
| `WorkflowHeading`, `WorkflowHeadingProps` | Three-line phase heading used to introduce a workflow region inside a wizard step body: brand-tinted `<SectionLabel>` eyebrow + title + optional subtitle. The canonical "Pre-consultation / Visit details / Fill while patient is still in the queue." pattern. |

### `@kura/ui-kit/organisms`

Larger compositions with structure. Most are universal (reusable across all clinic modules); some are tagged with `@kuraModules` to declare which modules they serve and are re-exported from the matching module subpath. Per `CLAUDE.md`'s "Generic primitives over module-specific compositions" rule, the kit only promotes a module-tagged composition when ≥ 2 modules will reuse the exact composition or when re-deriving it in the app would risk visual drift from a canonical contract. Apps own their thin data-wiring shells around these organisms (`apps/.../shell/TopBar.tsx` wrapping `<AppHeader>` is the right factoring, not an anti-pattern).

| Export | Notes |
|---|---|
| `AppHeader` | Top-of-page app header — logo, search, actions. |
| `AppSidebar`, `SidebarNavItem`, `useSidebar` | Collapsible left sidebar with nav items; `useSidebar` exposes the open/closed state for callers that need to react to it. |
| `AuthShell`, `AuthShellProps` | Full-viewport auth layout preset shared by every Kura app's `/sign-in`, `/check-inbox`, `/verify`, and `/callback` routes. Centered vertical stack: logo (defaults to the 40 × 40 dark-square Kura lockup; consumer can override) + optional uppercase eyebrow → card slot → optional footer line. Both `eyebrow` and `footer` are optional — omit either to render without that band. Stateless and slot-driven; the card child owns its own (density-aware) width. Page canvas resolves to `--bg` so it flips automatically under `[data-theme="dark"]`. |
| `BundleTable`, `BundleTableProps`, `BundleTableItem` | Five-column table with per-row chevron disclosure (chevron / icon + name + description / member count / total / action). Internal `useState` per row; each item may declare `defaultOpen`. Universal — package-of-tests / kit-of-items display for any clinic app. |
| `CatalogWorkspace`, `CatalogWorkspaceProps` | Operational catalogue shell: scrollable left rail, compact toolbar search slot, optional toolbar trailing slot, optional filter strip, optional keyboard-hint strip, and slotted result region. Universal layout/workflow organism; callers own row rendering and business actions. |
| `CheckInboxCard`, `CheckInboxCardProps` | "We sent you a magic link" surface used by every Kura app's `/check-inbox` route. Centered auth inbox illustration → email echo → 2-column `MailProviderTile` grid (Gmail / Outlook) → "Enter verification code" + "Resend email" action links. Stateless and controlled — consumer owns the `isResending` + `resendDisabledUntil` cooldown state. Density-aware width: 380 / 460 / 540 px. |
| `CommandPalette`, `CommandSection` | `⌘K` command palette built on `cmdk`. `CommandSection` lets callers group items semantically. |
| `DatePicker` | Single-date popover calendar. |
| `DateTimePicker` | Date popover plus integrated time-slot picker. |
| `IntakeCard`, `IntakeCardProps` | Step 5 patient-intake panel: workflow card with title + StatusPill header, optional CTA band (typically `<IconBadge>` + form copy + Send/Fill buttons), and a bordered checklist rail body. Children should be `<ChecklistItem>` rows. `@kuraModules receptionist` |
| `NotificationsPanel`, `NotificationItem` | Slide-out notifications panel and the row primitive it renders. |
| `OrderCart`, `OrderCartProps`, `OrderCartItem`, `OrderCartItemKind`, `OrderCartGroup`, `OrderCartGroupKey`, `OrderCartBundle`, `OrderCartResultPill`, `OrderCartResultPillTone`, `OrderCartExternalLab` | Receptionist's full order-rail organism: header (icon + title + count + Clear/Expand) → empty state with optional `onAddFirst` action when item count is zero → bundles (collapsible per-bundle disclosures) → grouped items (vitals / lab / telecon, each with tone-coded chevron header rows) → "Patient pays" total → optional promo + split-bill section (`promoSlot` / `splitBillSlot` props) → "still needed" checklist → results-turnaround timeline → bottom Check-in CTA. App owns the cart-store-to-props wiring shell. `@kuraModules receptionist` |
| `OrderSummary`, `OrderSummaryProps`, `OrderSummaryItem`, `OrderSummaryGroup`, `OrderSummaryAdjustment` | Read-only receipt-style table: header (icon + title + item count) → grouped `<TableBody>` (per-category sub-header rows + item rows with right-aligned pre-formatted price text) → `<TableFooter>` (subtotal + generic `adjustments[]` + total). Pre-formatted ReactNode prices (kit does not own currency formatting). Universal. |
| `ProfileMenu`, `SignedInUser` | User profile dropdown with avatar; `SignedInUser` is the input shape (id, name, email, avatarUrl, …). |
| `QueuePickList`, `QueuePickListItem`, `QueuePickListProps` | Compact selectable queue list for scanner-first clinical workflows. Used by the Phlebo scan gate and tube inspector queue picker. `@kuraModules phlebo` |
| `SampleDeferDialog`, `SampleDeferDialogProps`, `SampleDeferDialogSample` | Defer-sample dialog from the Phlebo collection workflow: sample/tube summary, reason selector affordance, optional note, and confirm/cancel footer. `@kuraModules phlebo` |
| `SampleDetailPanel`, `SampleDetailPanelProps`, `SampleDetailPanelSample` | Tube Inspector detail panel showing tube visual, sample metadata, tests, collection/inversion status, clot-time handling, related samples, and collect action. `@kuraModules phlebo` |
| `SampleTable`, `SampleTableProps`, `SampleTableSample` | Phlebo sample collection table ordered by tube draw sequence, including tube/additive, tests, STAT, inversion action, clot time, status, and collect/defer/reset actions. `@kuraModules phlebo` |
| `ScanGatePanel`, `ScanGatePanelProps` | Scanner-first gate panel: icon header, scan input, optional queue disclosure, and keyboard-hint strip. Used for Phlebo patient scan and Tube Inspector entry states. `@kuraModules phlebo` |
| `SignInCard`, `SignInCardProps`, `SignInProviderConfig` | Canonical Kura sign-in surface used by every Kura app's `/sign-in` route. Optional providers row (Google / Telegram / future) with a "OR" separator → email input → brand-tinted submit button → privacy line. Stateless and controlled; day-one configuration is email-only (`providers={[]}` or omitted). Density-aware width: 380 / 460 / 540 px. |
| `Stepper`, `StepperStep`, `StepStatus` | Multi-step progress indicator. `StepperStep` is the per-step input shape; `StepStatus` is the status enum. |
| `TimeSlotPicker`, `TimeSlot` | Grid of selectable time slots; `TimeSlot` is the per-slot shape. |
| `ToastProvider`, `toast` | Sonner-backed toast system. Mount `<ToastProvider />` once at the app root; call `toast(...)` from anywhere. |
| `SubjectContextCard`, `SubjectContextCardProps`, `SubjectContextDetail` | Side-rail context card for a loaded clinical subject, with avatar, subtitle, pills, notice, journey, and data-point details slots. Used by Phlebo patient context without story-local card chrome. `@kuraModules phlebo` |
| `SubjectHeader` | Subject-centered staff-wizard header — avatar slot + title (configurable element via `as`, default `h2`) + horizontal pills slot + right-aligned actions slot + status slot. Generic to any wizard centred on a subject (patient for receptionist, sample/draw for phlebo). `@kuraModules receptionist, phlebo` |
| `TeleconsultBookingCard`, `TeleconsultBookingCardProps` | Step 5 teleconsult booking panel. Pure slot factoring: workflow card shell with optional `noticeBanner`, a specialty-control row, a calendar slot (typically `<BookingCalendar>`), a day-heading band wrapping a `timeSlots` slot (typically `<TimeSlotPicker>`), and an `actions` row. Kit owns layout; caller wires state. `@kuraModules receptionist` |
| `TubeRack`, `TubeRackItem`, `TubeRackProps` | Phlebo order-of-draw rack using `TubeVisual` for required/not-needed/collected/deferred/needs-invert tube states. `@kuraModules phlebo` |
| `VerifyEmailCard`, `VerifyEmailCardProps` | Verify-code surface used by every Kura app's `/verify` route. Title + serif email echo → `OtpInput` (`length=6`, autofocus) → brand-tinted Verify button (disabled until 6 digits AND `!isVerifying`) → resend link with cooldown countdown. Stateless and controlled; never auto-calls `onVerify` on code completion — user always presses the button. Density-aware width: 380 / 460 / 540 px. |
| `WizardLayout`, `WizardLayoutProps` | Full wizard frame: fixed header band → fixed 63-px stepper band → scrollable body (with optional 360-px aside rail) → fixed footer band. Five slots (`header`, `stepper`, `aside`, `footer`, `children`); no state. Optional `asideWidth` override. `@kuraModules receptionist, phlebo` |
| `WizardStepFooter`, `WizardStepFooterProps` | Bottom step action bar: Back button on the left; optional blocker status and Continue button on the right, with optional `Enter` keycap hint. Stateless controlled — caller provides labels, disabled state, blocker text, and click handlers. `@kuraModules receptionist, phlebo` |

### `@kura/ui-kit/ui/<name>`

shadcn primitives, themed via `theme.css` (which aliases shadcn's semantic vars onto Kura tokens). The `./ui/*` subpath glob lets consumers import primitives individually (`@kura/ui-kit/ui/button`); the same exports also flow through the root barrel (`@kura/ui-kit`).

| Subpath | Exports |
|---|---|
| `@kura/ui-kit/ui/avatar` | `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarBadge`, `AvatarGroup`, `AvatarGroupCount` |
| `@kura/ui-kit/ui/badge` | `Badge`, `badgeVariants` |
| `@kura/ui-kit/ui/button` | `Button`, `buttonVariants`, `ButtonTone`. Optional `tone` prop (`'default' \| 'warning' \| 'danger'`) tints the border + text + hover-bg of `variant="outline"` only; solid variants ignore the prop. Reserved for warning/danger CTAs that pair color with icon + label per the brand "status by color alone is forbidden" non-negotiable. `aria-invalid` over-paints any tone tint (validation error is the higher-priority signal). |
| `@kura/ui-kit/ui/calendar` | `Calendar`, `CalendarDayButton` |
| `@kura/ui-kit/ui/checkbox` | `Checkbox` |
| `@kura/ui-kit/ui/command` | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator` |
| `@kura/ui-kit/ui/dialog` | `Dialog`, `DialogClose`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogOverlay`, `DialogPortal`, `DialogTitle`, `DialogTrigger` |
| `@kura/ui-kit/ui/dropdown-menu` | `DropdownMenu`, `DropdownMenuPortal`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` |
| `@kura/ui-kit/ui/input` | `Input` with optional `mask="date"` support for DD-MM-YYYY entry |
| `@kura/ui-kit/ui/label` | `Label` |
| `@kura/ui-kit/ui/popover` | `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription` |
| `@kura/ui-kit/ui/radio-group` | `RadioGroup`, `RadioGroupItem` |
| `@kura/ui-kit/ui/scroll-area` | `ScrollArea`, `ScrollBar` |
| `@kura/ui-kit/ui/select` | `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue` |
| `@kura/ui-kit/ui/separator` | `Separator` |
| `@kura/ui-kit/ui/skeleton` | `Skeleton` |
| `@kura/ui-kit/ui/sonner` | `Toaster` — the underlying Sonner component the kit wraps in `ToastProvider`. Most callers should use the organism, not this primitive. |
| `@kura/ui-kit/ui/switch` | `Switch` |
| `@kura/ui-kit/ui/table` | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` |
| `@kura/ui-kit/ui/textarea` | `Textarea` |
| `@kura/ui-kit/ui/toggle` | `Toggle`, `toggleVariants` |
| `@kura/ui-kit/ui/toggle-group` | `ToggleGroup`, `ToggleGroupItem` |
| `@kura/ui-kit/ui/tooltip` | `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` |

## Module-tagged subpaths

Components flagged with `@kuraModules <list>` in their JSDoc are re-exported from the kit's per-module barrels in addition to their layer barrel. Layer barrels remain canonical (every kit component flows through them); module barrels are opinionated subsets, useful when a consumer app wants to scope its imports to "what serves my module".

| Subpath | Re-exports (curated view) |
|---|---|
| `@kura/ui-kit/receptionist` | `LockableField`, `SpecialtyBadge`, `BookingCalendar`, `CatalogBundleRow`, `CatalogTestRow`, `ContextPickerPopover`, `ContextPickerItem`, `MediaFrame`, `SearchTrigger`, `SectionCard`, `SectionCardMetaTone`, `SectionCardPadding`, `SectionCardProps`, `SectionCardTone`, `IntakeCard`, `OrderCart`, `SubjectHeader`, `TeleconsultBookingCard`, `WizardLayout`, `WizardStepFooter` |
| `@kura/ui-kit/phlebo`       | `LockableField`, `BookingCalendar`, `BookingCalendarProps`, `ClinicalNumberField`, `ClinicalNumberFieldProps`, `ClinicalNumberFieldState`, `CompositeNumberField`, `CompositeNumberFieldField`, `CompositeNumberFieldProps`, `ContextPickerPopover`, `ContextPickerItem`, `DerivedValueField`, `DerivedValueFieldProps`, `JourneyList`, `JourneyListProps`, `JourneyListStatus`, `JourneyListStep`, `SampleStatusBadge`, `SampleCollectionStatus`, `SampleStatusBadgeProps`, `SearchTrigger`, `SearchTriggerProps`, `SectionCard`, `SectionCardMetaTone`, `SectionCardPadding`, `SectionCardProps`, `SectionCardTone`, `SegmentedControl`, `SegmentedControlOption`, `SegmentedControlProps`, `TubeDot`, `TubeVisual`, `TubeDotProps`, `TubeVisualProps`, `TubeVisualSpec`, `TubeVisualStatus`, `TubeVisualTone`, `QueuePickList`, `QueuePickListItem`, `QueuePickListProps`, `SampleDeferDialog`, `SampleDeferDialogProps`, `SampleDeferDialogSample`, `SampleDetailPanel`, `SampleDetailPanelProps`, `SampleDetailPanelSample`, `SampleTable`, `SampleTableProps`, `SampleTableSample`, `ScanGatePanel`, `ScanGatePanelProps`, `SubjectContextCard`, `SubjectContextCardProps`, `SubjectContextDetail`, `SubjectHeader`, `TubeRack`, `TubeRackItem`, `TubeRackProps`, `WizardLayout`, `WizardStepFooter` |
| `@kura/ui-kit/patient`      | _(no components in this slice — stub barrel kept so the export resolves)_ |

Tag rule:

- 0 modules tagged (no `@kuraModules`) → universal → layer barrel only.
- 1–2 modules tagged → those module barrels + layer barrel.
- 3 modules tagged → equivalent to universal; the tag is documentation only.

## Utilities

| Subpath | Exports |
|---|---|
| `@kura/ui-kit/lib/cn` | `cn(...inputs)` — `clsx` + `tailwind-merge` className combiner. The same utility every kit component uses; consumers are encouraged to use this single helper rather than re-instantiating their own. |
| `@kura/ui-kit/lib/tokens` | `tintedRing({ color, width?, inset?, opacity? }): string` — composes a CSS `box-shadow` string for parameterized colored rings. Used internally by `ScanInput` (success/danger halos) and `ColorSwatch` (inset border ring); consumers can use it directly for ad-hoc tinted halos where a kit token doesn't cover the case. Zero kit imports — pure helper. |

## Root barrel

| Subpath | Re-exports |
|---|---|
| `@kura/ui-kit` (no subpath) | Everything from `./ui`, `./atoms`, `./molecules`, and `./organisms`. Use this for flat imports; use the layer subpaths when you want to scope (`import { Banner } from '@kura/ui-kit/molecules'`). |

## Peer dependencies

The kit assumes the consumer provides:

- `react ^19`, `react-dom ^19`
- `tailwindcss ^4` — the `@theme inline` block in `theme.css` is a Tailwind v4 mechanism.

That's it. The kit owns its other runtime deps (`@fontsource/*`, `tw-animate-css`, `shadcn`, `lucide-react`, `radix-ui`, `cmdk`, `react-day-picker`, `sonner`, `clsx`, `tailwind-merge`) — they ship as part of the design system runtime.
