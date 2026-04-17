import type { RuleListItem } from "../../lib/tauri";
import { excerptBody, joinValues } from "../helpers";
import type { TranslateFn } from "../types";

type LibraryViewProps = {
  activeFilters: string[];
  availableGroups: string[];
  availableTags: string[];
  availableTargets: string[];
  filteredRules: RuleListItem[];
  groupFilter: string;
  isLoadingDocument: boolean;
  isLoadingWorkspace: boolean;
  onGroupFilterChange: (value: string) => void;
  onOpenEditor: () => void;
  onSearchChange: (value: string) => void;
  onSelectRule: (ruleId: string) => void;
  onTagFilterChange: (value: string) => void;
  onTargetFilterChange: (value: string) => void;
  previewBody: string;
  rules: RuleListItem[];
  searchQuery: string;
  selectedFile: string;
  selectedRule: RuleListItem | null;
  selectedSummary: string;
  selectedTags: string[];
  t: TranslateFn;
  tagFilter: string;
  targetFilter: string;
};

export function LibraryView({
  activeFilters,
  availableGroups,
  availableTags,
  availableTargets,
  filteredRules,
  groupFilter,
  isLoadingDocument,
  isLoadingWorkspace,
  onGroupFilterChange,
  onOpenEditor,
  onSearchChange,
  onSelectRule,
  onTagFilterChange,
  onTargetFilterChange,
  previewBody,
  rules,
  searchQuery,
  selectedFile,
  selectedRule,
  selectedSummary,
  selectedTags,
  t,
  tagFilter,
  targetFilter,
}: LibraryViewProps) {
  return (
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
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={t("search.placeholder")}
                type="search"
                value={searchQuery}
              />
            </label>

            <div className="filter-grid">
              <label className="field">
                <span>{t("filters.group")}</span>
                <select
                  onChange={(event) => onGroupFilterChange(event.target.value)}
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
                  onChange={(event) => onTagFilterChange(event.target.value)}
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
                  onChange={(event) => onTargetFilterChange(event.target.value)}
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
                  onClick={() => onSelectRule(rule.id)}
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
            <button className="ghost-button" onClick={onOpenEditor} type="button">
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
                {selectedTags.map((tag) => (
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
                  <strong>{t("filters.tag")}:</strong> {joinValues(selectedTags)}
                </p>
                <p>
                  <strong>{t("filters.target")}:</strong> {joinValues(selectedRule.targets)}
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
  );
}
