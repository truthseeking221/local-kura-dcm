# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Where you are

This is `@kura/ui-kit` — the **source-only** design system package consumed by `apps/receptionist` (and future `apps/phlebo`, `apps/patient`) via `file:../../ui-kit`. Workspace-level rules live in `../CLAUDE.md`; do not restate them here. Key implications of being source-only with no build:

- Edits in `src/` are live the instant the consumer's Vite reloads. No `pnpm build` step.
- The public surface is **exactly** `package.json#exports`. Anything else is private — no deep-imports, no reaching into `src/components/ui/` from outside the kit.
- Consumers' Tailwind v4 setup must include `@source '../../node_modules/@kura/ui-kit/src/**/*.{ts,tsx}'` in their `globals.css`. Don't break that contract by introducing class names through unconventional means (computed strings, dynamic concatenation Tailwind can't see).

## Per-package commands

Package manager is **bun** (matches `bun.lock`, `packageManager: bun@1.3.11`). Node 20+.

```bash
bun install                 # install
bun run storybook           # dev: Storybook on :6006
bun run build-storybook     # static build → storybook-static/
bun run typecheck           # tsc --noEmit
bun run lint                # eslint .
bun run ui:add <name>       # shadcn add <primitive>
```

There is no test runner and no library build step. Verification = `typecheck` + `lint` + `build-storybook`.

## Architecture

### Layer purity (atomic design)

```
ui/        # shadcn primitives (CLI-managed via `bun run ui:add`); themed by theme.css
atoms/     # Kura-specific atoms with no shadcn equivalent (Kbd, StatusDot, ...)
molecules/ # Kura-specific compositions of atoms / shadcn ui (Banner, IconBadge, OtpInput, ...)
organisms/ # Neutral, reusable organisms (AppHeader, CommandPalette, Stepper, ...)
```

**No upward imports.** Atom must not import from molecules/organisms; molecule must not import from organisms; organism may compose atoms+molecules+ui. The barrel for each layer (`<layer>/index.ts`) is the layer's public face.

**One documented `ui → atoms` exception.** `ui/*` shadcn primitives may import the `Icon` atom (`../atoms/icon.tsx`) — and *only* that. This is the kit's normalization seam: every icon, even inside a shadcn-shipped primitive, goes through the 1.5-stroke + Iconify layer. No other `ui → atoms` / `ui → molecules` / `ui → organisms` imports are allowed.

**Layout presets** live in their natural layer (usually `molecules/`) and are universal — no `@kuraModules` tag. A preset bundles a recurring layout shape into one component with slots. Examples: `WizardStepBody` (title + subtitle + actions header band + vertically-stacked children). Presets exist when raw Tailwind would be repeated ≥ 5 times across the codebase; below that bar, inline the markup. Niche presets are a code smell — if a preset has only one prop and three lines of children, it's not paying for itself.

**Generic primitives over module-specific compositions.** The kit ships generic primitives (atoms, molecules, organisms) and presets — pre-shaped layout components that bundle common patterns. Prefer this over creating module-specific (`Receptionist*`, `Phlebo*`, …) compositions in the kit. A composition becomes a candidate for promotion to a `@kuraModules`-tagged organism only when **all** of these hold:

1. ≥ 2 modules will reuse the exact composition, OR the composition encodes a canonical visual contract that re-deriving in the app would risk drifting from.
2. The composition is non-trivial — it bundles ≥ 3 kit primitives with non-obvious slot wiring.
3. The composition is stable — its shape is not still being designed.

**App data-wiring shells are the right factoring, not an anti-pattern.** When the only thing the app adds to a kit organism is reading Zustand stores and passing props inline (e.g., `apps/.../shell/TopBar.tsx` wrapping `<AppHeader>`), that wrapper LIVES IN THE APP. Don't promote it to the kit; don't write a Storybook story for it (the kit organism already has its own story). The kit's job is to ship the visual contract; the app's job is to wire state into it.

**Pure module-specific business UI** — receptionist's step pages, sub-flows, eligibility result cards, payment method tabs, test rows, bundle rows — **stays in the consuming app**. The kit may ship layout presets (e.g., `<WizardStepBody>`) that those step pages USE, but the step pages themselves are app-owned. *(`OrderCart` was previously listed in this exclusion; promoted to a `@kuraModules receptionist`-tagged kit organism in v0.4.0 because it encodes a canonical visual contract — criterion #1's OR clause in the promotion rule above.)*

