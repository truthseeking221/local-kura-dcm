# AGENTS.md

Codex entry point for `@kura/ui-kit`. Mirrors the role of `CLAUDE.md` — Codex reads this; Claude Code reads `CLAUDE.md`. `CLAUDE.md` stays the source of truth for project rules.

## Project rules

**Read `CLAUDE.md` in this directory first.** It defines:

- That the kit is source-only (no build), consumed by apps via `file:../../ui-kit`.
- Atomic-design layer purity (no upward imports; ui → atoms → molecules → organisms).
- Module tagging via `@kuraModules` JSDoc + Storybook `module:*` tags.
- Token non-negotiables (every CSS value resolves to a token in `src/styles/tokens.css`).
- Brand non-negotiables (one brand blue `#268CFF`, AI purple is reserved, status never by color alone, body text never below 11px, Lucide line icons only).
- Storybook is the spec — stories under `stories/receptionist/wizard/steps/` are the canonical visual contract for consumer apps.
- The strict two-agent design workflow (`expert-designer` → designer approval → `developer` → `/kura-design:deliver`).
- Versioning, commit format, and the public API contract (`API_SURFACE.md`).

Workspace-level rules live in `../CLAUDE.md` and `../AGENTS.md`. Don't restate them here.

## Slash commands

The kit's slash-command surface is defined as plain markdown files. When the user invokes a `/kura-design:*` command, **read the matching file and follow it step-by-step**.

| Command | File |
|---|---|
| `/kura-design:intake` | `.claude/commands/kura-design/intake.md` |
| `/kura-design:deliver` | `.claude/commands/kura-design/deliver.md` |
| `/kura-design:audit-receptionist` | `.claude/commands/kura-design/audit-receptionist.md` |

## Agents

Command files reference agents by name. Each agent has a charter at `.claude/agents/<name>.md` — **read the matching file when you adopt that agent's role**. The charter defines tool boundaries, hard rules, and the output contract.

| Agent | Charter | Role |
|---|---|---|
| `expert-designer` | `.claude/agents/expert-designer.md` | UI/UX intake. Drives Q&A, brainstorms when scope is unclear, applies design-quality lenses, writes plans. **Plan-only — never touches code, tokens, or `package.json`.** Activated by `/kura-design:intake`. |
| `developer` | `.claude/agents/developer.md` | Frontend execution + delivery. Two phases: (1) implements an approved plan (components, Storybook stories, launches Storybook for designer review); (2) `/kura-design:deliver` verifies, updates docs, bumps version, commits, tags, pushes. |

## Skills

Assumed to be installed in your Codex environment. Command files invoke skills by their canonical name (e.g. `superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:executing-plans`, `superpowers:verification-before-completion`, `frontend-design:frontend-design`). Invoke them via your platform's skill mechanism when a command tells you to.

If a referenced skill is not available in your Codex setup, fall back to the spirit of the instruction (e.g. "use `superpowers:brainstorming`" → conduct a structured back-and-forth to clarify intent before writing the plan) and note the fallback explicitly.

## Plans

- **Active plans** — `.claude/plans/` (gitignored, local scratch).
- **Historical / architectural plans** — `docs/plans/` (committed; the seed `2026-05-08-ui-kit-components-design.md` is the original kit architecture).

## Hard rules (workflow-enforced, repeated here so they're impossible to miss)

- Don't bypass `/kura-design:intake` for new components or behavior changes. Direct edits without a plan are a workflow violation.
- Don't run `/kura-design:deliver` while typecheck / lint / `build-storybook` is failing. Fix first, deliver second.
- Don't push commits or create tags outside `/kura-design:deliver`. That command owns push/tag.
- Don't force-push. Don't overwrite or move an existing tag.
- Don't auto-bump version outside `/kura-design:deliver`.

## Per-package commands

Package manager is **bun** (Node 20+).

```bash
bun install
bun run storybook           # dev: Storybook on :6006
bun run build-storybook     # static build → storybook-static/
bun run typecheck           # tsc --noEmit
bun run lint                # eslint .
bun run ui:add <name>       # shadcn add <primitive>
```

No test runner, no library build step. Verification = `typecheck` + `lint` + `build-storybook`.
