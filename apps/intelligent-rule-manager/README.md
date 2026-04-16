# Intelligent Rule Manager for VS Code

This package is a VS Code-compatible extension workspace that sits beside the desktop client.

## Layout

```text
apps/intelligent-rule-manager/
├── client/      # Tauri + React + Rust desktop app
├── src/         # VS Code extension source
├── package.json # VS Code extension manifest
└── README.md
```

## Commands

- `Intelligent Rule Manager: Open Client Folder`
- `Intelligent Rule Manager: Open Client Spec`
- `Intelligent Rule Manager: Run Workspace Summary`
- `Intelligent Rule Manager: Open Rules Root`

These commands are built on the standard VS Code extension API, so they are intended to work in VS Code and other IDEs built on the same extension model.

## RPDRI

### Research

- Confirmed the desktop app had grown into its own self-contained Tauri client.
- Confirmed a VS Code extension should live at the package root with its own manifest and compiled `main` entrypoint.

### Plan

- Move the existing desktop application into `client/`.
- Turn `apps/intelligent-rule-manager/` into the extension package root.
- Use the extension to open and operate the client-oriented workspace.

### Do

- Moved the existing Tauri app into `client/`.
- Added a VS Code-compatible extension package with core commands.
- Added extension docs and packaging ignores.

### Review

- Verify the client still builds from `client/`.
- Verify the extension compiles from the package root.
- Verify command registration and command palette visibility.

### Improve

- Add compose/export commands from the extension.
- Add richer IDE integration for rule creation and quick actions.
- Add packaged release workflows for both the client and the extension.

