import { startTransition, useEffect, useState } from "react";
import {
  getWorkspaceSnapshot,
  type RuleListItem,
  type WorkspaceSummary,
} from "./lib/tauri";

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
  const [rules, setRules] = useState<RuleListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [runtimeMode, setRuntimeMode] = useState<"tauri" | "browser">("browser");
  const [runtimeLayer, setRuntimeLayer] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);
  const filteredRules = rules.filter((rule) => {
    const haystack = [
      rule.id,
      rule.title,
      rule.summary,
      rule.groups.join(" "),
      rule.tags.join(" "),
      rule.targets.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(searchQuery.trim().toLowerCase());
  });

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
          setRules(snapshot.rules);
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
          <h2>Rule count</h2>
          <p>
            {summary
              ? `${rules.length} discovered rule${rules.length === 1 ? "" : "s"}`
              : "Loading discovered rules from rule-core..."}
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
        <article className="panel">
          <h2>{panels[0]?.title}</h2>
          <p>{panels[0]?.body}</p>

          <div className="rule-list">
            <label className="search-box">
              <span>Search rules</span>
              <input
                aria-label="Search rules"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title, id, tag, or group"
                type="search"
                value={searchQuery}
              />
            </label>

            {filteredRules.length > 0 ? (
              filteredRules.map((rule) => (
                <article className="rule-card" key={rule.id}>
                  <div className="rule-card-header">
                    <h3>{rule.title}</h3>
                    <span>{rule.id}</span>
                  </div>
                  <p>{rule.summary || "No summary yet."}</p>
                  <div className="token-row">
                    {rule.groups.map((group) => (
                      <span className="token" key={`${rule.id}-group-${group}`}>
                        {group}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            ) : rules.length > 0 ? (
              <div className="empty-state">
                <h3>No matching rules</h3>
                <p>Try a broader search term or clear the current filter.</p>
              </div>
            ) : (
              <div className="empty-state">
                <h3>No rules discovered yet</h3>
                <p>
                  Create Markdown rule files in the resolved rule storage root to
                  populate this list.
                </p>
              </div>
            )}
          </div>
        </article>

        <article className="panel">
          <h2>{panels[1]?.title}</h2>
          <p>{panels[1]?.body}</p>
          <div className="detail-block">
            <h3>Resolved exports directory</h3>
            <p>
              {summary
                ? summary.exports_dir
                : "Loading export directory from rule-core workspace summary..."}
            </p>
          </div>
        </article>

        <article className="panel">
          <h2>{panels[2]?.title}</h2>
          <p>{panels[2]?.body}</p>
          <div className="detail-block">
            <h3>Selected targets in this workspace</h3>
            <div className="token-row">
              {(summary?.supported_targets ?? []).map((target) => (
                <span className="token" key={target}>
                  {target}
                </span>
              ))}
            </div>
          </div>
        </article>
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
