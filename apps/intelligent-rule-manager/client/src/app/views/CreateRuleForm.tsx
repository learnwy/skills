import type { NewRuleInput } from "../../lib/tauri";
import { joinValues, splitCommaSeparated } from "../helpers";
import type { TranslateFn } from "../types";

type CreateRuleFormProps = {
  createForm: NewRuleInput;
  isCreating: boolean;
  onCancel: () => void;
  onChange: (updater: (form: NewRuleInput) => NewRuleInput) => void;
  onCreate: () => void;
  t: TranslateFn;
};

export function CreateRuleForm({
  createForm,
  isCreating,
  onCancel,
  onChange,
  onCreate,
  t,
}: CreateRuleFormProps) {
  return (
    <div className="editor-stack">
      <div className="detail-block">
        <h3>{t("create.title")}</h3>
        <div className="field-grid">
          <label className="field">
            <span>{t("create.fieldTitle")}</span>
            <input
              onChange={(event) =>
                onChange((form) => ({
                  ...form,
                  title: event.target.value,
                }))
              }
              placeholder={t("create.titlePlaceholder")}
              value={createForm.title}
            />
          </label>

          <label className="field">
            <span>{t("create.fieldSummary")}</span>
            <input
              onChange={(event) =>
                onChange((form) => ({
                  ...form,
                  summary: event.target.value,
                }))
              }
              placeholder={t("create.summaryPlaceholder")}
              value={createForm.summary ?? ""}
            />
          </label>

          <label className="field">
            <span>{t("create.fieldGroups")}</span>
            <input
              onChange={(event) =>
                onChange((form) => ({
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
                onChange((form) => ({
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
                onChange((form) => ({
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
            onClick={onCreate}
            type="button"
          >
            {isCreating ? t("action.creating") : t("action.createRule")}
          </button>
          <button className="ghost-button" onClick={onCancel} type="button">
            {t("action.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
