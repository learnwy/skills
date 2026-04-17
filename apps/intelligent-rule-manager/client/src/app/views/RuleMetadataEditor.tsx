import type { RuleDocument } from "../../lib/tauri";
import { joinValues, splitCommaSeparated } from "../helpers";
import type { PanelCopy, TranslateFn } from "../types";

type RuleMetadataEditorProps = {
  document: RuleDocument | null;
  inspectorPanel: PanelCopy;
  t: TranslateFn;
  onChangeDocument: (
    updater: (document: RuleDocument | null) => RuleDocument | null,
  ) => void;
};

export function RuleMetadataEditor({
  document,
  inspectorPanel,
  t,
  onChangeDocument,
}: RuleMetadataEditorProps) {
  return (
    <article className="panel panel-inspector">
      <div className="panel-header">
        <div>
          <p className="section-eyebrow">{t("panel.inspector.title")}</p>
          <h2>{t("inspector.metaTitle")}</h2>
          <p>{inspectorPanel.body}</p>
        </div>
      </div>

      {document ? (
        <div className="editor-stack">
          <div className="detail-block">
            <div className="field-grid">
              <label className="field">
                <span>{t("create.fieldTitle")}</span>
                <input
                  onChange={(event) =>
                    onChangeDocument((current) =>
                      current ? { ...current, title: event.target.value } : current,
                    )
                  }
                  value={document.title}
                />
              </label>

              <label className="field">
                <span>{t("create.fieldSummary")}</span>
                <input
                  onChange={(event) =>
                    onChangeDocument((current) =>
                      current ? { ...current, summary: event.target.value } : current,
                    )
                  }
                  value={document.summary}
                />
              </label>

              <label className="field">
                <span>{t("create.fieldGroups")}</span>
                <input
                  onChange={(event) =>
                    onChangeDocument((current) =>
                      current
                        ? {
                            ...current,
                            groups: splitCommaSeparated(event.target.value),
                          }
                        : current,
                    )
                  }
                  value={joinValues(document.groups)}
                />
              </label>

              <label className="field">
                <span>{t("create.fieldTags")}</span>
                <input
                  onChange={(event) =>
                    onChangeDocument((current) =>
                      current
                        ? {
                            ...current,
                            tags: splitCommaSeparated(event.target.value),
                          }
                        : current,
                    )
                  }
                  value={joinValues(document.tags)}
                />
              </label>

              <label className="field">
                <span>{t("create.fieldTargets")}</span>
                <input
                  onChange={(event) =>
                    onChangeDocument((current) =>
                      current
                        ? {
                            ...current,
                            targets: splitCommaSeparated(event.target.value),
                          }
                        : current,
                    )
                  }
                  value={joinValues(document.targets)}
                />
              </label>
            </div>
          </div>

          <div className="detail-block">
            <h3>{t("inspector.fileTitle")}</h3>
            <p>{document.file}</p>
          </div>

          <div className="detail-block">
            <h3>{t("compose.matchingRules")}</h3>
            <div className="token-row">
              {document.targets.map((target) => (
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
  );
}