**No wrapper stories.** Do not create Storybook stories that wrap a kit organism in a module-style composition just to demonstrate "how the app uses it". The kit organism's own story is sufficient documentation. Per-step or full-screen stories that combine multiple kit organisms into realistic scenarios ARE acceptable — they document the canonical visual contract — but they should not introduce inline `Receptionist*` wrapper functions that re-implement what the app's data-wiring shell already does.

### Module tagging

Components in the kit may declare which clinic modules they serve via a JSDoc tag on the exported component:

```ts
/**
 * One-line summary.
 *
 * @kuraModules receptionist, phlebo
 */
export function ContextPickerPopover() { ... }
```

The same fact appears on the component's Storybook story:

```ts
export default {
  title: 'Molecules/ContextPickerPopover',
  component: ContextPickerPopover,
  tags: ['autodocs', 'module:receptionist', 'module:phlebo'],
}
```

Tag rule:

- 0 modules tagged (no `@kuraModules`) → universal → layer barrel only.
- 1–2 modules tagged → those module barrels + layer barrel.
- 3 modules tagged → equivalent to universal (the tag is documentation only).

Module barrels at `src/components/modules/{receptionist,phlebo,patient}.ts` are hand-curated; they re-export the components tagged for that module. Adding a new tagged component requires both the JSDoc tag AND the explicit re-export in the relevant module barrel — drift is caught by `API_SURFACE.md` review during `/kura-design:deliver`.

### Imports

Use **relative paths** (`../../lib/cn.ts`) inside `src/`, not the `@/` alias. The recent refactor (`3ff1454 refactor(ui-kit): replace @/ alias with relative imports for consumer compat`) was deliberate — the alias breaks consumer builds when bun copies the kit's nested `node_modules`. The `@/` alias is allowed in `stories/` (Storybook resolves it via the alias in `.storybook/main.ts`).

### Tokens & theme — handle with care

`src/styles/tokens.css` and `src/styles/theme.css` are the brand contract. Components must consume them via Tailwind utilities or `var(--token-name)` — never hard-code colors, radii, spacing, or shadows. Editing these files is an architectural change: requires designer sign-off, gets a `MIGRATION.md` entry, bumps a version.

### Storybook is the spec

Every component must ship with a `.stories.tsx` covering: `Default`, `Playground` (with controls), all variants/tones/sizes, and at least one realistic scenario. Stories must look correct under all toolbar dimensions:

- `data-theme`: `light` / `dark`
- `data-density`: `compact` / `cozy` / `comfortable`
- `data-module`: `receptionist` / `phlebo` / `patient`

If a component breaks under any combination, the component is wrong (not the toolbar).

### Storybook addon stack

The kit's Storybook runs four non-default addons that affect the design-review experience:

- `@chromatic-com/storybook` — visual regression. Snapshots fire from `/kura-design:deliver` against `CHROMATIC_PROJECT_TOKEN`; designer approves at the printed URL before tag/push. Token unset = step is skipped silently.
- `@storybook/addon-designs` — optional Figma overlay per story (`parameters.design = { type: 'figma', url }`). Use when the component has a Figma source. Skip silently when not. Wired by the developer based on the intake plan's "Figma reference" section.
- `storybook-addon-pseudo-states` — toolbar toggles for `:hover`, `:focus`, `:focus-visible`, `:active`, `:disabled`. Stories don't author state variants for these — toggle them at review time.
- `@geometricpanda/storybook-addon-badges` — driven by story tags. The existing `module:receptionist | module:phlebo | module:patient` tags render as colored chips in the sidebar. Lifecycle tags (`beta`, `deprecated`) are also supported and configured in `.storybook/preview.tsx`.

