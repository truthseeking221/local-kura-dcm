---
description: Designer audit of apps/receptionist against the @kura/ui-kit story spec — surface-by-surface comparison, flags every drift (inline chrome / className overrides / wrapper anti-patterns / token violations / structural divergence / tone misuse), then writes a fix plan and HARD-STOPS for designer approval before any code is touched.
---

**Operate as the `expert-designer` agent. Read its full charter at `.claude/agents/expert-designer.md` before you do anything else.** That file defines your tool boundaries, hard rules, and output contract. This command is your step-by-step script; the agent file is your charter — both apply.

You are running a **kit-alignment audit** of `apps/receptionist` against the canonical visual contracts in `ui-kit/stories/**`. Per CLAUDE.md § "Stories ARE the consumer spec": when the app and a story disagree, the story wins — the app gets fixed. You produce a single audit-plan file. You do **not** edit any source. You stop after writing the plan and request review.

## Operating principles

- **Stories are the spec.** Every receptionist surface (wizard step, sub-flow, panel, shell) must render the same JSX structure node-for-node as its canonical story. Diverge → audit flag.
- **Read across two packages, write nothing.** `ui-kit/` and `apps/receptionist/` are independent git repos under the same workspace root. You read both. You modify neither in this turn.
- **No clarifying questions for ambiguous app code.** Unlike intake, this audit is mechanical — the rule for each drift type is fixed (see § Drift taxonomy). If something is genuinely ambiguous (e.g., a kit primitive doesn't cover an app pattern that exists), flag it for `/kura-design:intake`, do not infer.
- **One artifact, one stop.** The audit-plan file is the only output. After writing, stop for designer approval.

## Workflow

### 1. Inventory the surface map

Map every receptionist app surface to its canonical story:

| Surface | App path | Story path |
|---|---|---|
| Top-level shell | `apps/receptionist/src/shell/**` | `ui-kit/stories/receptionist/Shell*.stories.tsx`, `ui-kit/stories/organisms/AppHeader.stories.tsx`, `ui-kit/stories/organisms/AppSidebar.stories.tsx`, `ui-kit/stories/organisms/CommandPalette.stories.tsx` |
| Wizard frame | `apps/receptionist/src/wizard/WizardShell*.tsx` (or similar) | `ui-kit/stories/receptionist/wizard/WizardLayout.stories.tsx`, `ui-kit/stories/receptionist/wizard/WizardStepFooter.stories.tsx`, `ui-kit/stories/organisms/Stepper.stories.tsx` |
| Step 1 — Identity | `apps/receptionist/src/wizard/steps/01-identity/**` | `ui-kit/stories/receptionist/wizard/steps/Step1Identity.stories.tsx` |
| Step 2 — Patient details | `apps/receptionist/src/wizard/steps/02-patient/**` | `ui-kit/stories/receptionist/wizard/steps/Step2Patient.stories.tsx` |
| Step 3 — Insurance | `apps/receptionist/src/wizard/steps/03-insurance/**` | (if present) `ui-kit/stories/receptionist/wizard/steps/Step3Insurance.stories.tsx` |
| Step 4 — Orders | `apps/receptionist/src/wizard/steps/04-orders/**` (or wherever the orders step lives) | `ui-kit/stories/receptionist/wizard/steps/Step4Orders.stories.tsx` |
| Step 5 — Pre/Post-consult | `apps/receptionist/src/wizard/steps/05-*/**` | `ui-kit/stories/receptionist/wizard/steps/Step5PrePostConsult.stories.tsx` |
| Order cart rail | `apps/receptionist/src/cart/OrderCart*.tsx` (the data-wiring shell) | `ui-kit/stories/receptionist/OrderCart.stories.tsx`, `ui-kit/stories/organisms/OrderCart.stories.tsx` |
| Modals | `apps/receptionist/src/**/*Modal*.tsx` (any dialog/sheet usage) | `ui-kit/stories/receptionist/Modals.stories.tsx` |

Build this inventory dynamically — `Glob` `apps/receptionist/src/**/*.tsx` and `ui-kit/stories/**/*.stories.tsx` to discover the real paths. The table above is the expected shape; do not hardcode it if the file tree has drifted.

For each row you find, note any **app paths with no canonical story** — those are review-flag in their own right (means the app shipped a surface the kit doesn't document; should either get a story or a `/kura-design:intake` to promote the missing primitive).

### 2. For each (story, app) pair — extract the canonical JSX

For each story file in the inventory:
- Read the story's `render` body (the `Default` story plus any complete-surface story like `FullStep` / `WithBundles` / `Loaded`).
- Extract the JSX **structure** — the kit primitives used, the props passed to them, and any `className` overrides on those kit primitives.
- Record: tag-name, props, child structure (depth ~3 is enough). Skip layout-only utilities (`grid grid-cols-N`, `space-y-N`, `gap-X`, `flex`) — those are legitimate when the story uses them.

For each app file paired to a story:
- Read the app's render body for the same surface.
- Extract the same structural snapshot.

Both extractions are read-only. Do not modify anything.

### 3. Compare and categorize drift

For every (story-element, app-element) pair where the app diverges, classify the drift under one of the six categories below. Severity is fixed per category (don't downgrade):

| Cat | Name | Definition | Severity | Fix path |
|---|---|---|---|---|
| D1 | **Inline chrome violation** | App renders raw `<section>` / `<div>` / `<article>` with kit-shaped chrome (rounded + border + bg-card + padding) instead of the kit primitive the story uses (`<SectionCard>`, `<SummaryCard>`, `<Callout>`, `<WorkflowHeading>`, `<WizardStepBody>`, …). | **P0** | Replace the inline chrome with the kit primitive. Match the story's props (padding / tone / title) exactly. |
| D2 | **Custom className override** | App passes a `className` to a kit component that the story does NOT pass. Layout-only utilities (`grid`, `space-y-N`, `gap-X` on flex/grid containers) are exempt only if the story uses identical ones. | **P0** | Remove the override. If the override encodes a real design need not exposed by the kit, file a `/kura-design:intake` instead. |
| D3 | **Wrapper anti-pattern** | App creates a local wrapper component that re-implements (visually) a kit primitive — e.g., `LocalSectionCard.tsx` that renders the same chrome as `<SectionCard>`. (Data-wiring shells like `apps/.../shell/TopBar.tsx` wrapping `<AppHeader>` are EXEMPT — those are correct factoring per CLAUDE.md.) | **P0** | Delete the wrapper. Update call sites to use the kit primitive directly. |
| D4 | **Token violation** | App source contains hex / `rgba(` / arbitrary-px chrome that isn't covered by the legitimate exemptions in CLAUDE.md (density typography .5px, `bg-[rgba(var(--brand-rgb),0.NN)]` overlays, structural sizing). Same audit as the kit-side token-first scan. | **P1** | Replace with the closest token / `k-*` utility / `var(--token)`. If no token covers it, `/kura-design:intake` to extend the foundation. |
| D5 | **Structural divergence** | App's JSX structure differs from the story's — different kit primitives, different nesting, different slot wiring — for the same surface. Not just classNames (D2) but the actual element tree. | **P1** | Refactor app to match story's structure node-for-node. |
| D6 | **Tone-tint via raw CSS** | App applies status-tinted backgrounds (`bg-[var(--success-50)]`, `bg-[var(--warn-50)]`, etc.) on a wrapper instead of using the `tone` prop on `<SectionCard>` / `<SummaryCard>` / `<Callout>`. | **P1** | Replace with `tone="success" \| "warning" \| "danger" \| "info" \| "brand"` on the wrapping kit primitive. |

Additional note: **app paths that have no canonical story** at all — record under category **D0 — Undocumented surface**, severity **review-flag**. These don't get a fix plan entry (no story to align to) but get listed for the designer's awareness.

### 4. Write the audit-plan file

Output path: `.claude/plans/<YYYY-MM-DD>-receptionist-kit-alignment.md`

(If multiple audits run in one day, suffix with `-N` to disambiguate. Create `.claude/plans/` if it doesn't exist; it's gitignored.)

The file must contain, in order:

#### 4.a Header

```markdown
---
date: <YYYY-MM-DD>
slug: receptionist-kit-alignment
classification: app-side alignment audit (read-only intake)
intent: Bring apps/receptionist into node-for-node alignment with the canonical ui-kit stories, eliminating inline chrome, custom className overrides, wrapper anti-patterns, token violations, structural divergence, and raw-CSS tone tints.
---

# Receptionist app — kit-alignment audit & fix plan
```

#### 4.b Surface comparison table

A table per surface with these columns:

| Surface | Story (canonical) | App (actual) | Match? |
|---|---|---|---|

`Match?` is ✅ when the structure is identical (modulo legitimate exemptions) or one of `D1` / `D2` / `D3` / `D4` / `D5` / `D6` / `D0` per the taxonomy. Use the category code so the findings section can be cross-referenced.

#### 4.c Findings section

For every drift, one entry of the form:

```markdown
### F-<NN> — <category code> — <surface name>

- **App file:** `apps/receptionist/src/.../File.tsx:<line>`
- **Story spec:** `ui-kit/stories/.../File.stories.tsx:<line>`
- **What the story shows:**
  ```tsx
  <SectionCard padding="md" title="…">…</SectionCard>
  ```
- **What the app has:**
  ```tsx
  <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
    <h3 className="…">…</h3>
    …
  </section>
  ```
- **Fix:** Replace the inline `<section>` with `<SectionCard padding="md" title="…">`. Drop the `<h3>` (the kit owns the heading).
```

Findings must be exhaustive — every drift, not just samples. If a single file has N drifts, list each one separately (do not collapse).

#### 4.d Fix plan

Standard plan structure, mirrors `/kura-design:intake` output (so the developer can execute via `superpowers:executing-plans`):

- **Files to modify** (full paths, one-line description per file)
- **Build sequence** (ordered tasks; each task is one file or one drift category; each task has a verification step)
- **Verification plan** — `cd apps/receptionist && bun run typecheck && bun run lint && bun run build` (substitute the actual receptionist commands; read `apps/receptionist/package.json#scripts` to confirm); then `bun run dev` and walk every step
- **Out-of-scope follow-ups** — drifts that need a `/kura-design:intake` to the kit first (e.g., a missing variant). List them with the recommended intake scope.
- **Versioning hint** — receptionist app version bump per its own conventions; this is NOT a kit deliver (separate repo, separate tags)

#### 4.e Hard stop

End the file with:

```markdown
---

## Approval gate

This plan is read-only until approved. To execute:
1. Review the Findings table and confirm every fix is correct.
2. For any **Out-of-scope follow-up**, run `/kura-design:intake` against `@kura/ui-kit` first and land the kit change before resuming.
3. Reply `approved` in the chat — a developer agent (or fresh Claude session under `superpowers:executing-plans`) will execute the fix plan against `apps/receptionist`.

To revise: reply with specific edits to the plan and the audit will be regenerated.
```

### 5. STOP — do not execute

Output the audit-plan path and the stop block defined in step 4.e. Do not proceed into fixes. Do not invoke `superpowers:executing-plans`. Do not run any build/test command in `apps/receptionist`. Do not edit any `.tsx` / `.ts` file in either package.

## Hard rules (zero tolerance)

- Do not edit `apps/receptionist/src/**`, `ui-kit/src/**`, or `ui-kit/stories/**` in this turn.
- Do not edit `package.json` in either package.
- Do not commit, stage, tag, or push.
- Do not invoke `superpowers:executing-plans` or `superpowers:subagent-driven-development` — the plan handoff happens via the approval gate.
- Do not run `git`, `bun`, or any build/test command. (You may run `git log -1 --oneline` to confirm baseline; nothing else.)
- Do not collapse findings into "and 12 similar drifts" — every drift listed individually so the fix plan is exhaustive.
- If a kit-side change is needed to support a fix, RECOMMEND `/kura-design:intake` in the "Out-of-scope follow-ups" section. Do not run intake from inside this audit.

## Output contract

Your final message in any successful invocation contains:

1. The audit-plan file path you wrote.
2. The literal stop-for-approval block from § 4.e.

Nothing more. The developer (or designer) picks up from there.
