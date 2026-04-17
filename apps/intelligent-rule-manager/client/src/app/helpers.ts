import type { NewRuleInput, RuleDocument, RuleListItem } from "../lib/tauri";
import type { TranslateFn } from "./types";

export const defaultCreateForm: NewRuleInput = {
  title: "",
  summary: "",
  groups: ["shared"],
  tags: [],
  targets: ["agents-md", "trae-rule"],
};

export function splitCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function joinValues(values: string[]): string {
  return values.join(", ");
}

export function getFilterTags(rule: RuleListItem): string[] {
  return rule.resolved_tags && rule.resolved_tags.length > 0
    ? rule.resolved_tags
    : rule.tags;
}

export function excerptBody(body?: string): string {
  if (!body) {
    return "";
  }

  return body.length > 360 ? `${body.slice(0, 360)}...` : body;
}

export function getSelectedRulePresentation(
  draftDocument: RuleDocument | null,
  selectedDocument: RuleDocument | null,
  selectedRule: RuleListItem | null,
  t: TranslateFn,
) {
  return {
    selectedSummary:
      draftDocument?.summary || selectedRule?.summary || t("rule.noSummary"),
    selectedFile: draftDocument?.file || selectedRule?.file || "",
    previewBody: draftDocument?.body || selectedDocument?.body || "",
    selectedFilterTags: selectedRule ? getFilterTags(selectedRule) : [],
  };
}
