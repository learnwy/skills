const milestones = [
  "Port rule parsing and composition into rule-core",
  "Expose workspace summary and rule listing over Tauri commands",
  "Add rule editor, preview, and compose studio",
];

const panels = [
  {
    title: "Library",
    body: "Groups, tags, targets, and search will live here so the rule store feels navigable instead of opaque.",
  },
  {
    title: "Workspace",
    body: "This main area will become the rule list, composition studio, and export preview surface.",
  },
  {
    title: "Inspector",
    body: "Metadata editing, Markdown preview, and explainers for scoring or assembly mode will live here.",
  },
];

export default function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Tauri + React + Rust workspace</p>
        <h1>Intelligent Rule Manager</h1>
        <p className="lede">
          A cross-platform desktop app for browsing, editing, composing, and
          exporting Markdown rule libraries backed by a shared Rust core and
          CLI.
        </p>
      </header>

      <section className="status-grid" aria-label="Current foundation">
        <article className="status-card accent">
          <h2>Current scope</h2>
          <p>
            The workspace is scaffolded. Next we should implement `rule-core`
            first, then wire live Tauri commands into the UI.
          </p>
        </article>

        <article className="status-card">
          <h2>Storage model</h2>
          <p>
            Rules stay file-first under `AGENTS_HOME/rules` or `~/.agents/rules`
            so the app remains compatible with existing workflows.
          </p>
        </article>

        <article className="status-card">
          <h2>Shared runtime</h2>
          <p>
            The desktop shell and CLI will both depend on `rule-core` to avoid
            domain drift.
          </p>
        </article>
      </section>

      <section className="workspace-frame" aria-label="Planned app layout">
        {panels.map((panel) => (
          <article className="panel" key={panel.title}>
            <h2>{panel.title}</h2>
            <p>{panel.body}</p>
          </article>
        ))}
      </section>

      <section className="milestones" aria-label="Implementation milestones">
        <h2>Next milestones</h2>
        <ol>
          {milestones.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}

