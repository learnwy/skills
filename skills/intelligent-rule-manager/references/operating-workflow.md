# Operating Workflow

Use this workflow when helping someone maintain or export the shared rule library.

## 1. Inspect

Start by understanding the current library state:

- current storage root
- discovered rules
- tag and group spread
- likely export target

Good defaults:

- `workspace-summary`
- `list`
- `stats`

## 2. Focus

Pick one narrow change at a time:

- add one new rule
- strengthen one existing rule
- adjust one cluster of tags
- compose one export bundle

This keeps review and export diffs understandable.

## 3. Author

When writing or editing a rule:

- keep the body plain Markdown
- make the decision explicit
- include exceptions when needed
- use tags that help discovery and composition

If the rule is meant to be enforced, prefer direct language over soft preference wording.

## 4. Verify

After changing rules:

- inspect the specific rule again
- check how it appears in list and filter results
- verify the tag choice still makes sense with ancestor-tag matching

## 5. Compose

Compose only after the rule content itself looks correct.

- `agents-md` for one bundled instruction file
- `trae-rule` for split Trae files

Prefer reviewing the matched selection before treating the export as finished.

## 6. Iterate

If the bundle feels noisy or unclear:

- split an overloaded rule
- strengthen weak summaries
- tighten tags
- move from broad tag composition to explicit rule-id curation