These are local-side only — they do not affect the public `package.json#exports`.

## Stories ARE the consumer spec

The Storybook stories under `stories/receptionist/wizard/steps/` (and future `stories/<module>/...` trees) are **the canonical visual contract**. Consumer apps render the same JSX structure node-for-node. When a consumer app and a story drift, the story wins — fix the app, OR if the story is wrong, fix the story first and treat it as a design change (`/kura-design:intake`).

Implications:

- **No bespoke card chrome in consumer apps.** A consumer app must never render `<section className="rounded-[var(--radius-lg)] border border-border bg-card p-4">` or any variant of the same. That chrome is a kit responsibility — every titled section card uses `<SectionCard>`, every header+title+icon-badge+data display uses `<SummaryCard>`, every phase heading uses `<WorkflowHeading>`. If a recurring pattern in the stories has no kit equivalent, **add one to the kit** before consuming.
- **Custom `className` overrides on kit components are restricted to story-faithful ones.** If the story renders `<SectionCard padding="lg" tone="success">`, the app does the same. If the story has no `className` overrides on a kit component, the app must not add any. Layout-only utilities (`grid grid-cols-N`, `space-y-N`, `gap-X` on flex containers) are acceptable when the story uses them.
- **App components are data-wiring shells.** App-side files like `apps/receptionist/src/cart/OrderCart.tsx` or `apps/.../shell/TopBar.tsx` exist to read Zustand stores / react-query mutations and pass props to kit organisms. They expose no visual chrome of their own — composing kit pieces is the entire job. This is the right factoring.
- **Tone-tinted callouts use the kit, not raw CSS.** A "payment received" success panel is `<SummaryCard tone="success">`. A "checking eligibility…" brand-tinted loader is `<SectionCard tone="brand">`. The `tone` prop on `SectionCard` / `SummaryCard` (`default | info | success | warning | danger | brand`) covers all the receptionist sub-flow patterns.
- **Kit additions to close consumer gaps go through `/kura-design:intake`.** If you spot a story-inline pattern repeating across multiple consumer surfaces (the dashed booking-code panel, the workflow-heading triple, etc.), file an intake to promote it. Don't ship the pattern inline in the consumer app indefinitely.

When an app refactor reveals a missing kit slot/prop, the loop is: pause the app work → `/kura-design:intake` for the kit change → execute the kit plan → resume the app refactor using the new surface. Do not work around a missing kit prop with a custom wrapper.

## Tokens are non-negotiable (every value in source must resolve to a token)

The kit ships **288 design tokens** in `src/styles/tokens.css` — colors, surfaces, borders, radii, shadows, spacing, type, motion. Every CSS value in component source MUST resolve to one of them. No hex colors. No `rgba(…)` literals. No arbitrary radii / shadows / line-heights / font-sizes when a token covers the value.

### What "token-first" means in practice

| ❌ Forbidden | ✅ Correct |
|---|---|
| `border-[#a7f3d0]` | `border-[var(--success-200)]` (or extend the success ramp if a step is missing) |
| `bg-[rgba(15,23,42,0.04)]` | `var(--shadow-xs)` token (or extend the shadow scale) |
| `shadow-[0_1px_2px_rgba(15,23,42,0.04)]` | `shadow-[var(--shadow-xs)]` |
| `rounded-[8px]` | `rounded-[var(--radius)]` (default 8px in standard density) |
| `rounded-[4px]` | `rounded-[var(--radius-xs)]` |
| `rounded-[12px]` | `rounded-[var(--radius-lg)]` |
| `rounded-[10px]` (fixed px) | `rounded-[var(--radius-lg)]` (density-aware: 12 / 10 / 14 across standard/compact/comfortable) |
| `text-[#ffffff]` | `text-[var(--ink-0)]` |
| `bg-card`, `text-foreground`, `border-border`, `rounded-md`, `ring-ring` | ✅ Still token-driven via the shadcn semantic-var aliases in `theme.css`. Keep using these where they fit. |

