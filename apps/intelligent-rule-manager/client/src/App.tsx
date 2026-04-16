import { startTransition, useEffect, useMemo, useState } from "react";
import {
  createRule,
  getWorkspaceSnapshot,
  loadRule,
  saveRule,
  type NewRuleInput,
  type RuleDocument,
  type RuleLibraryStats,
  type RuleListItem,
  type VisualizationRecommendation,
  type WorkspaceSummary,
} from "./lib/tauri";

const milestones = [
  "Implement rule compose and export actions from the shared Rust core",
  "Add validation polish and richer markdown preview rendering",
  "Run a full Tauri smoke test against the desktop shell",
];

const panels = [
  {
    title: "Library",
    body: "Search, group, tag, and target filters make the file-backed rule store navigable.",
  },
  {
    title: "Workspace",
    body: "Create new rules, edit body content, and review a live preview before saving.",
  },
  {
    title: "Inspector",
    body: "Metadata editing stays visible while the body editor remains in the main workspace.",
  },
];

const defaultCreateForm: NewRuleInput = {
  title: "",
  summary: "",
  groups: ["shared"],
  tags: [],
  targets: ["agents-md", "trae-rule"],
};

function splitCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function joinValues(values: string[]): string {
  return values.join(", ");
}

export default function App() {
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const [rules, setRules] = useState<RuleListItem[]>([]);
  const [stats, setStats] = useState<RuleLibraryStats | null>(null);
  const [recommendation, setRecommendation] =
    useState<VisualizationRecommendation | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<RuleDocument | null>(null);
  const [draftDocument, setDraftDocument] = useState<RuleDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<NewRuleInput>(defaultCreateForm);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [runtimeMode, setRuntimeMode] = useState<"tauri" | "browser">("browser");
  const [runtimeLayer, setRuntimeLayer] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);

  const availableGroups = useMemo(
    () => Array.from(new Set(rules.flatMap((rule) => rule.groups))).sort(),
    [rules],
  );
  const availableTags = useMemo(
    () => Array.from(new Set(rules.flatMap((rule) => rule.tags))).sort(),
    [rules],
  );
  const availableTargets = useMemo(
    () => Array.from(new Set(rules.flatMap((rule) => rule.targets))).sort(),
    [rules],
  );

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

    const matchesSearch = haystack.includes(searchQuery.trim().toLowerCase());
    const matchesGroup = groupFilter === "all" || rule.groups.includes(groupFilter);
    const matchesTag = tagFilter === "all" || rule.tags.includes(tagFilter);
    const matchesTarget = targetFilter === "all" || rule.targets.includes(targetFilter);

    return matchesSearch && matchesGroup && matchesTag && matchesTarget;
  });

  const selectedRule =
    rules.find((rule) => rule.id === selectedRuleId) ?? filteredRules[0] ?? null;

  async function refreshWorkspace(preferredRuleId?: string) {
    setIsLoadingWorkspace(true);

    try {
      const snapshot = await getWorkspaceSnapshot();

      startTransition(() => {
        setRuntimeMode(snapshot.mode);
        setRuntimeLayer(snapshot.healthcheck.layer);
        setSummary(snapshot.summary);
        setRules(snapshot.rules);
        setStats(snapshot.stats);
        setRecommendation(snapshot.recommendation);
        setSelectedRuleId(
          preferredRuleId ??
            snapshot.rules.find((rule) => rule.id === selectedRuleId)?.id ??
            snapshot.rules[0]?.id ??
            null,
        );
        setError(null);
      });
    } catch (loadError) {
      startTransition(() => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unknown workspace loading error",
        );
      });
    } finally {
      setIsLoadingWorkspace(false);
    }
  }

  useEffect(() => {
    void refreshWorkspace();
  }, []);

  useEffect(() => {
    if (!selectedRule?.file) {
      setSelectedDocument(null);
      setDraftDocument(null);
      return;
    }

    let isActive = true;
    setIsLoadingDocument(true);

    async function loadSelectedRule() {
      try {
        const document = await loadRule(selectedRule.file);
        if (!isActive) {
          return;
        }

        startTransition(() => {
          setSelectedDocument(document);
          setDraftDocument(document);
        });
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        startTransition(() => {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unknown rule loading error",
          );
        });
      } finally {
        if (isActive) {
          setIsLoadingDocument(false);
        }
      }
    }

    void loadSelectedRule();

    return () => {
      isActive = false;
    };
  }, [selectedRule?.file]);

  useEffect(() => {
    if (filteredRules.length === 0) {
      return;
    }

    if (!filteredRules.some((rule) => rule.id === selectedRuleId)) {
      setSelectedRuleId(filteredRules[0]?.id ?? null);
    }
  }, [filteredRules, selectedRuleId]);

  async function handleCreateRule() {
    setIsCreating(true);

    try {
      const created = await createRule({
        ...createForm,
        groups: splitCommaSeparated(joinValues(createForm.groups)),
        tags: splitCommaSeparated(joinValues(createForm.tags)),
        targets: splitCommaSeparated(joinValues(createForm.targets)),
      });
      await refreshWorkspace(created.id);
      setSelectedRuleId(created.id);
      setCreateForm(defaultCreateForm);
      setIsCreateOpen(false);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unknown create rule error",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveRule() {
    if (!draftDocument) {
      return;
    }

    setIsSaving(true);

    try {
      const saved = await saveRule({
        ...draftDocument,
        groups: splitCommaSeparated(joinValues(draftDocument.groups)),
        tags: splitCommaSeparated(joinValues(draftDocument.tags)),
        targets: splitCommaSeparated(joinValues(draftDocument.targets)),
      });
      setSelectedDocument(saved);
      setDraftDocument(saved);
      await refreshWorkspace(saved.id);
      setSelectedRuleId(saved.id);
      setError(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unknown save rule error",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const isDirty =
    JSON.stringify(selectedDocument) !== JSON.stringify(draftDocument) &&
    draftDocument !== null;

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
          <h2>Library metrics</h2>
          <ul>
            <li>Tags: {stats?.tag_count ?? 0}</li>
            <li>Groups: {stats?.group_count ?? 0}</li>
            <li>Avg complexity: {stats?.average_complexity ?? 0}</li>
          </ul>
        </article>

        <article className="fact-card">
          <h2>Visualization signal</h2>
          <p>
            Recommendation:{" "}
            <strong>{recommendation?.recommendation ?? "loading"}</strong>
          </p>
          <p>Score: {recommendation?.score ?? 0}</p>
          {error ? <p className="error-text">{error}</p> : null}
        </article>
      </section>

      <section className="insight-grid" aria-label="Recommendation insights">
        <article className="fact-card">
          <h2>Why this recommendation</h2>
          <ul>
            {(recommendation?.reasons ?? []).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </article>

        <article className="fact-card">
          <h2>Suggested capabilities</h2>
          <ul>
            {(recommendation?.suggested_features ?? []).map((feature) => (
              <li key={feature}>{feature}</li>
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
      </section>

      <section className="workspace-frame" aria-label="Rule manager workspace">
        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>{panels[0].title}</h2>
              <p>{panels[0].body}</p>
            </div>
            <button
              className="ghost-button"
              onClick={() => setIsCreateOpen((value) => !value)}
              type="button"
            >
              {isCreateOpen ? "Close new rule" : "New rule"}
            </button>
          </div>

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

            <div className="filter-grid">
              <label className="field">
                <span>Group</span>
                <select
                  onChange={(event) => setGroupFilter(event.target.value)}
                  value={groupFilter}
                >
                  <option value="all">All groups</option>
                  {availableGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Tag</span>
                <select
                  onChange={(event) => setTagFilter(event.target.value)}
                  value={tagFilter}
                >
                  <option value="all">All tags</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Target</span>
                <select
                  onChange={(event) => setTargetFilter(event.target.value)}
                  value={targetFilter}
                >
                  <option value="all">All targets</option>
                  {availableTargets.map((target) => (
                    <option key={target} value={target}>
                      {target}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {isLoadingWorkspace ? (
              <div className="empty-state">
                <h3>Loading workspace</h3>
                <p>Fetching the current rule library summary and list.</p>
              </div>
            ) : null}

            {filteredRules.length > 0 ? (
              filteredRules.map((rule) => (
                <button
                  className={`rule-card ${selectedRule?.id === rule.id ? "selected" : ""}`}
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  type="button"
                >
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
                </button>
              ))
            ) : rules.length > 0 ? (
              <div className="empty-state">
                <h3>No matching rules</h3>
                <p>Try a broader search term or reset one of the active filters.</p>
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
          <div className="panel-header">
            <div>
              <h2>{panels[1].title}</h2>
              <p>{panels[1].body}</p>
            </div>
            {draftDocument ? (
              <button
                className="primary-button"
                disabled={isSaving || !isDirty}
                onClick={() => void handleSaveRule()}
                type="button"
              >
                {isSaving ? "Saving..." : isDirty ? "Save changes" : "Saved"}
              </button>
            ) : null}
          </div>

          {isCreateOpen ? (
            <div className="editor-stack">
              <div className="detail-block">
                <h3>Create rule from template</h3>
                <div className="field-grid">
                  <label className="field">
                    <span>Title</span>
                    <input
                      onChange={(event) =>
                        setCreateForm((form) => ({ ...form, title: event.target.value }))
                      }
                      placeholder="TypeScript Import Hygiene"
                      value={createForm.title}
                    />
                  </label>

                  <label className="field">
                    <span>Summary</span>
                    <input
                      onChange={(event) =>
                        setCreateForm((form) => ({ ...form, summary: event.target.value }))
                      }
                      placeholder="One sentence explaining the purpose of the rule."
                      value={createForm.summary ?? ""}
                    />
                  </label>

                  <label className="field">
                    <span>Groups</span>
                    <input
                      onChange={(event) =>
                        setCreateForm((form) => ({
                          ...form,
                          groups: splitCommaSeparated(event.target.value),
                        }))
                      }
                      placeholder="shared, frontend"
                      value={joinValues(createForm.groups)}
                    />
                  </label>

                  <label className="field">
                    <span>Tags</span>
                    <input
                      onChange={(event) =>
                        setCreateForm((form) => ({
                          ...form,
                          tags: splitCommaSeparated(event.target.value),
                        }))
                      }
                      placeholder="typescript, imports, lint"
                      value={joinValues(createForm.tags)}
                    />
                  </label>

                  <label className="field">
                    <span>Targets</span>
                    <input
                      onChange={(event) =>
                        setCreateForm((form) => ({
                          ...form,
                          targets: splitCommaSeparated(event.target.value),
                        }))
                      }
                      placeholder="agents-md, trae-rule"
                      value={joinValues(createForm.targets)}
                    />
                  </label>
                </div>

                <div className="button-row">
                  <button
                    className="primary-button"
                    disabled={isCreating || !createForm.title.trim()}
                    onClick={() => void handleCreateRule()}
                    type="button"
                  >
                    {isCreating ? "Creating..." : "Create rule"}
                  </button>
                  <button
                    className="ghost-button"
                    onClick={() => {
                      setCreateForm(defaultCreateForm);
                      setIsCreateOpen(false);
                    }}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : draftDocument ? (
            <div className="editor-stack">
              <div className="detail-block">
                <h3>Body editor</h3>
                <label className="field">
                  <span>Markdown body</span>
                  <textarea
                    className="body-editor"
                    onChange={(event) =>
                      setDraftDocument((document) =>
                        document ? { ...document, body: event.target.value } : document,
                      )
                    }
                    value={draftDocument.body}
                  />
                </label>
              </div>

              <div className="detail-block">
                <h3>Live body preview</h3>
                {isLoadingDocument ? (
                  <p>Loading the selected rule document...</p>
                ) : (
                  <pre className="preview-surface">{draftDocument.body}</pre>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No document loaded</h3>
              <p>Select a rule to edit its body or open the new-rule form.</p>
            </div>
          )}
        </article>

        <article className="panel">
          <h2>{panels[2].title}</h2>
          <p>{panels[2].body}</p>
          {draftDocument ? (
            <div className="editor-stack">
              <div className="detail-block">
                <h3>Metadata editor</h3>
                <div className="field-grid">
                  <label className="field">
                    <span>Title</span>
                    <input
                      onChange={(event) =>
                        setDraftDocument((document) =>
                          document ? { ...document, title: event.target.value } : document,
                        )
                      }
                      value={draftDocument.title}
                    />
                  </label>

                  <label className="field">
                    <span>Summary</span>
                    <input
                      onChange={(event) =>
                        setDraftDocument((document) =>
                          document ? { ...document, summary: event.target.value } : document,
                        )
                      }
                      value={draftDocument.summary}
                    />
                  </label>

                  <label className="field">
                    <span>Groups</span>
                    <input
                      onChange={(event) =>
                        setDraftDocument((document) =>
                          document
                            ? {
                                ...document,
                                groups: splitCommaSeparated(event.target.value),
                              }
                            : document,
                        )
                      }
                      value={joinValues(draftDocument.groups)}
                    />
                  </label>

                  <label className="field">
                    <span>Tags</span>
                    <input
                      onChange={(event) =>
                        setDraftDocument((document) =>
                          document
                            ? {
                                ...document,
                                tags: splitCommaSeparated(event.target.value),
                              }
                            : document,
                        )
                      }
                      value={joinValues(draftDocument.tags)}
                    />
                  </label>

                  <label className="field">
                    <span>Targets</span>
                    <input
                      onChange={(event) =>
                        setDraftDocument((document) =>
                          document
                            ? {
                                ...document,
                                targets: splitCommaSeparated(event.target.value),
                              }
                            : document,
                        )
                      }
                      value={joinValues(draftDocument.targets)}
                    />
                  </label>
                </div>
              </div>

              <div className="detail-block">
                <h3>File</h3>
                <p>{draftDocument.file}</p>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No rule selected</h3>
              <p>Select a rule from the library pane to inspect and edit it here.</p>
            </div>
          )}
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
