import type { ComposeResult, ComposeTarget, RuleListItem } from "../../lib/tauri";
import type { TranslateFn } from "../types";

type ComposeViewProps = {
  availableTags: string[];
  composeMatchingRules: RuleListItem[];
  composeResult: ComposeResult | null;
  composeTarget: ComposeTarget;
  filteredRules: RuleListItem[];
  isComposing: boolean;
  onClearSelection: () => void;
  onCompose: () => void;
  onComposeTargetChange: (target: ComposeTarget) => void;
  onToggleRule: (ruleId: string) => void;
  onToggleTag: (tag: string) => void;
  selectedComposeRuleIds: string[];
  selectedComposeTags: string[];
  t: TranslateFn;
};

export function ComposeView({
  availableTags,
  composeMatchingRules,
  composeResult,
  composeTarget,
  filteredRules,
  isComposing,
  onClearSelection,
  onCompose,
  onComposeTargetChange,
  onToggleRule,
  onToggleTag,
  selectedComposeRuleIds,
  selectedComposeTags,
  t,
}: ComposeViewProps) {
  return (
    <section className="split-view split-view-compose" aria-label={t("workspace.label")}>
      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="section-eyebrow">{t("compose.stageSelect")}</p>
            <h2>{t("compose.selectionTitle")}</h2>
            <p>{t("compose.stageSelectBody")}</p>
          </div>
          <button className="ghost-button" onClick={onClearSelection} type="button">
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
                  onClick={() => onToggleTag(tag)}
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
                    onChange={() => onToggleRule(rule.id)}
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
                onChange={(event) =>
                  onComposeTargetChange(event.target.value as ComposeTarget)
                }
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
                onClick={onCompose}
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
  );
}