### What's still legitimate

- **Density-tuned typography** like `text-[12.5px]`, `text-[11.5px]`, `text-[10.5px]` — these are intentional compact-density choices that don't have token equivalents. Acceptable.
- **Layout utilities** — `flex`, `grid`, `gap-2`, `space-y-3`, `min-h-0`, `flex-1`, `items-center`, etc. These are structural, not visual chrome.
- **Layout-only arbitrary `[Npx]`** — fixed slot dimensions (`h-[46px]`, `w-[360px]`, `size-[18px]`, `gap-[7px]`, `min-w-[120px]`, `grid-cols-[16px_minmax(0,1fr)_auto_auto]`, responsive breakpoint micro-tuning `max-[640px]:py-[11px]`) used to express a *canonical visual contract* — a card width, a row height, an icon-cell size, a grid template — without a token. These resolve to fixed pixel rhythms that don't map to the density-aware spacing scale. Acceptable for `width / height / size / gap / grid-template / padding / margin / inset / breakpoint-modifier` properties. **Never acceptable for color, shadow, radius, type-size, or border-color** — those are visual chrome and must resolve to tokens.
- **`var(--brand-rgb)` overlays** like `bg-[rgba(var(--brand-rgb),0.035)]` — the rgb source IS a token; the opacity is a one-off tint. Acceptable when the design intent is "subtle brand wash" not covered by `--brand-50` (which has its own background it composes against).
- **Shadcn semantic vars** (`--primary`, `--ring`, `--input`, `--card`, `--accent`, …) — aliased onto Kura tokens in `theme.css`. Keep using the shadcn names where they fit; don't re-write to the underlying Kura token.

### If no token covers your value

You have three options, in order of preference:

1. **Use the closest token.** A 1-px shift on a radius or shadow is almost always invisible. Density-aware tokens (`--radius-lg`) shift WITH the user's density setting — usually the right move.
2. **Extend the scale.** If a real design need is missing (e.g. `--success-200` for the stepper done-divider), add it to `tokens.css` in the right ramp. The token must compose into the existing scale (consistent stop spacing) and ship with light + dark resolution. Foundations changes go through `/kura-design:intake` (classification (c)).
3. **Last resort: document why no token applies.** A JSDoc note on the component explaining the one-off design intent (e.g. "non-standard 7px radius is the canonical stepper-rail visual"). Reserved for design-locked exceptions, not casual workarounds.

The audit rule for every new component: grep your own diff for `\[#`, `rgba(`, `\[\d+px\]`, `\[var\(--shadow-` — flag any match for review.

## Brand non-negotiables (enforceable, not aspirational)

These come from the Kura design system. Every component review must check them:

- **One brand blue:** `#268CFF` (`--brand-500`). The logo navy `#10069F` and cyan `#60CDFF` are **logo-only** at the `-500` step; ramp neighbors are for emphasis chrome only.
- **AI purple is reserved.** `--purple-*` only appears on AI surfaces (`AISidePanel`, `AIChip`, `WhyCard`, future AI components). Never use it for non-AI chrome.
- **Status by color alone is forbidden.** Every status indicator pairs a color with both an icon and a label.
- **Body text never below 11 px.** Compact density baseline is 12.5 px. Non-body chrome — uppercase category badges, number-in-pill markers, count-badge digits, sub-359-px viewport meta-pill fallbacks — may drop to 9.5–10.5 px when the role is decorative (not readable prose). Every sub-11-px use must carry a JSDoc note explaining the chrome-not-body intent.
- **Lucide / Iconify line icons only.** Default stroke 1.5; graduated heavier strokes (`1.75`, `2`, `2.2`, `2.5`) are permitted for icons ≤ 14 px to retain legibility against tabular content. Pass `strokeWidth={null}` for filled / coloured Iconify collections that own their own stroke (e.g. `tabler:circle-filled`, `circle-flags:*`). Sizes locked to `12 / 14 / 16 / 20 / 24 / 28`.
- **No emoji in product UI. No photographs. No gradients in chrome.**

