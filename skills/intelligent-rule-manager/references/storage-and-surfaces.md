# Storage And Surfaces

The intelligent rule manager is one shared system with one shared rule library.

## Canonical storage

- Rules live in `~/.learnwy/ai/rules`.
- Export outputs are written under `~/.learnwy/ai/rules/exports`.
- Source rules stay separate from generated exports. Generated exports should not be treated as source rules.

## Peer surfaces

The shared rule system is available through four peer surfaces:

1. The `intelligent-rule-manager` skill
2. The Rust CLI in `apps/intelligent-rule-manager/cli`
3. The desktop client in `apps/intelligent-rule-manager/client`
4. The VS Code-compatible extension in `apps/intelligent-rule-manager/extension`

None of these surfaces is the source of truth by itself. They all operate on the same Markdown rule library.

## Shared expectations

- A rule created in one surface should be visible in the others.
- Tags, groups, and targets should mean the same thing in every surface.
- Composition behavior should stay consistent across skill, CLI, client, and extension.
- i18n should not change rule semantics. It only changes the presentation layer.

## Tag hierarchy

Rule matching may resolve parent-child relationships between tags.

Examples:

- A rule stored under a `web/typescript/` path can still be discoverable when the user filters by `web`.
- A lint rule may be discoverable from a broader `quality` or `lint` selection depending on the resolved tag set.

When composing exports, always sanity-check the matched rules if the user selected a broad tag.
