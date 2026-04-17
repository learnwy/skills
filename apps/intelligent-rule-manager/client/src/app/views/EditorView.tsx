import type { NewRuleInput, RuleDocument } from "../../lib/tauri";
import type { PanelCopy, TranslateFn } from "../types";
import { CreateRuleForm } from "./CreateRuleForm";
import { RuleMetadataEditor } from "./RuleMetadataEditor";

type EditorViewProps = {
  createForm: NewRuleInput;
  draftDocument: RuleDocument | null;
  isCreateOpen: boolean;
  isCreating: boolean;
  isDirty: boolean;
  isLoadingDocument: boolean;
  onCancelCreate: () => void;
  onChangeCreateForm: (
    updater: (form: NewRuleInput) => NewRuleInput,
  ) => void;
  onChangeDraftDocument: (
    updater: (document: RuleDocument | null) => RuleDocument | null,
  ) => void;
  onCreateRule: () => void;
  onOpenCreate: () => void;
  panels: PanelCopy[];
  selectedFile: string;
  t: TranslateFn;
};

export function EditorView({
  createForm,
  draftDocument,
  isCreateOpen,
  isCreating,
  isDirty,
  isLoadingDocument,
  onCancelCreate,
  onChangeCreateForm,
  onChangeDraftDocument,
  onCreateRule,
  onOpenCreate,
  panels,
  selectedFile,
  t,
}: EditorViewProps) {
  return (
    <section className="split-view split-view-editor" aria-label={t("workspace.label")}>
      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="section-eyebrow">{t("panel.workspace.title")}</p>
            <h2>{panels[1].title}</h2>
            <p>{panels[1].body}</p>
          </div>
          {isCreateOpen ? null : (
            <button className="ghost-button" onClick={onOpenCreate} type="button">
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
          <CreateRuleForm
            createForm={createForm}
            isCreating={isCreating}
            onCancel={onCancelCreate}
            onChange={onChangeCreateForm}
            onCreate={onCreateRule}
            t={t}
          />
        ) : draftDocument ? (
          <div className="editor-stack">
            <div className="detail-block detail-block-editor">
              <h3>{t("editor.bodyTitle")}</h3>
              <label className="field">
                <span>{t("editor.bodyField")}</span>
                <textarea
                  className="body-editor"
                  onChange={(event) =>
                    onChangeDraftDocument((document) =>
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

      <RuleMetadataEditor
        document={draftDocument}
        inspectorPanel={panels[2]}
        onChangeDocument={onChangeDraftDocument}
        t={t}
      />
    </section>
  );
}
