# Changelogs

## v0.12.1 — 2026-05-13

Post-review auth-flow polish against the Storybook-approved local `localhost:6006` surface. No new exports, no token changes, no breaking changes.

### Changed
- `AuthShell` now treats `eyebrow` and `footer` as optional bands, so app routes can render the approved logo + card-only auth layout without placeholder chrome.
- `CheckInboxCard` now uses the approved auth inbox illustration and the shared link color tokens for its secondary actions; email echoes in check-inbox and verify states now use brand-blue emphasis.
- `MailProviderTile` now normalizes image icons as well as SVG icons, allowing the Outlook provider tile to use the approved asset.
- Auth flow stories now use the approved full Kura auth logo and remove the old eyebrow/footer text from the canonical sign-in, sending, check-inbox, and verify screens.
- Added `Foundations/Logo` stories plus the full-logo and symbol-logo assets to document Kura lockup usage inside Storybook.

Plan: `.claude/plans/2026-05-13-auth-kit-surface.md`. Local Storybook source of truth: `http://localhost:6006`.

## v0.12.0 — 2026-05-13

Ships the kit's auth surface — the six universal components every Kura app (`receptionist`, `phlebo`, `doctor`, `patient`) embeds at its `/sign-in`, `/check-inbox`, `/verify`, and `/callback` routes. Closes story S02 of the unified-auth-flow roadmap; the stateful runtime (`@kura/auth` sibling package) and per-app route recipe land in follow-up stories. No new tokens, no foundations changes, no breaking changes.

### Added
- `AuthShell` (organism) + `AuthShellProps` — full-viewport auth layout preset with logo + uppercase eyebrow + card slot + footer. Page canvas resolves to `--bg` so it flips automatically under `[data-theme="dark"]`. Default logo is the 40 × 40 dark-square Kura lockup; consumer can override via the `logo` prop.
- `SignInCard` (organism) + `SignInCardProps` + `SignInProviderConfig` — canonical sign-in surface. Optional providers row (Google / Telegram / future) with a "OR" separator → email input → brand-tinted submit button → privacy line. Day-one configuration is email-only (`providers={[]}` or omitted); the `providers` prop is the additive shape for future OAuth / Telegram support without breaking the kit.
- `VerifyEmailCard` (organism) + `VerifyEmailCardProps` — verify-code surface composing the existing `OtpInput` (`length=6`, autofocus). Title + serif email echo → 6-cell OTP → brand-tinted Verify button (disabled until 6 digits AND `!isVerifying`) → resend link with cooldown countdown. Never auto-calls `onVerify` on code completion — user always presses the button.
- `CheckInboxCard` (organism) + `CheckInboxCardProps` — "we sent you a magic link" surface with warning-toned mailbox `IconBadge` + email echo + 2-column `MailProviderTile` grid (Gmail / Outlook) + "Enter verification code" + "Resend email" action links.
- `AuthProviderButton` (molecule) + `AuthProviderButtonProps` — full-width outline button used by `SignInCard` to launch a non-email provider. Required `icon` + `label`; renders as native `<button>` for standard focus / keyboard semantics.
- `MailProviderTile` (molecule) + `MailProviderTileProps` — square 80-px webmail deep-link tile (`<a target="_blank" rel="noopener noreferrer">`). Used by `CheckInboxCard` in the inbox tile grid.

### Storybook
- New `stories/auth/*` tree with per-component stories (Default / Playground / state variants) plus four chained `Organisms/Auth/Flow/01-SignIn`–`04-Verify` stories that wrap each card in `<AuthShell>` and reproduce the four canonical auth-flow mockup screens node-for-node.
- All cards are density-aware (`380 / 460 / 540 px` across compact / cozy / comfortable) via Tailwind v4 `[[data-density='…']_&]` arbitrary variants driven by the existing density toolbar.

### Notes
- All six components are universal — no `@kuraModules` tag, layer-barrel exports only. Apps embed the auth flow uniformly.
- Token-first: every value resolves to an existing token in `src/styles/tokens.css`; the auth-shell page canvas uses the existing `--bg` semantic alias (resolves to `--ink-50`), the warning-toned mailbox uses the existing `--status-warn-*` ramp, the dark-square logo lockup uses `--ink-900` + `--ink-0`. No new tokens, no foundations changes.
- The `kura-logo.svg` asset is untouched. `AuthShell`'s default logo inlines the four SVG paths with `fill="currentColor"` so the dark-square container's `text-[var(--ink-0)]` drives the glyph fill; the original asset retains its navy + cyan brand colours for non-auth lockup usage.

Plan: `.claude/plans/2026-05-13-auth-kit-surface.md`. Parent roadmap: `.claude/plans/2026-05-13-unified-auth-flow.md` (story S02).

## v0.11.0 — 2026-05-12

Workspace audit pass: formalizes four previously-private exports as public, reconciles four brand/token rules in `CLAUDE.md` against in-tree practice, and clears mechanical drift surfaced by the audit. No source behavior changes — only doc, JSDoc, story-tag, and `package.json` metadata.

### Added (newly documented public API)
- `Icon` + `IconProps` (atoms) — Iconify-backed icon primitive with 1.5-stroke default and `strokeWidth={null}` opt-out for filled / coloured collections. Now formally listed in API_SURFACE.md (previously exported from the atoms barrel but undocumented). The kit's canonical icon-normalization seam; `ui/*` shadcn primitives may consume it (the documented sole `ui → atoms` exception).
- `SearchInputProps` (molecules) — the `SearchInput` props type. Now formally listed.
- `WizardStepBodyProps` (molecules) — the `WizardStepBody` props type. Now formally listed.

### Changed (kit rules in `CLAUDE.md`)
- **Layer purity** — documented the sole `ui → atoms` exception: shadcn primitives may import the `Icon` atom (and only that). Codifies existing in-tree practice across 8 `ui/*` files.
- **Token-first allowances** — broadened "still legitimate" arbitrary `[Npx]` to include layout-only slot dimensions (`width / height / size / gap / grid-template / padding / margin / inset / breakpoint-modifier`) when they express a canonical visual contract. Color / shadow / radius / type-size / border-color remain token-only.
- **Body-text floor** — added the non-body chrome carve-out (badges, pill markers, count digits, sub-359-px viewport meta-pill fallbacks) at 9.5–10.5 px, with a JSDoc-note requirement.
- **Lucide stroke** — codified the graduated stroke pattern (1.5 default; 1.75–2.5 permitted for icons ≤ 14 px to retain legibility against tabular content; `null` for filled / coloured collections).

