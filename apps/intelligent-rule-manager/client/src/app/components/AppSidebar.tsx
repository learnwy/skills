import type { RuleListItem } from "../../lib/tauri";
import type { TranslateFn, ViewMeta, ViewTab, WorkspaceView } from "../types";

type AppSidebarProps = {
  activeView: WorkspaceView;
  activeViewMeta: Record<WorkspaceView, ViewMeta>;
  availableGroupsCount: number;
  availableTagsCount: number;
  composeMatchingCount: number;
  filteredRulesCount: number;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  isDirty: boolean;
  isSaving: boolean;
  onChangeView: (view: WorkspaceView) => void;
  onOpenCompose: () => void;
  onOpenCreate: () => void;
  onOpenEditor: () => void;
  onSave: () => void;
  rulesCount: number;
  selectedRule: RuleListItem | null;
  selectedSummary: string;
  selectedTags: string[];
  t: TranslateFn;
  viewTabs: ViewTab[];
};

export function AppSidebar({
  activeView,
  activeViewMeta,
  availableGroupsCount,
  availableTagsCount,
  composeMatchingCount,
  filteredRulesCount,
  heroEyebrow,
  heroTitle,
  heroBody,
  isDirty,
  isSaving,
  onChangeView,
  onOpenCompose,
  onOpenCreate,
  onOpenEditor,
  onSave,
  rulesCount,
  selectedRule,
  selectedSummary,
  selectedTags,
  t,
  viewTabs,
}: AppSidebarProps) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <p className="eyebrow">{heroEyebrow}</p>
        <h1>{heroTitle}</h1>
        <p>{heroBody}</p>
      </div>

      <nav className="sidebar-nav" aria-label={t("tabs.label")}>
        {viewTabs.map((tab) => (
          <button
            className={`sidebar-tab ${activeView === tab.id ? "active" : ""}`}
            key={tab.id}
            onClick={() => onChangeView(tab.id)}
            type="button"
          >
            <div className="sidebar-tab-copy">
              <strong>{tab.label}</strong>
              <span>{activeViewMeta[tab.id].description}</span>
            </div>
            <span className="sidebar-tab-meta">
              {tab.id === "library" ? filteredRulesCount : null}
              {tab.id === "editor" && selectedRule ? selectedRule.id : null}
              {tab.id === "compose" ? composeMatchingCount : null}
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
            <strong>{rulesCount}</strong>
          </div>
          <div>
            <span>{t("filters.tag")}</span>
            <strong>{availableTagsCount}</strong>
          </div>
          <div>
            <span>{t("filters.group")}</span>
            <strong>{availableGroupsCount}</strong>
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
          <button className="ghost-button" onClick={onOpenCreate} type="button">
            {t("action.newRule")}
          </button>
          <button className="ghost-button" onClick={onOpenCompose} type="button">
            {t("action.composeExport")}
          </button>
          <button
            className="primary-button"
            disabled={isSaving || !isDirty}
            onClick={onSave}
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
              {selectedTags.slice(0, 6).map((tag) => (
                <span className="token" key={`sidebar-tag-${tag}`}>
                  {tag}
                </span>
              ))}
            </div>
            <button className="ghost-button" onClick={onOpenEditor} type="button">
              {t("action.openEditor")}
            </button>
          </>
        ) : (
          <p className="sidebar-muted">{t("overview.selectionBody")}</p>
        )}
      </section>
    </aside>
  );
}
