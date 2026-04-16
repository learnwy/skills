# Intelligent Rule Manager Workspace

This workspace is organized into three sibling products:

```text
apps/intelligent-rule-manager/
├── docs/        # workspace spec, design, and tasks
├── client/      # Tauri + React desktop app
├── cli/         # Rust workspace for rule-core and rule-cli
└── extension/   # VS Code-compatible extension
```

## RPDRI

### Research

- The Tauri app and the VS Code extension are separate products with different packaging rules.
- The Rust CLI should sit beside both products so it can be shared instead of being hidden inside `client/`.
- The shared rules should live outside the repo at `~/.learnwy/ai/rules` so all three products use the same library.

### Plan

- Move the desktop app into `client/`.
- Move the Rust workspace into `cli/`.
- Move the VS Code-compatible package into `extension/`.
- Update manifests and commands to target the sibling directories.
- Move the planning docs to `docs/` at the workspace root.
- Align the shared storage root and tag taxonomy across the workspace.

### Do

- Reorganized the folders into `client/`, `cli/`, and `extension/`.
- Updated the Tauri app to depend on the shared Rust core from `cli/`.
- Updated the extension commands to operate on sibling `client/` and `cli/` folders.
- Moved the active planning docs to `apps/intelligent-rule-manager/docs/`.
- Changed the default shared rules root to `~/.learnwy/ai/rules`.

### Review

- Build the client from `client/`.
- Run the Rust CLI from `cli/`.
- Compile the extension from `extension/`.
- Verify nested rules are visible through the shared storage root.

### Improve

- Add compose/export commands to the CLI and surface them in both the client and the extension.
- Add richer tag taxonomy visibility in the client and extension.
- Add release workflows for the client and the extension separately.
