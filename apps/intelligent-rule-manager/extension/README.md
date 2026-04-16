# Intelligent Rule Manager Extension

This package is a VS Code-compatible extension that sits beside the desktop client and the shared Rust CLI workspace.

## Layout

```text
apps/intelligent-rule-manager/
├── client/      # Tauri + React desktop app
├── cli/         # shared Rust CLI workspace
├── extension/   # this VS Code-compatible extension
└── README.md    # workspace overview
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

- Pointed the extension at sibling `client/` and `cli/` folders.
- Added commands that open the client, inspect the client spec, and run the Rust CLI.
- Kept the extension package isolated so it can be compiled independently.

### Review

- Verify the client still builds from `client/`.
- Verify the extension compiles from the package root.
- Verify command registration and command palette visibility.

### Improve

- Add compose/export commands from the extension.
- Add richer IDE integration for rule creation and quick actions.
- Add packaged release workflows for both the client and the extension.