## The strict AI design workflow

This package uses a **two-agent workflow** enforced by slash commands and Claude Code sub-agent definitions:

- **`expert-designer`** (`.claude/agents/expert-designer.md`) — the UI/UX intake agent. Drives Q&A, brainstorms when scope is unclear, applies design-quality lenses, and writes plans. Plan-only; never touches code, tokens, or package metadata. Activated by `/kura-design:intake`.
- **`developer`** (`.claude/agents/developer.md`) — the frontend execution + delivery agent. Two phases. Phase 1 implements an approved plan (components, Storybook stories, launches Storybook for review). Phase 2 (`/kura-design:deliver`) verifies, updates docs, bumps version, commits, tags, and pushes.

### For the designer

Two commands, in order:

1. **`/kura-design:intake`** — start any design change here. The command interrogates intent (new component vs. update; atom/molecule/organism; shadcn-wrap vs. custom; affected variants/states; breaking?), invokes `superpowers:brainstorming` if scope is unclear, uses `frontend-design:frontend-design` for design quality, then writes a plan via `superpowers:writing-plans` to `.claude/plans/<YYYY-MM-DD>-<kebab-slug>.md`. The command **hard-stops** for designer approval before any code is written.
2. **`/kura-design:deliver`** — run after the developer has finished the build and the designer has verified the result in Storybook. Verifies the work (typecheck, lint, build-storybook), updates `API_SURFACE.md`, appends a `CHANGELOGS.md` "Unreleased" entry (creates on first use), records breaking changes in `MIGRATION.md` (creates on first use), bumps `package.json` version, syncs `package.json#exports` if a new layer/subpath was added, creates a Conventional-Commits commit, **creates an annotated `v<version>` tag, and pushes commit + tag together** (`git push --follow-tags`).

### For the developer (Phase 1 — Execution)

After the designer approves the plan, run `superpowers:executing-plans` against `.claude/plans/<plan>.md` while operating as the `developer` agent. The plan covers component implementation, Storybook stories, and any token/theme touches. Launch Storybook in the background (`bun run storybook`) and tell the designer the URL so they can verify before delivery.

### Plans

- Active plans live in `.claude/plans/` (gitignored — local scratch).
- Historical/architectural plans live in `docs/plans/` (committed — the seed plan `2026-05-08-ui-kit-components-design.md` is the original kit architecture).

### Don't

- Don't bypass `/kura-design:intake` for new components or behavior changes. Direct edits without a plan are a workflow violation.
- Don't run `/kura-design:deliver` while typecheck/lint/build-storybook is failing. Fix first, deliver second.
- Don't push commits or create tags outside `/kura-design:deliver`. That command owns push/tag.
- Don't force-push. Don't overwrite or move an existing tag.
- Don't auto-bump version outside `/kura-design:deliver`.

## Versioning rules (for `/kura-design:deliver`)

Pre-1.0 (`0.x`):

- **Minor (`0.x.0 → 0.(x+1).0`)** — new component, new exported type, new prop or variant, **or** a breaking prop/API change (call out the break in `MIGRATION.md`).
- **Patch (`0.x.y → 0.x.(y+1)`)** — bug fix, internal refactor, story-only changes, doc/comment updates.

Post-1.0:

- **Major** — any breaking change to the public surface.
- **Minor** — additive only.
- **Patch** — fixes/internals.

If unsure, the deliver command should explain the chosen bump in the commit body.

## Commit format

Conventional Commits. The established scope is `(ui-kit)`:

```
feat(ui-kit): add CountdownTimer molecule
fix(ui-kit): wire Tailwind v4 + add separate Density/Module toolbars
chore(ui-kit): add Dockerfile to deploy Storybook on nginx
refactor(ui-kit): replace @/ alias with relative imports for consumer compat
```

Breaking changes use `!` and a `BREAKING CHANGE:` footer.

## Public API contract

`API_SURFACE.md` lists every public path. When you add or remove an export, **update `API_SURFACE.md` in the same change** — `/kura-design:deliver` enforces this. Anything not listed is private.
