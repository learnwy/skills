import { startTransition, useEffect, useState } from "react";
import { getWorkspaceSnapshot, type WorkspaceSummary } from "./lib/tauri";

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
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const [runtimeMode, setRuntimeMode] = useState<"tauri" | "browser">("browser");
  const [runtimeLayer, setRuntimeLayer] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadWorkspaceSnapshot() {
      try {
        const snapshot = await getWorkspaceSnapshot();
        if (!isActive) {
          return;
        }

        startTransition(() => {
          setRuntimeMode(snapshot.mode);
          setRuntimeLayer(snapshot.healthcheck.layer);
          setSummary(snapshot.summary);
          setError(null);
        });
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        startTransition(() => {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unknown workspace loading error",
          );
        });
      }
    }

    void loadWorkspaceSnapshot();

    return () => {
      isActive = false;
    };
  }, []);

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
          <h2>Runtime</h2>
          <p>
            Running in <strong>{runtimeMode}</strong> mode with data from{" "}
            <strong>{runtimeLayer}</strong>.
          </p>
        </article>

        <article className="status-card">
          <h2>Storage model</h2>
          <p>
            {summary
              ? summary.storage_root
              : "Loading storage root from rule-core workspace summary..."}
          </p>
        </article>

        <article className="status-card">
          <h2>Exports</h2>
          <p>
            {summary
              ? summary.exports_dir
              : "Loading export directory from rule-core workspace summary..."}
          </p>
        </article>
      </section>

      <section className="facts-grid" aria-label="Workspace capabilities">
        <article className="fact-card">
          <h2>Supported artifacts</h2>
          <ul>
            {(summary?.supported_artifacts ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="fact-card">
          <h2>Supported targets</h2>
          <ul>
            {(summary?.supported_targets ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="fact-card">
          <h2>Integration state</h2>
          <p>
            The frontend now requests live workspace data through a typed Tauri
            wrapper instead of relying only on static content.
          </p>
          {error ? <p className="error-text">{error}</p> : null}
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