### Fixed (mechanical drift)
- `stories/molecules/SectionCard.stories.tsx` — added missing `module:receptionist` + `module:phlebo` story tags (JSDoc-declared, not propagated to the story; caught by the audit).
- `stories/molecules/RadioCard.stories.tsx` + `stories/molecules/SummaryCard.stories.tsx` — added the three explicit module tags declared in JSDoc (previously implicit-universal via the 3-tag rule; made explicit for sidebar-badge consistency).
- `stories/foundations/{HelloKura,IconGallery}.stories.tsx` — added missing `'autodocs'` tag.
- `src/components/organisms/date-time-picker.tsx` — replaced 🕐 / ✓ / ⓘ emoji in the JSDoc ASCII-art layout doc with bracketed icon names (`[time-icon]` / `[check-icon]` / `[info-icon]`). JSDoc-only — no UI text changed.

### Internal (JSDoc documenting chrome / layout-locked exceptions)
- `atoms/specialty-badge.tsx` — JSDoc note on the 9.5 px uppercase chrome (non-body badge).
- `molecules/catalog-nav-item.tsx` — JSDoc note on the 10.5 px count-badge chrome.
- `organisms/stepper.tsx` — JSDoc note on the canonical pill geometry (`size-[22px]` mark, `gap-[7px]`, `h-[2px]` rail with `clamp(14px,3.4vw,60px)`) and 10.5 px marker chrome.
- `organisms/subject-header.tsx` — JSDoc note on the responsive-breakpoint slot geometry and sub-359-px 10 px meta-pill fallback.
- `organisms/order-cart.tsx` — JSDoc note on the locked cart-rail dimensions (`w-[360px]`, header heights, button sizes, promo/total caps).
- `package.json` — added `"sideEffects": false` tree-shaking hint (bundled from a pre-existing staged change, per designer's call). Source-only kit, no side-effect imports.

Plan: `.claude/plans/2026-05-12-ui-kit-audit.md`.

## v0.10.0 — 2026-05-12

Closes the two intake-deferred form-field patterns from the v0.9.0 audit. Two additive molecules promoted out of the Phlebo VitalSigns workflow stories; no API breaks.

### Added
- `DerivedValueField` molecule — labeled read-only display for a value computed from other inputs. Dashed border + recessed `--surface-2` fill mark it as non-interactive; bold mono numerals in `--ink-900` when populated, dimmed `--ink-400` placeholder when empty. Optional `unit` slot. Replaces the inline BMI dashed box at `stories/phlebo/_components/workflows.tsx` (Vital Signs → Biometrics). `@kuraModules phlebo`.
- `CompositeNumberField` molecule — N numeric inputs sharing one bordered shell, separated by a string (default `/`). Shell renders a `focus-within` ring (`--shadow-focus` + `--border-focus`) so keyboard focus is visible across the pair even though the individual inputs are stripped of their own focus rings. Per-field `aria-label` is required. Forwards standard `<Input>` props per field. Replaces the inline systolic/diastolic BP shell at `stories/phlebo/_components/workflows.tsx` (Vital Signs → Vitals). `@kuraModules phlebo`.

### Changed
- `stories/phlebo/_components/workflows.tsx` — both Vital-Signs inline form-field patterns (BMI dashed box, BP composite input) now consume the new kit primitives. The unused `<Input>` import was removed from the file in the same edit.

Plan: `.claude/plans/2026-05-12-derived-and-composite-fields.md`.

## v0.9.0 — 2026-05-12

Phlebo module surface lands. Bundles a brand/token audit pass (caught during the merge-readiness audit of the prior phlebo work) with one new kit primitive promoted out of the phlebo workflow stories.

### Added
- `SegmentedControl` molecule — single-select segmented control with a recessed `--surface-2` tray, optional Tabler icons per option, and Radix `ToggleGroup` (`type="single"`) under the hood. Active item filled with `--brand-500` + `--ink-0` + `--shadow-xs`; inactive items brighten to `--surface` on hover. 150 ms ease transition on selection change; `--shadow-focus-compact` focus ring. Per-option `disabled` supported. `@kuraModules phlebo`. Replaces the inline tray + filled/ghost `<Button>` pattern at `stories/phlebo/_components/workflows.tsx` (Pre-analytical → Arm Left/Right).

### Changed
- `TubeRack` (organism) — legend now uses Tabler icons (`circle-check` / `rotate-clockwise` / `circle-dashed`) paired with tinted text, replacing the prior color-only dots. Brings the legend into compliance with the brand "status by color alone is forbidden" rule.
- `stories/molecules/TubeVisual` `ToneCatalog` — items now wrap in `<SectionCard padding="sm">` instead of raw `rounded-[var(--radius)] border` chrome, matching the kit's "stories ARE the consumer spec" discipline.
- `stories/phlebo/_components/workflows.tsx` — Pain VAS panel migrated from inline `rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-4` chrome to `<SectionCard tone="default">`.

### Fixed
- Non-standard Lucide icon sizes on `JourneyList`, `TubeVisual` (inversion-count badge), and `ScanGatePanel` (queue toggle) — all snapped to the locked Lucide scale (`12 / 14 / 16 / 20 / 24 / 28`).
- `src/components/molecules/index.ts` — alphabetized `JourneyList` (before `KeyboardHint`) and `SampleStatusBadge` (before `ScanInput`); the prior phlebo addition had inserted them out of order.
- `API_SURFACE.md` — `JourneyList` row moved before `KeyboardHint` to match the source-of-truth barrel order.

### Out-of-scope follow-ups (next intake cycle)
- `DerivedValueField` molecule — for the BMI dashed read-only computed-value box at `workflows.tsx:102–105`. Pattern remains inlined in the story until the primitive lands.
- `CompositeNumberField` molecule — for the systolic/diastolic paired input at `workflows.tsx:122–137`.

Plan: `.claude/plans/2026-05-12-segmented-control.md`.

## v0.8.0 — 2026-05-12

Kit-primitive expansion to close consumer gaps identified in the receptionist alignment audit. Six additive additions (three new molecules, one new prop on existing molecule, one new prop on Button, one canonical-pattern story).

### Added
- `MediaFrame` molecule — bordered placeholder for QR codes, camera previews, and image mounts. Props: `tone` (`default | danger`), `dashed`, `bg` (`surface | muted | white` — `white` JSDoc-locked to QR-readability), `padding`. Closes F-OS-7.
- `SearchTrigger` molecule — button styled as `<SearchInput density="default">` that opens a `<CommandPalette>`. Props: `placeholder`, `shortcut`, `onClick`. Closes F-OS-9.
- `FilterChip` molecule — chip composing `<StatusDot>` + label + count + active state. Props: `value`, `label`, `tone`, `count`, `active`, `onClick`. Closes F-OS-11.
- `KeyboardHintsBarDensity` type and `density` prop on `KeyboardHintsBar` — `compact` shrinks text to 10.5px for catalog rails. Closes F-OS-8.
- `ButtonTone` type and `tone` prop on `Button` — `warning` / `danger` tints scoped to `variant="outline"` per the brand "status by color alone is forbidden" rule (consumers must pair with icon + label). Closes F-OS-10.
- `WithQuestionLabel` story on `RadioGroup` — documents the canonical Question-Label pattern. Closes F-OS-6 without a new component (YAGNI per CLAUDE.md).

### Out-of-scope follow-ups (separate intakes in apps/receptionist)
- `apps/receptionist/src/shell/TopBar.tsx` to swap hand-rolled trigger for `<SearchTrigger>`.
- `apps/receptionist/src/shell/CommandPalette.tsx` to drop local FilterChip for the kit version.
- `apps/receptionist/src/wizard/steps/03-insurance/SavedPolicyCard.tsx` to use `<Button variant="outline" tone="warning">`.
- `apps/receptionist/src/wizard/steps/04-orders/KeyboardHintStrip.tsx` to use `<KeyboardHintsBar density="compact">`.
- MediaFrame consumers (`ScanQrFlow.tsx`, `TelegramVerificationCard.tsx`, `KhqrPaymentFlow.tsx`) to adopt the new molecule.

Plans: `.claude/plans/2026-05-12-{radiogroup-question-label-pattern,keyboardhintsbar-density-prop,button-tone-variant,mediaframe-molecule,searchtrigger-molecule,filterchip-molecule}.md`

## v0.7.6 — 2026-05-12

Story-only follow-up to v0.7.5. Closes the Option-A `tracking-[0.12em]` sweep started in F-OS-5 by snapping the last remaining literal to `tracking-k-wider`.

### Changed
- `IntakeCard` story snaps its sole `tracking-[0.12em]` literal to `tracking-k-wider`, closing the Option-A sweep started in v0.7.5. No new plan file — this is a documented loose-end from `.claude/plans/2026-05-12-step5-kit-primitives-story-update.md`.

## v0.7.5 — 2026-05-12

Story-only follow-up to v0.7.4. Brings the canonical Step 5 Pre & post consultation story into alignment with the kit primitives the receptionist app already consumes (`VisitDetailsCard.tsx`, `TeleconsultBooking.tsx`). Closes audit follow-up F-OS-5.

### Changed
- `Step5PrePostConsult` story replaces six local helpers (`WorkflowHeading`, `WorkflowCard`, `IntakeCard`, `DateCell` + `SchedulingCalendar`, `TeleconsultCard`) with their kit equivalents (`<WorkflowHeading>`, `<SectionCard>`, `<IntakeCard>`, `<BookingCalendar>`, `<TeleconsultBookingCard>`). Inline `tracking-[0.12em]` snaps to `tracking-k-wider` (0.04em) for brand consistency. Aligns the canonical visual contract with the receptionist app's already-correct usage. No source / token / API change.

Plan: `.claude/plans/2026-05-12-step5-kit-primitives-story-update.md`.

## v0.7.4 — 2026-05-12

Story-only follow-up to v0.7.3. Brings the canonical Step 2 Patient story's optional disclosures into alignment with the kit's `<CollapsibleSection>` molecule (already correctly used by the receptionist app's `AddressForm.tsx` / `RefundAccountForm.tsx`). Closes audit follow-up F-OS-4.

### Changed
- `Step2Patient` story replaces the local `OptionalSection` helper with `<CollapsibleSection>` for the Address and Refund-account disclosures. Aligns the canonical visual contract with the receptionist app's already-correct `AddressForm.tsx` / `RefundAccountForm.tsx` usage. No source / token / API change.

Plan: `.claude/plans/2026-05-12-step2-collapsiblesection-story-update.md`.

## v0.7.3 — 2026-05-12

Story-only follow-up to v0.7.2. Brings the canonical Step 1 Identity story's capture-method tiles into alignment with the kit's `<IconChoiceCard>` molecule (already correctly used by the receptionist app's `IdentityStep.tsx`). Closes audit follow-up F-OS-1.

### Changed
- `Step1Identity` story adopts `<IconChoiceCard>` for the three capture-method tiles (QR / NFC / Manual), replacing raw `<button>` and `<div aria-disabled>` chrome. Brings the canonical visual contract node-for-node in line with the receptionist app's already-correct `IdentityStep.tsx`. The "Coming soon" inline pill now comes from the kit primitive instead of a standalone `<Badge variant="neutral">`. No source / token / API change.

Plan: `.claude/plans/2026-05-12-step1-iconchoicecard-story-update.md`.

## v0.7.2 — 2026-05-12

Story-only follow-up to v0.7.1. Aligns the canonical Step 3 Insurance story with the kit's `<SectionCard>` primitive so the receptionist app's `PolicyForm.tsx` (F-03) and `InsuranceEmpty.tsx` (F-02) can adopt the same surface during audit follow-up.

### Changed
- `Step3Insurance` story adopts `<SectionCard padding="lg">` for both the policy-summary card body and the "No insurance on file" empty state, replacing raw `<section className="rounded-[var(--radius-lg)] border border-border bg-card p-5">` chrome. The line-79 empty-state swap preserves the original `py-10` vertical override as a `className` on `<SectionCard>` and migrates the `flex flex-col items-center gap-3 text-center` body layout to an inner `<div>` wrapper; the centered `<h3>No insurance on file</h3>` stays inline in the body (NOT moved to `SectionCard.title` — the empty-state heading is centered body content within a vertical icon→h3→p→CTA composition). Adopting `<SectionCard>` introduces the canonical `--shadow-xs` hairline elevation on both blocks. Aligns the canonical visual contract with the receptionist app's existing kit-driven structure. Unblocks app fixes F-02 (InsuranceEmpty) and F-03 (PolicyForm). No source / token / API change.

Plan: `.claude/plans/2026-05-12-step3-insurance-story-update.md`.

## v0.7.1

Story-only follow-up to v0.7.0. Aligns the canonical Step 1 Identity story with the receptionist app's already-correct `BookingCodeInput.tsx` usage; closes audit follow-up F-OS-2 and unblocks app-side fix F-06 (BookingCodeInput typography sweep).

### Changed
- `Step1Identity` story adopts `<SectionCard padding="sm">` for the booking-code panel, replacing the raw `<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">` chrome. Brings the canonical visual contract into line with the receptionist app's existing `BookingCodeInput.tsx` (which already consumes `<SectionCard padding="sm">`) and introduces the canonical `--shadow-xs` hairline to match every other `<SectionCard>` on the step body. No source / token / API change.

Plan: `.claude/plans/2026-05-12-step1-booking-code-story-update.md`.

## v0.7.0

Token-composition + density-utility sweep. Closes the gap left by the v0.6.1 token-first refactor: bridges the previously-orphaned density typography / tracking / leading tokens into Tailwind v4 utilities, adds two derived shadow halos for active/selected and dense-focus states, ships a small `tintedRing()` helper for parameterized colored halos, and sweeps every component and story to consume the new surface. Enforces the brand `body-min-11` rule by snapping all 10 px uppercase eyebrow chrome to 11 px.

### Added
- New shadow tokens in `tokens.css`: `--shadow-selected` (`0 0 0 3px rgba(var(--brand-rgb), 0.18)`) for persistent active/selected halos (Stepper active step), semantically distinct from focus; `--shadow-focus-compact` (`0 0 0 2px rgba(var(--brand-rgb), 0.32)`) for WCAG-2.4.7-compliant width-based softer focus on dense surfaces (compact `SearchInput`).
- 14 new Tailwind v4 `@theme inline` utility bridges in `theme.css`: `text-k-{body,h,sm,xs,lg}` for density-aware typography, `tracking-k-{tight,base,wide,wider,caps}` for letter-spacing, `leading-k-{tight,snug,base,relaxed}` for line-height. These resolve from the underlying density tokens so the `data-density` toolbar now drives kit typography.
- New `@kura/ui-kit/lib/tokens` subpath exporting `tintedRing({ color, width?, inset?, opacity? }): string` — composes a CSS `box-shadow` string for parameterized colored rings. Used internally by `ScanInput` and `ColorSwatch`; consumers can adopt it for ad-hoc tinted halos.
- `SearchInput`: new optional `density` prop (`'default' | 'compact'`; default `'default'`) and new exported `SearchInputDensity` type. Compact = `h-7`, `--radius-sm`, `--surface-2` bg, `text-k-xs`, `--shadow-focus-compact` on focus; intended for dense catalog/order-cart surfaces where the full input visually dominates. Backward-compatible — default behavior unchanged.

### Changed
- `SectionLabel` canonical floor raised from 10 px to 11 px, satisfying the brand `body-min-11` rule (no API change; visible shift only).
- ~20 inline 10 px uppercase eyebrow spots across `catalog-test-row`, `catalog-bundle-row`, `count-badge`, `order-cart`, `intake-card`, `notifications-panel`, `profile-menu`, `teleconsult-booking-card`, `wizard-step-footer`, and matching stories snapped to 11 px (`text-k-xs`).
- `OrderCart`: ~30 Figma-clone pixel literals normalized to kit tokens. Typography adopts `text-k-*` / `leading-k-*` utilities; spacing adopts the Tailwind 4-px scale; sub-pixel tracking artifacts (`tracking-[-0.005em]`, `tracking-[-0.065px]`, `tracking-[-0.279px]`) removed.
- `Stepper` active-step halo tokenized to `shadow-[var(--shadow-selected)]` (no visual change; semantic correction — was previously a bespoke `0 0 0 3px rgba(...)` literal).
- `Checkbox` radius `rounded-[4px]` → `rounded-[var(--radius-xs)]`; `Tooltip` arrow radius `rounded-[2px]` → `rounded-[var(--radius-xs)]` (no visible change at compact / cozy / comfortable density steps).
- `ScanInput` and `ColorSwatch` switched from hand-rolled `shadow-[0_0_0_Npx_rgba(...)]` strings to the new `tintedRing()` helper. `ColorSwatch.color` prop carries an `@allowArbitraryValue` JSDoc tag documenting its intentional exception from the token-first rule (the entire point of the component is to render an arbitrary color).
- 20 + story files adopt `<SectionCard>` / `<SectionLabel>` / `<Badge>` from the kit instead of duplicating inline card / eyebrow / pill chrome — the stories now exercise the same kit primitives consumer apps are required to use under the "Stories ARE the consumer spec" rule.

Plan: `.claude/plans/2026-05-12-token-composition-density-sweep.md`.

## v0.6.1

Token-first sweep across kit source and stories. Every CSS value now resolves to a token from `src/styles/tokens.css`.

### Changed
- Replaced all `shadow-[0_1px_2px_rgba(15,23,42,0.04)]` / `shadow-[0_1px_2px_rgba(11,20,36,0.04)]` literals in `section-card`, `catalog-nav-item`, `intake-card`, `teleconsult-booking-card`, `catalog-workspace`, `order-cart`, and matching story files with `shadow-[var(--shadow-xs)]`. Visual delta: blur tightens 2px → 1px — barely perceptible.
- Replaced all `rounded-[Npx]` literals (3, 4, 5, 7, 8, 9, 10, 12, 14 px) across kit source and stories with the closest density-aware token: `rounded-[var(--radius-xs)]` (4px), `rounded-[var(--radius-sm)]` (6px), `rounded-[var(--radius)]` (8px), `rounded-[var(--radius-lg)]` (12px). Max visual shift is 2px on radii; tokens follow user density (compact / cozy / comfortable) so the radii now scale with the rest of the UI.
- Replaced the only hex literal in the codebase — `#a7f3d0` in `stepper.tsx` (done-state mark border + connector divider) — with `var(--success-100)`. Slight saturation shift, no semantic change.
- `stepper.tsx`'s 2-px connector hairline switches from `rounded-[1px]` to `rounded-full` (visually identical at 2-px height; semantically the right utility for a pill).

### Docs / workflow
- `CLAUDE.md` adds the "Tokens are non-negotiable" section codifying the rule with a ❌/✅ table, what's still legitimate (density-tuned typography, layout utilities, `var(--brand-rgb)` overlays, shadcn semantic vars), and a three-step escalation path when no token covers a value (closest token → extend the scale via intake → JSDoc-document the one-off).
- `.claude/agents/developer.md` adds a "Token-first scan" Phase 1 verification with concrete grep commands, and adds the rule to the Hard Rules list.
- `.claude/commands/kura-design/deliver.md` adds step 3.25 (token-first scan against the staged tree, between typecheck/lint and Chromatic). Hex / rgba / arbitrary-px hits are blockers.
- `.claude/commands/kura-design/intake.md` adds a "Token-first check" requirement to every component plan's design section — every consumed token must be listed by name; missing tokens must be flagged.

## v0.6.0

Receptionist wizard kit-first alignment — promotes every story-inline composition from `stories/receptionist/wizard/steps/Step{1..6}*.stories.tsx` that pays for promotion into reusable kit primitives, so consumer apps become thin plug-and-play stateful shells over kit visuals.

### Added
- `SpecialtyBadge` atom (and `SpecialtyBadgeTone`) — tone-coded uppercase category badge for the receptionist orders catalog (`haem / biochem / urine / vitals / popular`). The `popular` tone uses neutral ink-tint (not brand) to avoid colliding with brand-tinted category tones. `@kuraModules receptionist`.
- `SectionCard` molecule (and `SectionCardProps`, `SectionCardMetaTone`, `SectionCardPadding`, `SectionCardTone`) — bordered section card with optional `title` (header band suppressed when omitted), optional right-aligned `meta` pill (`metaTone: 'success' | 'neutral'`) or muted `hint`, `padding: 'sm' | 'md' | 'lg'`, and `tone: 'default' | 'info' | 'success' | 'warning' | 'danger' | 'brand'` for tinted surfaces.
- `RadioCard` molecule (and `RadioCardProps`, `RadioCardLayout`) — radio-bound clickable card with `tile` and `pill` layouts. Selected state detected via `:has([data-state=checked])` on the wrapping `<label>`. `hideRadioControl` for the visible-pill pattern. Designed for use inside a controlling `<RadioGroup>`.
- `SummaryCard` molecule (and `SummaryCardProps`, `SummaryCardTone`) — composed display card with leading `<IconBadge>` + optional eyebrow + title + optional inline `<StatusPill>` + optional actions + optional `<Separator>` + body + optional footer. `tone` (default / info / success / warning / danger / brand) tints both bg and border for callout-style header-only cards. Children are optional (divider auto-suppressed when omitted).
- `BookingCalendar` molecule (and `BookingCalendarProps`) — single-date booking calendar wrapping `react-day-picker` with a custom `DayButton`. Brand-tinted "today", ink-tinted "selected", line-through "unavailable". Accepts the full `Matcher` API for `disabled`. `@kuraModules receptionist, phlebo`.
- `CatalogTestRow` molecule (and `CatalogTestRowProps`, `CatalogTestRowTag`) — receptionist catalog test row with name + `SpecialtyBadge` tags + price + brand-tinted Add button + optional AI-reasoning info button (prop named `onShowAiReason`, baked-in AI purple). `@kuraModules receptionist`.
- `CatalogBundleRow` molecule (and `CatalogBundleRowProps`) — receptionist catalog bundle row with cube icon + name + description + tests count + total + Add button. Layout locked to the canonical story spec. `@kuraModules receptionist`.
- `WorkflowHeading` molecule (and `WorkflowHeadingProps`) — three-line phase heading: brand-tinted `<SectionLabel>` eyebrow + title + optional subtitle. The canonical "Pre-consultation / Visit details / …" pattern.
- `IntakeCard` organism (and `IntakeCardProps`) — Step 5 patient-intake panel: workflow card with title + StatusPill header, optional CTA band, and a bordered checklist rail body. Children should be `<ChecklistItem>` rows. `@kuraModules receptionist`.
- `TeleconsultBookingCard` organism (and `TeleconsultBookingCardProps`) — Step 5 teleconsult booking panel. Pure slot factoring: workflow card shell with optional notice banner, specialty control row, calendar slot, day-heading band wrapping a time-slots slot, and an actions row. `@kuraModules receptionist`.
- New layer + module-tagged subpath re-exports for every addition above (atom barrel, molecule barrel, organism barrel, `@kura/ui-kit/receptionist`).
- Storybook coverage for each new component (Default, Playground, and at least one realistic scenario story); SectionCard ships `Tones` and `NoTitle` showcase stories; SummaryCard ships `PaidReceipt` and `ZeroPayment` header-only-tinted stories.
- `CLAUDE.md` "Stories ARE the consumer spec" section codifying the kit-first / no-custom-wrappers / 1-on-1 conventions for consumer apps.

### Changed
- `IconChoiceCard` rebuilt to use `<IconBadge>` internally. Adds `iconBadgeTone` (default `brand`, auto-flips to `neutral` when `comingSoon`), `iconBadgeSize` (default `lg`), `trailing` slot (defaults to "Start →" arrow; pass `null` to suppress or a custom node like `<Kbd>F2</Kbd>` to replace), and `comingSoonLabel`. When `comingSoon`, renders as `aria-disabled` `<div>` with a dashed border, dimmed opacity, and an inline "Coming soon" pill next to the title. Existing call sites that don't pass `trailing` continue to render the canonical "Start →" arrow on interactive cards — backward-compatible.

Plan: `.claude/plans/2026-05-12-receptionist-wizard-steps-kit-alignment.md`.

## v0.5.0

Operational wizard fidelity + catalogue-workstation decomposition. This release keeps the visual Storybook work from the receptionist wizard pass, then promotes the reusable workstation patterns into the kit instead of leaving Step 4 as a monolithic story.

### Added
- `CatalogNavItem` molecule (and `CatalogNavItemProps`) — compact operational catalogue/worklist row with icon, label, optional count, optional shortcut key, and controlled active state. Universal; callers own category data and click handling.
- `CatalogWorkspace` organism (and `CatalogWorkspaceProps`) — operational catalogue shell with scrollable left rail, compact toolbar search slot, optional trailing controls, filter strip, keyboard-hint strip, and slotted result region. Universal; callers own row rendering, state, and business actions.
- Storybook coverage for `CatalogNavItem` and `CatalogWorkspace`, including default, playground, and realistic workstation compositions.
- `Input` `mask="date"` support for DD-MM-YYYY entry, including numeric input mode, caret preservation, and Storybook coverage.

### Changed
- `Step4Orders` now composes `CatalogWorkspace`, `CatalogNavItem`, `SearchInput`, `FilterBar`, `FilterGroup`, `KeyboardHintsBar`, `ToggleGroup`, `Badge`, and `OrderCart` while keeping medical row data and actions story-local.
- Receptionist wizard stories for patient, insurance, orders, consult, stepper, layout, and footer were tightened to match the approved prototype density and footer/aside geometry.
- `OrderCart` gains a prototype-aligned empty state and optional `onAddFirst` action while hiding item-count chrome when the cart is empty.
- `SearchInput` gains inner input, icon, icon-size, and trailing-slot class hooks so compact catalogue toolbars do not reimplement the primitive.
- `KeyboardHint` gains multi-key separators plus kbd/label class hooks for compact shortcut bars.
- `ScanInput` now forwards `disabled` to the underlying field and dims its leading icon/keycap affordance.
- `WizardStepFooter`, `WizardLayout`, and `Stepper` visual treatment was adjusted to match the receptionist wizard prototype while preserving existing public component contracts.
- `eslint.config.js` ignores the local nested `ui-kit/` scratch artifact so lint only checks the real package tree.

### Fixed
- Removed an invalid example Tailwind arbitrary-value class from an `ExpandableItemRow` source comment that caused Storybook's CSS optimizer to warn.
- Synced `bun.lock` with the already-declared `lucide-react` runtime dependency from the v0.4.0 component promotion.

## v0.4.0

Orders-step extraction + `OrderCart` promotion. Three approved plans land as a single additive minor release: pass 1 (orders-step atoms / molecules / `OrderSummary`), pass 2 (`BundleTable` organism + `Callout` / `ExpandableItemRow` / `FilterBar` molecules + Step 4 scenario refresh), and pass 3 (`OrderCart` promoted from story-private code to a `@kuraModules receptionist`-tagged kit organism, with full brand-rule cleanup).

### Added
- `SectionLabel` atom — 10 px uppercase `tracking-[0.06em]` muted-foreground label. The kit's canonical tiny-caps chrome label; consolidates the pattern previously implicit in `DataPoint`, `CollapsibleSection`, and inline call sites. Accepts an `as` prop (`'span' | 'div' | 'dt'`).
- `Callout` molecule (and `CalloutTone` type) — tone-only padded container (`info / success / warning / danger`). Distinct from `Banner` (header-led, with icon + bold title + action) — `Callout` wraps stacked content without a header, typically multiple `<InfoSection>`s.
- `ExpandableItemRow` molecule (and `ExpandableItemRowProps` type) — row primitive with trailing info-toggle button and below-expansion area. Controlled (`open` + `onOpenChange`) and uncontrolled (`defaultOpen`) modes. Distinct from `CollapsibleSection` (page-level chevron + section title) — `ExpandableItemRow` is row-level.
- `FilterBar` molecule — horizontal container for `FilterGroup` rows. Named anchor for the orders-step / catalog filter row pattern.
- `FilterGroup` molecule — tiny-caps label + optional leading icon + control slot (typically a `<ToggleGroup>`). Composes `SectionLabel`.
- `InfoSection` molecule — icon + tiny-caps label + body paragraph for structured doc-style content (e.g. "What it measures" / "Looks for" / "Results by" inside a `Callout`).
- `BundleTable` organism (and `BundleTableProps`, `BundleTableItem` types) — five-column table with per-row chevron disclosure (chevron / icon + name + description / member count / total / action). Internal `useState` per row; each item may declare `defaultOpen`. Universal.
- `OrderCart` organism (and `OrderCartProps`, `OrderCartItem`, `OrderCartItemKind`, `OrderCartGroup`, `OrderCartGroupKey`, `OrderCartBundle`, `OrderCartResultPill`, `OrderCartResultPillTone`, `OrderCartExternalLab` types) — receptionist's full order-rail: header → bundles → grouped items (vitals / lab / telecon) → Patient pays → optional promo + split-bill section (`promoSlot` / `splitBillSlot`) → still-needed checklist → results-turnaround timeline → bottom Check-in CTA. App owns the cart-store-to-props wiring shell. Tagged `@kuraModules receptionist`. Re-exported from `@kura/ui-kit/receptionist`. Promoted from `stories/receptionist/_components/order-cart.tsx` (story-private) with full brand-rule cleanup applied: ~25 hard-coded hex literals mapped to canonical kit tokens; AI-purple vitals tone re-toned to canonical `info`; Vietnam-flag emoji replaced with Iconify `circle-flags:vn`; sub-11 px body text raised to the 11 px floor.
- `OrderSummary` organism (and `OrderSummaryProps`, `OrderSummaryItem`, `OrderSummaryGroup`, `OrderSummaryAdjustment` types) — read-only receipt-style table with header → grouped `<TableBody>` → `<TableFooter>` (subtotal + generic `adjustments[]` + total). Pre-formatted ReactNode prices (kit does not own currency formatting). Universal.
- `lucide-react` promoted to a declared `dependency` (was an undeclared transitive). Three new kit source files import it directly (`bundle-table.tsx`, `expandable-item-row.tsx`, `order-summary.tsx`).
- Storybook stories for all eight new components, plus a refreshed `stories/receptionist/wizard/steps/Step4Orders.stories.tsx` scenario that mirrors the production app using kit primitives only (replacing the previous AI-orders placeholder mock).
- `stories/receptionist/_fixtures/order-cart.ts` — five fixtures (`ORDER_CART_EMPTY_GROUPS`, `ORDER_CART_LOADED_GROUPS`, `ORDER_CART_LOADED_BUNDLES`, `ORDER_CART_EXPANDED_BUNDLES`, `ORDER_CART_RESULTS_PILLS`) moved out of the deleted story-private file, with field renames matching the new prefixed-and-pre-formatted-ReactNode API.

### Changed
- `CLAUDE.md` line 51 — dropped `OrderCart` from the "pure module-specific business UI" exclusion list; appended a parenthetical noting the v0.4.0 promotion (justified by promotion criterion #1's "canonical visual contract" OR clause). All other items in the exclusion list still apply.
- `API_SURFACE.md` — adds the eight new component rows across `atoms` / `molecules` / `organisms`; updates the `@kura/ui-kit/receptionist` module-barrel row to include `OrderCart`.
- Receptionist `OrderCart` Storybook stories (`OrderCart.stories.tsx`, `wizard/WizardLayout.stories.tsx`, `wizard/steps/_cart-rail.tsx`, `Overview.mdx`) — re-pointed from the deleted story-private `_components/order-cart.tsx` to the new kit organism + fixtures.

### Removed
- `stories/receptionist/_components/order-cart.tsx` — promoted to `src/components/organisms/order-cart.tsx`.
- `stories/receptionist/_components/` directory — now empty after the file removal.

Plans:
- `.claude/plans/2026-05-11-orders-step-extraction-and-patient-order-table.md`
- `.claude/plans/2026-05-11-orders-step-pass-2.md`
- `.claude/plans/2026-05-11-order-cart-promote-to-kit.md`

## v0.3.0

### Added
- `WizardLayout` organism — full wizard frame: fixed header band → fixed 63-px stepper band → scrollable body (with optional 360-px aside rail) → fixed footer band. Five slots (`header` / `stepper` / `aside` / `footer` / `children`); no state. Optional `asideWidth` override. Tagged `@kuraModules receptionist, phlebo`.
- `WizardStepFooter` organism — bottom step action bar: optional `blockerLabel` on the left, Back/Continue buttons on the right with optional `Enter` keycap hint. Stateless controlled. Tagged `@kuraModules receptionist, phlebo`.
- `WizardStepBody` molecule — universal layout preset for a wizard step body: optional title + subtitle + actions slot in a header band, then vertically-stacked children. Slot-based; no state. Universal across modules (no `@kuraModules` tag) — usable by any wizard in any clinic module. Replaces the four niche `Wizard*` molecules introduced earlier in this train (see Removed).
- Storybook upgraded SB9 → SB10 (`storybook@10.3.6`, `@storybook/react-vite@10.3.6`, `@storybook/addon-a11y@10.3.6`, `@storybook/addon-docs@10.3.6`, `@storybook/addon-themes@10.3.6`, `eslint-plugin-storybook@10.3.6`). The kit's existing `.storybook/main.ts` and `.storybook/preview.tsx` worked unchanged against SB10 — no codemods required.
- Storybook addons: `@chromatic-com/storybook` (visual regression), `@storybook/addon-designs` (Figma overlay per story), `storybook-addon-pseudo-states` (force `:hover`/`:focus`/`:focus-visible`/`:active`/`:disabled` from the toolbar), `@geometricpanda/storybook-addon-badges` (visualize `module:*` and lifecycle tags as colored sidebar chips).
- `chromatic` CLI dependency + `bun run chromatic` script (`chromatic --exit-zero-on-changes`).
- `.storybook/preview.tsx` `badgesConfig` mapping `module:receptionist | module:phlebo | module:patient` to colored chips (using `--brand-500`, `--secondary-deep-500`, `--secondary-light-500`) + lifecycle tags `beta` (`--warn-500`) and `deprecated` (`--danger-500`).
- `stories/atoms/Button.stories.tsx` `Default` story gains a placeholder `parameters.design` so the addon-designs panel can be visually verified.
- `react-docgen-typescript` config in `.storybook/main.ts` now scopes to `src/**/*.{ts,tsx}` and filters out `node_modules`-sourced props — sharper Controls (no radix-ui internals leaking) and silences the `Skipping docgen for preview.tsx` warning.
- `stories/atoms/Label.stories.tsx` — dedicated Label story (6 variants: Default, Required, WithCheckbox, WithSwitch, PeerDisabled, GroupDisabled). Previously `Label` only appeared as a helper inside other atom/molecule stories; this gives it a first-class sidebar entry that documents its `peer-disabled` and `group-data-[disabled]` propagation.
- `stories/atoms/LabelSeparator.stories.tsx` — dedicated LabelSeparator story (4 variants: Default, BetweenFields, ShortLabel, LongLabel). Was previously demoed under `Atoms/Separator → WithLabel`; now has its own sidebar slot.
- `stories/molecules/WizardStepBody.stories.tsx` — five variants: Default, WithTitleAndSubtitle, WithActions, LongScrollableBody, Playground.
- `stories/receptionist/` — Storybook section for the receptionist app screens composed out of kit primitives. Structure mirrors `apps/receptionist/src/wizard/steps/`:
  - `Overview.mdx` — entry doc covering the new tree, the policy on app data-wiring shells, and the `WizardStepBody` layout preset.
  - `OrderCart.stories.tsx` — cart-only stories (Default, Empty, Paid, PaidEditPending).
  - `Modals.stories.tsx` — `HotkeyCheatsheet`, `PaidEditPrompt`, `RecaptureConfirm` modals via `Dialog` + `Kbd` + `Banner`.
  - `_fixtures/patient.ts` — mock patient + cart + queue fixtures (now exporting `WIZARD_LABELS` and `buildSteps` for shared use across per-step stories).
  - `wizard/WizardLayout.stories.tsx` (Default / NoAside / NoFooter / Playground) and `wizard/WizardStepFooter.stories.tsx` (Default / FirstStep / LastStep / Blocked / Playground) — canonical stories for the two new universal-but-module-tagged organisms.
  - `wizard/steps/Step1Identity.stories.tsx` … `Step6Payment.stories.tsx` — full-shell per-step stories migrated from the deleted monolithic `WizardShell.stories.tsx`. Each renders `<WizardLayout>` + step body using kit primitives + `WizardStepBody`.
  - `wizard/steps/_scaffold.tsx` and `wizard/steps/_cart-rail.tsx` — shared per-step shell + cart-rail helpers, factored out of the deleted monolith.

### Changed
- `CLAUDE.md` — reverses the prior-paragraph rule. New policy: "Generic primitives over module-specific compositions." Module-tagged kit organisms are promoted only when ≥ 2 modules will reuse the exact composition, OR when re-deriving in the app would risk drifting from the canonical visual contract. App data-wiring shells (`apps/.../shell/TopBar.tsx` wrapping `<AppHeader>`) are explicitly the right factoring and NOT an anti-pattern. Wrapper Storybook stories that duplicate a kit organism's own story are banned.
- `kura-new/CLAUDE.md` (workspace) — adds "Implication for UI in consuming apps" paragraph clarifying that apps consume kit organisms via thin local shells that read state and pass it as props; module-specific compositions enter the kit only under the new promotion bar.
- `API_SURFACE.md` — adds `WizardLayout`, `WizardStepFooter`, `WizardStepBody` rows; updates `@kura/ui-kit/receptionist` and `@kura/ui-kit/phlebo` module-barrel rows to include the two new organisms; refreshes the organisms intro paragraph to reflect the new policy.
- `stories/receptionist/Overview.mdx` — narrative refreshed to describe the wizard frame + step content layout preset + the kit/app boundary policy.
- `/kura-design:deliver` step 3.5 inserted between "Verify the build" and "Update the public surface docs": runs `bun run chromatic` when `CHROMATIC_PROJECT_TOKEN` is set, HALTS for designer approval at the printed build URL, gracefully skips when the token is unset.
- `/kura-design:intake` plan template now includes a `Figma reference` line (optional). The developer wires the URL into `parameters.design` per affected story when present; deliver does not block when omitted.
- `.claude/agents/developer.md` Phase 2 charter gains a Chromatic HALT rule: never tag or push while a Chromatic visual review is pending.
- `CLAUDE.md` adds a "Storybook addon stack" section describing the four addons and their roles in the design-review experience.
- `Stepper` (organism) — visual restyle to match Figma `1:530`. Each step now renders as a pill (rounded-full container wrapping number + label); active pill is brand-tinted (`--brand-50` bg + `--brand-200` border + `--brand-700` label), locked / done pills carry no pill chrome. Number circle 22×22 (was 24×24), label switched to `text-xs font-semibold` with `tracking-[-0.005em]`, connector divider 60×2 (was 12×1px). All values bound to existing tokens — no hardcoded hex. API unchanged (`steps`, `onStepClick`, `shortcutHint`).
- `AppHeader` (organism) — chrome height `h-14` → `h-16`, padding-x `px-4` → `px-6`, switched `bg-card`/`border-border` Tailwind utilities to direct `var(--surface)` / `var(--border)` references for token clarity. Slot API unchanged.
- `stories/organisms/AppHeader.stories.tsx` `ReceptionistChrome` — composition rewritten to match Figma `1:114`. Five inline chrome helpers (`PillButton`, `HeaderSearch`, `NotificationsButton`, `ProfileButton`, `NewWalkInButton`) bind exactly to `--surface`, `--surface-2`, `--border`, `--brand-200/500/700`, `--ink-400/500/700/900`, `--danger-500`. No hardcoded hex. Avatar uses `--brand-500` (kit reserves `--purple-*` for AI surfaces; Figma's purple gradient deviated from brand contract).
- `stories/molecules/PhoneInput.stories.tsx` — five new scenario stories: `WithError` (aria-invalid forwarded to inner input via child selector), `PrefilledVietnam`, `CustomCountries` (Mekong-only `countries` prop), `CustomPlaceholder`, `KhmerLabel` (i18n `lang="km"` + Khmer locale label).
- `stories/foundations/Colors.mdx` and `stories/foundations/HelloKura.stories.tsx` — removed AI accent purple section / swatch from Storybook display per brand rule "purple reserved for AI surfaces". The token `--purple-*` itself remains in `tokens.css` and `theme.css`; only the foundation showcase no longer surfaces it.
- `eslint.config.js` — added `.claude/worktrees` to `globalIgnores` so transient agent worktrees don't trigger `tsconfigRootDir` ambiguity errors during `bun run lint`.

### Removed (breaking)
- `WizardStepHeader`, `WizardCardSection`, `WizardFieldRow`, `WizardField` molecules — too niche per designer feedback; abstracted 1–2 lines of Tailwind each, paid no compositional dividend. Superseded by `<WizardStepBody>` for the title+subtitle+actions header pattern; inline raw Tailwind for card sections / field grids / labelled fields. See `MIGRATION.md` for the exact recipe.
- `stories/receptionist/WizardShell.stories.tsx` (1213 LOC monolith) — replaced by `stories/receptionist/wizard/steps/Step1Identity.stories.tsx` … `Step6Payment.stories.tsx`. Each story now reads patient fixtures from `_fixtures/patient.ts` and composes `<WizardLayout>` + step body via kit primitives. No public API impact.
- 8 wrapper stories that re-implemented receptionist data-wiring shells inside Storybook: `stories/receptionist/shell/{TopBar,Sidebar,CommandPalette,NotificationsPopover,ProfileMenu,NewWalkInButton}.stories.tsx` and `stories/receptionist/wizard/{WizardHeader,StepperBar}.stories.tsx`. They competed with the kit organisms' own stories without adding documentation value. App data-wiring shells live in the app; the kit ships the visual contract. No public API impact.

### Known persistent warnings
- `unable to find package.json for radix-ui` — emitted by Storybook core's `getAutoRefs` due to `radix-ui`'s wildcard exports. Documented in spec §8.5 as upstream-blocked; resolution requires either an SB upstream fix or refactoring the kit's shadcn components to import from `@radix-ui/react-*` directly.
- `@geometricpanda/storybook-addon-badges@2.0.5 depends on ^8.3.0` — addon hasn't shipped SB10 support yet (no 3.x line). Loads at runtime via legacy `@storybook/blocks@8.6.14`. Documented in spec §8.5; resolves when 3.x lands.

Plans:
- `.claude/plans/2026-05-08-storybook-addon-stack.md` (Storybook SB10 + addon stack)
- `.claude/plans/2026-05-11-receptionist-wizard-frame-and-app-migration.md` (Phase A only; Phase B abandoned in favor of the policy reversal below)
- `.claude/plans/2026-05-11-wizard-step-body-and-anti-proliferation-policy.md` (consolidation of the 4 niche molecules into `WizardStepBody`; CLAUDE.md policy refresh; redundant wrapper-story deletion)

## v0.2.0

### Added
- `MetaPill` atom — compact icon + text rounded chip for inline metadata (DOB, sex, phone, telegram handle). Universal. Distinct from `Badge` (variant-driven) and `StatusPill` (status tone + icon + label).
- `LockableField` atom — `Input` variant with a trailing lock icon when `locked`. Uses `readOnly` (focusable, value still submitted) + `aria-describedby` for the lock explanation. Tagged `@kuraModules receptionist, phlebo`.
- `CollapsibleSection` molecule — disclosure pattern (chevron + title + optional `<CountBadge>` + optional trailing meta slot) over a body that expands/collapses. Built on `@radix-ui/react-collapsible`. Controlled and uncontrolled.
- `IconChoiceCard` molecule — selectable card with brand-tinted icon square, title, description, optional `comingSoon` flag, and "Start →" CTA. `comingSoon` uses `aria-disabled` (focusable, announced).
- `ContextPickerPopover` molecule (and `ContextPickerItem` type) — listbox-pattern picker (trigger button + popover with `role="listbox"`/`role="option"` items, primary + optional subtitle). Arrow ↑/↓/Home/End keyboard navigation. Tagged `@kuraModules receptionist, phlebo`.
- `SubjectHeader` organism — subject-centered staff-wizard header (avatar slot + title with configurable element via `as` + horizontal pills slot + right-aligned actions slot + status slot). Generic across receptionist patient-wizards and phlebo sample/draw-wizards. Tagged `@kuraModules receptionist, phlebo`.
- New module-tagged subpaths: `@kura/ui-kit/receptionist`, `@kura/ui-kit/phlebo`, `@kura/ui-kit/patient`. Hand-curated barrels at `src/components/modules/{receptionist,phlebo,patient}.ts` re-export the components tagged for that module. Layer barrels (`atoms` / `molecules` / `organisms`) remain canonical.
- New JSDoc convention `@kuraModules <list>` on component files, plus matching Storybook `tags: ['module:<name>']` on stories — surfaces the module attribution to humans and Storybook's tag-based filter.
- Storybook coverage: `Atoms › MetaPill` (Default, Playground, WithoutIcon, Cluster, Densities), `Atoms › LockableField` (Default, Playground, Locked, LockedAndUnlocked, WithIdentityForm), `Molecules › CollapsibleSection` (Default, Playground, WithCount, WithMeta, Controlled, Stack), `Molecules › IconChoiceCard` (Default, Playground, ComingSoon, GridOf3, GridOf4), `Molecules › ContextPickerPopover` (Default, Playground, Stations, Shifts, LongList, KeyboardOnly), `Organisms › SubjectHeader` (Default, Playground, WithPatient, WithActions, Phlebo, HeadingLevels).

### Changed
- `CLAUDE.md` "Layer purity" rule relaxed: module-tagged compositions that serve more than one clinic module (or are the canonical reference for a single module's pattern) may live in the kit, declared with `@kuraModules`. Pure one-off business UI for a single module still stays in the consuming app.
- `API_SURFACE.md` adds a "Module-tagged subpaths" section documenting the per-module re-export views and the tag rule.

Plan: `.claude/plans/2026-05-08-ui-kit-module-tagging-and-app-promotion.md`

## v0.1.0

### Added
- `ColorSwatch` atom (and `ColorSwatchSize` type) — round chip rendering an arbitrary CSS color, for color-coded data (tube colors, category tags, palette previews). Distinct from `StatusDot`, which is locked to status tones.
- `ScanInput` molecule (and `ScanInputState` type) — barcode/scanner-driven input with leading scan icon, `Enter` keycap hint, and transient success/error feedback. Discriminated-union prop type compile-time-enforces the brand rule "status by color alone is forbidden" — a non-default `state` without a paired `helperText` is a type error.
- `Table` shadcn primitive at `@kura/ui-kit/ui/table` — exports `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`. Themed by `theme.css` via shadcn's semantic-var aliases; no source overrides needed.
- New Storybook coverage: `Atoms › Table` (Default, WithCaption, WithSelectedRow, WithFooter, Density), `Atoms › ColorSwatch` (Default, Sizes, Palette, InlineWithText, RingComparison), `Molecules › ScanInput` (Default, States, WithCustomIcon, InWorkflow).

### Changed
- `API_SURFACE.md` backfilled to document the full current public surface (atoms, molecules, organisms, shadcn `ui/*` primitives, `lib/cn`, root barrel). The previous version claimed the package was CSS-only with no React components — drift that long predates this release. No actual exports changed; this is a documentation correction.

Plan: `.claude/plans/2026-05-08-scan-input-table-color-swatch.md`
