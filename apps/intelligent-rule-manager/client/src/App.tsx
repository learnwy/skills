import { startTransition, useEffect, useMemo, useState } from "react";
import {
  composeRules,
  createRule,
  getWorkspaceSnapshot,
  loadRule,
  saveRule,
  type ComposeResult,
  type ComposeTarget,
  type NewRuleInput,
  type RuleDocument,
  type RuleLibraryStats,
  type RuleListItem,
  type VisualizationRecommendation,
  type WorkspaceSummary,
} from "./lib/tauri";
import {
  detectBrowserLocale,
  recommendationLabel,
  translate,
  type Locale,
} from "./lib/i18n";

type WorkspaceView = "overview" | "library" | "editor" | "compose";

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

function getFilterTags(rule: RuleListItem): string[] {
  return rule.resolved_tags && rule.resolved_tags.length > 0
    ? rule.resolved_tags
    : rule.tags;
}

function excerptBody(body?: string): string {
  if (!body) {
    return "";
  }

  return body.length > 360 ? `${body.slice(0, 360)}...` : body;
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(detectBrowserLocale());
  const [activeView, setActiveView] = useState<WorkspaceView>("overview");
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
  const [isComposing, setIsComposing] = useState(false);
  const [runtimeMode, setRuntimeMode] = useState<"tauri" | "browser">("browser");
  const [runtimeLayer, setRuntimeLayer] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);
  const [composeTarget, setComposeTarget] = useState<ComposeTarget>("agents-md");
  const [selectedComposeTags, setSelectedComposeTags] = useState<string[]>([]);
  const [selectedComposeRuleIds, setSelectedComposeRuleIds] = useState<string[]>([]);
  const [composeResult, setComposeResult] = useState<ComposeResult | null>(null);
  const t = (
    key: Parameters<typeof translate>[1],
    variables?: Record<string, string | number>,
  ) => translate(locale, key, variables);

  const panels = [
    {
      title: t("panel.library.title"),
      body: t("panel.library.body"),
    },
    {
      title: t("panel.workspace.title"),
      body: t("panel.workspace.body"),
    },
    {
      title: t("panel.inspector.title"),
      body: t("panel.inspector.body"),
    },
  ];

  const milestones = [
    t("milestone.composeExport"),
    t("milestone.previewPolish"),
    t("milestone.smokeTest"),
  ];

  const activeViewMeta: Record<
    WorkspaceView,
    { label: string; description: string; eyebrow: string }
  > = {
    overview: {
      label: t("tabs.overview"),
      description: t("hero.lede"),
      eyebrow: t("workspace.label"),
    },
    library: {
      label: t("tabs.library"),
      description: t("library.resultsBody"),
      eyebrow: t("workspace.label"),
    },
    editor: {
      label: t("tabs.editor"),
      description: panels[1].body,
      eyebrow: t("workspace.label"),
    },
    compose: {
      label: t("tabs.compose"),
      description: t("compose.exportBody"),
      eyebrow: t("workspace.label"),
    },
  };

  const viewTabs = [
    { id: "overview" as const, label: t("tabs.overview") },
    { id: "library" as const, label: t("tabs.library") },
    { id: "editor" as const, label: t("tabs.editor") },
    { id: "compose" as const, label: t("tabs.compose") },
  ];

  const availableGroups = useMemo(
    () => Array.from(new Set(rules.flatMap((rule) => rule.groups))).sort(),
    [rules],
  );
  const availableTags = useMemo(
    () => Array.from(new Set(rules.flatMap((rule) => getFilterTags(rule)))).sort(),
    [rules],
  );
  const availableTargets = useMemo(
    () => Array.from(new Set(rules.flatMap((rule) => rule.targets))).sort(),
    [rules],
  );

  const filteredRules = useMemo(
    () =>
      rules.filter((rule) => {
        const filterTags = getFilterTags(rule);
        const haystack = [
          rule.id,
          rule.title,
          rule.summary,
          rule.groups.join(" "),
          filterTags.join(" "),
          rule.targets.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch = haystack.includes(searchQuery.trim().toLowerCase());
        const matchesGroup = groupFilter === "all" || rule.groups.includes(groupFilter);
        const matchesTag = tagFilter === "all" || filterTags.includes(tagFilter);
        const matchesTarget =
          targetFilter === "all" || rule.targets.includes(targetFilter);

        return matchesSearch && matchesGroup && matchesTag && matchesTarget;
      }),
    [groupFilter, rules, searchQuery, tagFilter, targetFilter],
  );

  const selectedRule =
    rules.find((rule) => rule.id === selectedRuleId) ?? filteredRules[0] ?? null;

  const composeMatchingRules = useMemo(() => {
    return rules
      .filter((rule) => rule.targets.includes(composeTarget) || rule.targets.includes("generic"))
      .filter((rule) => {
        const matchesRule = selectedComposeRuleIds.includes(rule.id);
        const matchesTag = selectedComposeTags.some((tag) =>
          getFilterTags(rule).includes(tag),
        );
        return matchesRule || matchesTag;
      });
  }, [composeTarget, rules, selectedComposeRuleIds, selectedComposeTags]);

  async function refreshWorkspace(preferredRuleId?: string) {
    setIsLoadingWorkspace(true);

    try {
      const snapshot = await getWorkspaceSnapshot(locale);

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
          loadError instanceof Error ? loadError.message : t("errors.workspaceLoad"),
        );
      });
    } finally {
      setIsLoadingWorkspace(false);
    }
  }

  useEffect(() => {
    void refreshWorkspace();
  }, [locale]);

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
        const document = await loadRule(selectedRule.file, locale);
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
            loadError instanceof Error ? loadError.message : t("errors.ruleLoad"),
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
  }, [locale, selectedRule?.file]);

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
      const created = await createRule(
        {
          ...createForm,
          groups: splitCommaSeparated(joinValues(createForm.groups)),
          tags: splitCommaSeparated(joinValues(createForm.tags)),
          targets: splitCommaSeparated(joinValues(createForm.targets)),
        },
        locale,
      );
      await refreshWorkspace(created.id);
      setSelectedRuleId(created.id);
      setCreateForm(defaultCreateForm);
      setIsCreateOpen(false);
      setActiveView("editor");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : t("errors.createRule"),
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
        saveError instanceof Error ? saveError.message : t("errors.saveRule"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleComposeExport() {
    setIsComposing(true);

    try {
      const composed = await composeRules({
        target: composeTarget,
        rule_ids: selectedComposeRuleIds,
        tags: selectedComposeTags,
      });
      setComposeResult(composed);
      setError(null);
    } catch (composeError) {
      setError(
        composeError instanceof Error
          ? composeError.message
          : t("errors.composeRule"),
      );
    } finally {
      setIsComposing(false);
    }
  }

  function openCreateFlow() {
    setCreateForm(defaultCreateForm);
    setIsCreateOpen(true);
    setActiveView("editor");
  }

  function toggleComposeTag(tag: string) {
    setSelectedComposeTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  }

  function toggleComposeRule(ruleId: string) {
    setSelectedComposeRuleIds((current) =>
      current.includes(ruleId)
        ? current.filter((item) => item !== ruleId)
        : [...current, ruleId],
    );
  }

  function clearComposeSelection() {
    setSelectedComposeTags([]);
    setSelectedComposeRuleIds([]);
    setComposeResult(null);
  }

  const isDirty =
    JSON.stringify(selectedDocument) !== JSON.stringify(draftDocument) &&
    draftDocument !== null;
  const selectedSummary =
    draftDocument?.summary || selectedRule?.summary || t("rule.noSummary");
  const selectedFile = draftDocument?.file || selectedRule?.file || "";
  const previewBody = draftDocument?.body || selectedDocument?.body || "";
  const selectedFilterTags = selectedRule ? getFilterTags(selectedRule) : [];
  const activeFilters = [groupFilter, tagFilter, targetFilter].filter(
    (value) => value !== "all",
  );

  return (
    <div className="app-shell">
      <div className="app-frame">
        <aside className="app-sidebar">
          <div className="sidebar-brand">
            <p className="eyebrow">{t("hero.eyebrow")}</p>
            <h1>{t("hero.title")}</h1>
            <p>{t("hero.lede")}</p>
          </div>

          <nav className="sidebar-nav" aria-label={t("tabs.label")}>
            {viewTabs.map((tab) => (
              <button
                className={`sidebar-tab ${activeView === tab.id ? "active" : ""}`}
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                type="button"
              >
                <div className="sidebar-tab-copy">
                  <strong>{tab.label}</strong>
                  <span>{activeViewMeta[tab.id].description}</span>
                </div>
                <span className="sidebar-tab-meta">
                  {tab.id === "library" ? filteredRules.length : null}
                  {tab.id === "editor" && selectedRule ? selectedRule.id : null}
                  {tab.id === "compose" ? composeMatchingRules.length : null}
                </span>
              </button>
            ))}
          </nav>

          <section className="sidebar-card">
            <div className="section-heading">
              <p className="section-eyebrow">{t("status.foundation")}</p>
              <h2>{t("overview.metricsTitle")}</h2>
            </div>
            <div className="sidebar-metrics">
              <div>
                <span>{t("status.ruleCount")}</span>
                <strong>{rules.length}</strong>
              </div>
              <div>
                <span>{t("filters.tag")}</span>
                <strong>{availableTags.length}</strong>
              </div>
              <div>
                <span>{t("filters.group")}</span>
                <strong>{availableGroups.length}</strong>
              </div>
            </div>
            <p className="sidebar-muted">{t("overview.metricsBody")}</p>
          </section>

          <section className="sidebar-card">
            <div className="section-heading">
              <p className="section-eyebrow">{t("action.newRule")}</p>
              <h2>{t("overview.flowTitle")}</h2>
            </div>
            <div className="sidebar-actions">
              <button className="ghost-button" onClick={openCreateFlow} type="button">
                {t("action.newRule")}
              </button>
              <button
                className="ghost-button"
                onClick={() => setActiveView("compose")}
                type="button"
              >
                {t("action.composeExport")}
              </button>
              <button
                className="primary-button"
                disabled={isSaving || !isDirty}
                onClick={() => void handleSaveRule()}
                type="button"
              >
                {isSaving
                  ? t("action.saving")
                  : isDirty
                    ? t("action.saveChanges")
                    : t("action.saved")}
              </button>
            </div>
          </section>

          <section className="sidebar-card sidebar-card-highlight">
            <div className="section-heading">
              <p className="section-eyebrow">{t("overview.selectionTitle")}</p>
              <h2>{selectedRule?.title ?? t("empty.noRuleSelectedTitle")}</h2>
            </div>
            <p>{selectedSummary}</p>
            {selectedRule ? (
              <>
                <div className="token-row">
                  {selectedFilterTags.slice(0, 6).map((tag) => (
                    <span className="token" key={`sidebar-tag-${tag}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  className="ghost-button"
                  onClick={() => setActiveView("editor")}
                  type="button"
                >
                  {t("action.openEditor")}
                </button>
              </>
            ) : (
              <p className="sidebar-muted">{t("overview.selectionBody")}</p>
            )}
          </section>
        </aside>

        <main className="app-main">
          <header className="page-header">
            <div className="page-copy">
              <p className="page-kicker">{activeViewMeta[activeView].eyebrow}</p>
              <h2>{activeViewMeta[activeView].label}</h2>
              <p>{activeViewMeta[activeView].description}</p>
            </div>

            <div className="page-tools">
              <label className="locale-picker">
                <span>{t("locale.label")}</span>
                <select
                  onChange={(event) => setLocale(event.target.value as Locale)}
                  value={locale}
                >
                  <option value="en">{t("locale.en")}</option>
                  <option value="zh-CN">{t("locale.zh-CN")}</option>
                </select>
              </label>
            </div>
          </header>

          <section className="status-pills">
            <article className="status-pill accent">
              <span>{t("status.runtime")}</span>
              <strong>{runtimeMode}</strong>
              <p>{runtimeLayer}</p>
            </article>
            <article className="status-pill">
              <span>{t("status.storage")}</span>
              <strong>{summary ? summary.storage_root : t("status.storageLoading")}</strong>
            </article>
            <article className="status-pill">
              <span>
                {t("facts.recommendation", {
                  value: recommendationLabel(locale, recommendation?.recommendation),
                })}
              </span>
              <strong>{recommendation?.score ?? 0}</strong>
              <p>{t("facts.score", { value: recommendation?.score ?? 0 })}</p>
            </article>
          </section>

          {error ? <div className="error-banner">{error}</div> : null}

          {activeView === "overview" ? (
            <div className="view-stack">
              <section className="workspace-hero">
                <div className="workspace-hero-copy">
                  <p className="section-eyebrow">{t("overview.flowTitle")}</p>
                  <h3>{t("hero.title")}</h3>
                  <p>{t("overview.flowBody")}</p>
                </div>
                <div className="workspace-hero-metrics">
                  <div>
                    <span>{t("status.ruleCount")}</span>
                    <strong>{rules.length}</strong>
                  </div>
                  <div>
                    <span>{t("compose.matchingRules")}</span>
                    <strong>{composeMatchingRules.length}</strong>
                  </div>
                  <div>
                    <span>{t("filters.tag")}</span>
                    <strong>{availableTags.length}</strong>
                  </div>
                </div>
              </section>

              <section className="overview-grid">
                <article className="panel panel-hero">
                  <div className="section-heading">
                    <p className="section-eyebrow">{t("overview.flowTitle")}</p>
                    <h2>{t("overview.flowBody")}</h2>
                  </div>
                  <div className="action-stack">
                    <button
                      className="action-card action-card-primary"
                      onClick={() => setActiveView("library")}
                      type="button"
                    >
                      <strong>{t("tabs.library")}</strong>
                      <p>{panels[0].body}</p>
                    </button>
                    <button
                      className="action-card"
                      onClick={() => setActiveView("editor")}
                      type="button"
                    >
                      <strong>{t("tabs.editor")}</strong>
                      <p>{panels[1].body}</p>
                    </button>
                    <button
                      className="action-card"
                      onClick={() => setActiveView("compose")}
                      type="button"
                    >
                      <strong>{t("tabs.compose")}</strong>
                      <p>{t("compose.exportBody")}</p>
                    </button>
                  </div>
                </article>

                <article className="panel">
                  <div className="section-heading">
                    <p className="section-eyebrow">{t("overview.selectionTitle")}</p>
                    <h2>{selectedRule?.title ?? t("empty.noRuleSelectedTitle")}</h2>
                  </div>
                  <p>{selectedSummary}</p>
                  <div className="detail-stack">
                    <div className="detail-line">
                      <span>{t("filters.group")}</span>
                      <strong>
                        {selectedRule ? joinValues(selectedRule.groups) : "—"}
                      </strong>
                    </div>
                    <div className="detail-line">
                      <span>{t("filters.target")}</span>
                      <strong>
                        {selectedRule ? joinValues(selectedRule.targets) : "—"}
                      </strong>
                    </div>
                    <div className="detail-line">
                      <span>{t("inspector.fileTitle")}</span>
                      <strong>{selectedFile || "—"}</strong>
                    </div>
                  </div>
                  {selectedRule ? (
                    <pre className="preview-surface preview-inline">
                      {excerptBody(previewBody)}
                    </pre>
                  ) : (
                    <p className="sidebar-muted">{t("overview.selectionBody")}</p>
                  )}
                </article>
              </section>

              <section className="surface-grid">
                <article className="panel surface-panel">
                  <div className="section-heading">
                    <p className="section-eyebrow">{t("overview.metricsTitle")}</p>
                    <h2>{t("facts.libraryMetrics")}</h2>
                  </div>
                  <div className="metric-list">
                    <div>
                      <span>{t("facts.tags", { count: stats?.tag_count ?? 0 })}</span>
                      <strong>{stats?.tag_count ?? 0}</strong>
                    </div>
                    <div>
                      <span>{t("facts.groups", { count: stats?.group_count ?? 0 })}</span>
                      <strong>{stats?.group_count ?? 0}</strong>
                    </div>
                    <div>
                      <span>{t("facts.averageComplexity", { value: stats?.average_complexity ?? 0 })}</span>
                      <strong>{stats?.average_complexity ?? 0}</strong>
                    </div>
                  </div>
                </article>

                <article className="panel surface-panel">
                  <div className="section-heading">
                    <p className="section-eyebrow">{t("insights.label")}</p>
                    <h2>{t("insights.why")}</h2>
                  </div>
                  <ul className="panel-list">
                    {(recommendation?.reasons ?? []).map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </article>

                <article className="panel surface-panel">
                  <div className="section-heading">
                    <p className="section-eyebrow">{t("compose.exportTitle")}</p>
                    <h2>{t("insights.features")}</h2>
                  </div>
                  <ul className="panel-list">
                    {(recommendation?.suggested_features ?? []).map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </article>
              </section>

              <section className="surface-grid surface-grid-wide">
                <article className="panel">
                  <div className="section-heading">
                    <p className="section-eyebrow">{t("facts.capabilities")}</p>
                    <h2>{t("facts.supportedArtifacts")}</h2>
                  </div>
                  <div className="token-row">
                    {(summary?.supported_artifacts ?? []).map((item) => (
                      <span className="token" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="token-row">
                    {(summary?.supported_targets ?? []).map((item) => (
                      <span className="token token-muted" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </article>

                <article className="panel">
                  <div className="section-heading">
                    <p className="section-eyebrow">{t("milestones.label")}</p>
                    <h2>{t("milestones.label")}</h2>
                  </div>
                  <ol className="milestone-list">
                    {milestones.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </article>
              </section>
            </div>
          ) : null}

          {activeView === "library" ? (
            <section className="split-view split-view-library" aria-label={t("workspace.label")}>
              <article className="panel">
                <div className="panel-header">
                  <div>
                    <p className="section-eyebrow">{t("panel.library.title")}</p>
                    <h2>{t("library.resultsTitle")}</h2>
                    <p>{t("library.resultsBody")}</p>
                  </div>
                  <div className="header-metric">
                    <span>{t("library.filteredCount")}</span>
                    <strong>{filteredRules.length}</strong>
                  </div>
                </div>

                <div className="section-stack">
                  <div className="detail-block">
                    <label className="search-box">
                      <span>{t("search.label")}</span>
                      <input
                        aria-label={t("search.label")}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder={t("search.placeholder")}
                        type="search"
                        value={searchQuery}
                      />
                    </label>

                    <div className="filter-grid">
                      <label className="field">
                        <span>{t("filters.group")}</span>
                        <select
                          onChange={(event) => setGroupFilter(event.target.value)}
                          value={groupFilter}
                        >
                          <option value="all">{t("filters.allGroups")}</option>
                          {availableGroups.map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="field">
                        <span>{t("filters.tag")}</span>
                        <select
                          onChange={(event) => setTagFilter(event.target.value)}
                          value={tagFilter}
                        >
                          <option value="all">{t("filters.allTags")}</option>
                          {availableTags.map((tag) => (
                            <option key={tag} value={tag}>
                              {tag}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="field">
                        <span>{t("filters.target")}</span>
                        <select
                          onChange={(event) => setTargetFilter(event.target.value)}
                          value={targetFilter}
                        >
                          <option value="all">{t("filters.allTargets")}</option>
                          {availableTargets.map((target) => (
                            <option key={target} value={target}>
                              {target}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {activeFilters.length > 0 ? (
                      <div className="token-row">
                        {activeFilters.map((filter) => (
                          <span className="token token-muted" key={`filter-${filter}`}>
                            {filter}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="rule-list">
                    {isLoadingWorkspace ? (
                      <div className="empty-state">
                        <h3>{t("empty.loadingWorkspaceTitle")}</h3>
                        <p>{t("empty.loadingWorkspaceBody")}</p>
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
                          <p>{rule.summary || t("rule.noSummary")}</p>
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
                        <h3>{t("empty.noMatchingRulesTitle")}</h3>
                        <p>{t("empty.noMatchingRulesBody")}</p>
                      </div>
                    ) : (
                      <div className="empty-state">
                        <h3>{t("empty.noRulesTitle")}</h3>
                        <p>{t("empty.noRulesBody")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </article>

              <article className="panel panel-inspector">
                <div className="panel-header">
                  <div>
                    <p className="section-eyebrow">{t("panel.inspector.title")}</p>
                    <h2>{t("overview.selectionTitle")}</h2>
                    <p>{t("overview.selectionBody")}</p>
                  </div>
                  {selectedRule ? (
                    <button
                      className="ghost-button"
                      onClick={() => setActiveView("editor")}
                      type="button"
                    >
                      {t("action.openEditor")}
                    </button>
                  ) : null}
                </div>

                {selectedRule ? (
                  <div className="editor-stack">
                    <div className="detail-block">
                      <h3>{selectedRule.title}</h3>
                      <p>{selectedSummary}</p>
                      <div className="token-row">
                        {selectedFilterTags.map((tag) => (
                          <span className="token" key={`${selectedRule.id}-tag-${tag}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="detail-block">
                      <h3>{t("inspector.metaTitle")}</h3>
                      <div className="meta-grid">
                        <p>
                          <strong>{t("filters.group")}:</strong> {joinValues(selectedRule.groups)}
                        </p>
                        <p>
                          <strong>{t("filters.tag")}:</strong> {joinValues(selectedFilterTags)}
                        </p>
                        <p>
                          <strong>{t("filters.target")}:</strong>{" "}
                          {joinValues(selectedRule.targets)}
                        </p>
                      </div>
                    </div>

                    <div className="detail-block">
                      <h3>{t("inspector.fileTitle")}</h3>
                      <p>{selectedFile}</p>
                    </div>

                    <div className="detail-block">
                      <h3>{t("editor.previewTitle")}</h3>
                      {isLoadingDocument ? (
                        <p>{t("editor.previewLoading")}</p>
                      ) : (
                        <pre className="preview-surface">{excerptBody(previewBody)}</pre>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>{t("empty.noRuleSelectedTitle")}</h3>
                    <p>{t("empty.noRuleSelectedBody")}</p>
                  </div>
                )}
              </article>
            </section>
          ) : null}

          {activeView === "editor" ? (
            <section className="split-view split-view-editor" aria-label={t("workspace.label")}>
              <article className="panel">
                <div className="panel-header">
                  <div>
                    <p className="section-eyebrow">{t("panel.workspace.title")}</p>
                    <h2>{panels[1].title}</h2>
                    <p>{panels[1].body}</p>
                  </div>
                  {isCreateOpen ? null : (
                    <button className="ghost-button" onClick={openCreateFlow} type="button">
                      {t("action.newRule")}
                    </button>
                  )}
                </div>

                <div className="editor-status-card">
                  <div>
                    <span>{t(isDirty ? "editor.stateDirty" : "editor.stateClean")}</span>
                    <strong>{draftDocument?.title ?? t("empty.noDocumentTitle")}</strong>
                  </div>
                  <div>
                    <span>{t("inspector.fileTitle")}</span>
                    <strong>{selectedFile || "—"}</strong>
                  </div>
                </div>

                {isCreateOpen ? (
                  <div className="editor-stack">
                    <div className="detail-block">
                      <h3>{t("create.title")}</h3>
                      <div className="field-grid">
                        <label className="field">
                          <span>{t("create.fieldTitle")}</span>
                          <input
                            onChange={(event) =>
                              setCreateForm((form) => ({ ...form, title: event.target.value }))
                            }
                            placeholder={t("create.titlePlaceholder")}
                            value={createForm.title}
                          />
                        </label>

                        <label className="field">
                          <span>{t("create.fieldSummary")}</span>
                          <input
                            onChange={(event) =>
                              setCreateForm((form) => ({ ...form, summary: event.target.value }))
                            }
                            placeholder={t("create.summaryPlaceholder")}
                            value={createForm.summary ?? ""}
                          />
                        </label>

                        <label className="field">
                          <span>{t("create.fieldGroups")}</span>
                          <input
                            onChange={(event) =>
                              setCreateForm((form) => ({
                                ...form,
                                groups: splitCommaSeparated(event.target.value),
                              }))
                            }
                            placeholder={t("create.groupsPlaceholder")}
                            value={joinValues(createForm.groups)}
                          />
                        </label>

                        <label className="field">
                          <span>{t("create.fieldTags")}</span>
                          <input
                            onChange={(event) =>
                              setCreateForm((form) => ({
                                ...form,
                                tags: splitCommaSeparated(event.target.value),
                              }))
                            }
                            placeholder={t("create.tagsPlaceholder")}
                            value={joinValues(createForm.tags)}
                          />
                        </label>

                        <label className="field">
                          <span>{t("create.fieldTargets")}</span>
                          <input
                            onChange={(event) =>
                              setCreateForm((form) => ({
                                ...form,
                                targets: splitCommaSeparated(event.target.value),
                              }))
                            }
                            placeholder={t("create.targetsPlaceholder")}
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
                          {isCreating ? t("action.creating") : t("action.createRule")}
                        </button>
                        <button
                          className="ghost-button"
                          onClick={() => {
                            setCreateForm(defaultCreateForm);
                            setIsCreateOpen(false);
                          }}
                          type="button"
                        >
                          {t("action.cancel")}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : draftDocument ? (
                  <div className="editor-stack">
                    <div className="detail-block detail-block-editor">
                      <h3>{t("editor.bodyTitle")}</h3>
                      <label className="field">
                        <span>{t("editor.bodyField")}</span>
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
                      <h3>{t("editor.previewTitle")}</h3>
                      {isLoadingDocument ? (
                        <p>{t("editor.previewLoading")}</p>
                      ) : (
                        <pre className="preview-surface">{draftDocument.body}</pre>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>{t("empty.noDocumentTitle")}</h3>
                    <p>{t("empty.noDocumentBody")}</p>
                  </div>
                )}
              </article>

              <article className="panel panel-inspector">
                <div className="panel-header">
                  <div>
                    <p className="section-eyebrow">{t("panel.inspector.title")}</p>
                    <h2>{t("inspector.metaTitle")}</h2>
                    <p>{panels[2].body}</p>
                  </div>
                </div>

                {draftDocument ? (
                  <div className="editor-stack">
                    <div className="detail-block">
                      <div className="field-grid">
                        <label className="field">
                          <span>{t("create.fieldTitle")}</span>
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
                          <span>{t("create.fieldSummary")}</span>
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
                          <span>{t("create.fieldGroups")}</span>
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
                          <span>{t("create.fieldTags")}</span>
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
                          <span>{t("create.fieldTargets")}</span>
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
                      <h3>{t("inspector.fileTitle")}</h3>
                      <p>{draftDocument.file}</p>
                    </div>

                    <div className="detail-block">
                      <h3>{t("compose.matchingRules")}</h3>
                      <div className="token-row">
                        {draftDocument.targets.map((target) => (
                          <span className="token token-muted" key={`editor-target-${target}`}>
                            {target}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>{t("empty.noRuleSelectedTitle")}</h3>
                    <p>{t("empty.noRuleSelectedBody")}</p>
                  </div>
                )}
              </article>
            </section>
          ) : null}

          {activeView === "compose" ? (
            <section className="split-view split-view-compose" aria-label={t("workspace.label")}>
              <article className="panel">
                <div className="panel-header">
                  <div>
                    <p className="section-eyebrow">{t("compose.stageSelect")}</p>
                    <h2>{t("compose.selectionTitle")}</h2>
                    <p>{t("compose.stageSelectBody")}</p>
                  </div>
                  <button className="ghost-button" onClick={clearComposeSelection} type="button">
                    {t("action.clearSelection")}
                  </button>
                </div>

                <div className="compose-stage-grid">
                  <div className="detail-block">
                    <div className="compose-stage-header">
                      <span className="stage-index">1</span>
                      <div>
                        <h3>{t("compose.selectedTags")}</h3>
                        <p>{t("compose.tagHint")}</p>
                      </div>
                    </div>
                    <div className="token-row token-grid">
                      {availableTags.map((tag) => (
                        <button
                          className={`token-button ${selectedComposeTags.includes(tag) ? "active" : ""}`}
                          key={tag}
                          onClick={() => toggleComposeTag(tag)}
                          type="button"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="detail-block">
                    <div className="compose-stage-header">
                      <span className="stage-index">2</span>
                      <div>
                        <h3>{t("compose.selectedRules")}</h3>
                        <p>{t("compose.ruleHint")}</p>
                      </div>
                    </div>
                    <div className="compose-rule-list">
                      {filteredRules.map((rule) => (
                        <label className="compose-rule-item" key={`compose-${rule.id}`}>
                          <input
                            checked={selectedComposeRuleIds.includes(rule.id)}
                            onChange={() => toggleComposeRule(rule.id)}
                            type="checkbox"
                          />
                          <div>
                            <strong>{rule.title}</strong>
                            <p>{rule.summary || t("rule.noSummary")}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </article>

              <article className="panel panel-inspector">
                <div className="panel-header">
                  <div>
                    <p className="section-eyebrow">{t("compose.stageAssemble")}</p>
                    <h2>{t("compose.exportTitle")}</h2>
                    <p>{t("compose.stageAssembleBody")}</p>
                  </div>
                </div>

                <div className="editor-stack">
                  <div className="detail-block">
                    <div className="compose-stage-header">
                      <span className="stage-index">3</span>
                      <div>
                        <h3>{t("compose.matchingRules")}</h3>
                        <p>{t("compose.exportBody")}</p>
                      </div>
                    </div>
                    {composeMatchingRules.length > 0 ? (
                      <div className="token-row">
                        {composeMatchingRules.map((rule) => (
                          <span className="token" key={`match-${rule.id}`}>
                            {rule.id}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state compact">
                        <h3>{t("compose.noSelectionTitle")}</h3>
                        <p>{t("compose.noSelectionBody")}</p>
                      </div>
                    )}
                  </div>

                  <div className="detail-block">
                    <label className="field">
                      <span>{t("compose.targetLabel")}</span>
                      <select
                        onChange={(event) => setComposeTarget(event.target.value as ComposeTarget)}
                        value={composeTarget}
                      >
                        <option value="agents-md">{t("compose.targetAgents")}</option>
                        <option value="trae-rule">{t("compose.targetTrae")}</option>
                      </select>
                    </label>

                    <div className="button-row">
                      <button
                        className="primary-button"
                        disabled={isComposing || composeMatchingRules.length === 0}
                        onClick={() => void handleComposeExport()}
                        type="button"
                      >
                        {isComposing ? t("action.composing") : t("action.composeExport")}
                      </button>
                    </div>
                  </div>

                  <div className="detail-block">
                    <h3>{t("compose.resultTitle")}</h3>
                    {composeResult ? (
                      <>
                        <p>
                          {t("compose.resultSummary", {
                            count: composeResult.files.length,
                            path: composeResult.export_root,
                          })}
                        </p>
                        <div className="compose-file-list">
                          {composeResult.files.map((file) => (
                            <div className="compose-file-item" key={file.path}>
                              <strong>{file.title}</strong>
                              <p>{file.path}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p>{t("compose.emptyResult")}</p>
                    )}
                  </div>

                  <div className="detail-block">
                    <h3>{t("compose.previewTitle")}</h3>
                    {composeResult?.files[0] ? (
                      <pre className="preview-surface preview-export">
                        {composeResult.files[0].content}
                      </pre>
                    ) : (
                      <p>{t("compose.previewEmpty")}</p>
                    )}
                  </div>
                </div>
              </article>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
