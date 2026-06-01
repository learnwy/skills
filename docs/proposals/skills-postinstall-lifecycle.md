# Proposal: a post-install lifecycle hook for the `skills` CLI

**Status**: draft / feature request to the `skills` hub team
**Author**: learnwy
**Date**: 2026-06-01

## Problem

`skills add` / `skills install` does exactly one thing for a skill: it **copies
the skill's files** into `~/.agents/skills/<name>/` (global) or `.agents/skills/`
(project). That is the right job for a distribution CLI.

But some skills are not just static prompt files — they need a **machine-side
registration step** after their files land, e.g.:

- registering IDE **event hooks** (`UserPromptSubmit` / `Stop` / `SessionStart`)
  into `~/.claude/settings.json`, `~/.trae/hooks.json`, `~/.codex/hooks.json`;
- enabling a feature flag the IDE needs (e.g. Codex `[features].hooks = true`);
- creating a data directory or seeding a config file.

Today the hub has no way to run that step, so every such skill ships its own
out-of-band installer that the **user must remember to run separately**:

```bash
npx skills add learnwy/skills            # files land in ~/.agents/skills/
pnpm run install:hooks                   # <-- separate, easy to forget; only works from a repo checkout
```

For an end user who only did `skills add` (no repo checkout), there is **no
documented way** to run the registration step at all. The skill is installed
but inert.

## Proposal

Let a skill **declare** install/uninstall lifecycle commands in its manifest,
and have the hub run them (with consent) after `add`/`remove`.

### Manifest

Add an optional `lifecycle` block to the skill manifest (SKILL.md frontmatter
or a sibling `skill.json`):

```yaml
lifecycle:
  postinstall: "node scripts/cli.cjs install --scope global --target all"
  preuninstall: "node scripts/cli.cjs uninstall --scope global --target all"
```

Semantics:

- Commands run **from the installed skill root** (`~/.agents/skills/<name>/`),
  so relative paths like `scripts/cli.cjs` resolve.
- `postinstall` runs after `skills add`/`update` finishes copying files.
- `preuninstall` runs before `skills remove` deletes files (so the skill can
  cleanly un-register what it added).
- Exit non-zero ⇒ the hub reports the failure but the files stay installed.

### Safety (must-haves, given this runs arbitrary commands)

1. **Opt-in / consent**: prompt `Run <name>'s post-install step? [y/N]` unless
   `--yes` or a trusted-source allowlist applies. Never silent by default.
2. **Idempotent contract**: skills must make `postinstall` safe to re-run
   (ours already does — install is an uninstall+install sweep).
3. **No network / no sudo** expectation; document that these run with the
   user's normal permissions.
4. **Visibility**: print the exact command before running it.
5. **`--no-lifecycle` escape hatch** to skip for the cautious.

## How learnwy/skills would adopt it

We already have the registration capability factored out:

- per-skill `cli.cjs install` / `uninstall` (from `src/shared/install-entry.ts`)
  writes the IDE hook entries and toggles Codex `[features].hooks`;
- `scripts/manage-hooks.mjs` is just a repo-side orchestrator that runs the
  above for every skill carrying a `hooks.json`.

With the lifecycle hook, each hook-skill (`lwy-dispatch`, `lwy-llm-wiki`,
`lwy-prompt-optimizer`, `lwy-knowledge-consolidation`, `lwy-status`) would declare:

```yaml
lifecycle:
  postinstall: "node scripts/cli.cjs install --scope global --target all --config hooks.json"
  preuninstall: "node scripts/cli.cjs uninstall --scope global --target all --skill-id <name>"
```

Then `npx skills add learnwy/skills -y` would land the files **and** wire the
hooks in one step, for any user — and `manage-hooks.mjs` becomes a thin
fallback / dev convenience rather than a required manual step.

## Until then

We keep `scripts/manage-hooks.mjs` + `pnpm run install:hooks` (invoked by
`scripts/release.mjs` after `skills install`). This proposal does not change
that path; it only removes the manual second step **for end users** once the
hub supports it.
