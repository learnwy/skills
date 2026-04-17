import { recommendationLabel, type Locale } from "../../lib/i18n";
import type {
  RuleLibraryStats,
  RuleListItem,
  VisualizationRecommendation,
  WorkspaceSummary,
} from "../../lib/tauri";
import { excerptBody, joinValues } from "../helpers";
import type { PanelCopy, TranslateFn } from "../types";

type OverviewViewProps = {
  composeMatchingCount: number;
  locale: Locale;
  milestones: string[];
  onOpenCompose: () => void;
  onOpenEditor: () => void;
  onOpenLibrary: () => void;
  panels: PanelCopy[];
  previewBody: string;
  recommendation: VisualizationRecommendation | null;
  rulesCount: number;
  selectedFile: string;
  selectedRule: RuleListItem | null;
  selectedSummary: string;
  stats: RuleLibraryStats | null;
  summary: WorkspaceSummary | null;
  t: TranslateFn;
};

export function OverviewView({
  composeMatchingCount,
  locale,
  milestones,
  onOpenCompose,
  onOpenEditor,
  onOpenLibrary,
  panels,
  previewBody,
  recommendation,
  rulesCount,
  selectedFile,
  selectedRule,
  selectedSummary,
  stats,
  summary,
  t,
}: OverviewViewProps) {
  return (
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
            <strong>{rulesCount}</strong>
          </div>
          <div>
            <span>{t("compose.matchingRules")}</span>
            <strong>{composeMatchingCount}</strong>
          </div>
          <div>
            <span>{t("facts.recommendation", {
              value: recommendationLabel(locale, recommendation?.recommendation),
            })}</span>
            <strong>{recommendation?.score ?? 0}</strong>
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
              onClick={onOpenLibrary}
              type="button"
            >
              <strong>{t("tabs.library")}</strong>
              <p>{panels[0].body}</p>
            </button>
            <button className="action-card" onClick={onOpenEditor} type="button">
              <strong>{t("tabs.editor")}</strong>
              <p>{panels[1].body}</p>
            </button>
            <button className="action-card" onClick={onOpenCompose} type="button">
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
              <strong>{selectedRule ? joinValues(selectedRule.groups) : "—"}</strong>
            </div>
            <div className="detail-line">
              <span>{t("filters.target")}</span>
              <strong>{selectedRule ? joinValues(selectedRule.targets) : "—"}</strong>
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
  );
}
