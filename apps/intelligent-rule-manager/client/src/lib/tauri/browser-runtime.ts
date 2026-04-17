import { browserRecommendation, type Locale, translate } from "../i18n";
import type {
  ComposeRequest,
  ComposeResult,
  NewRuleInput,
  RuleDocument,
  RuleListItem,
  WorkspaceSnapshot,
} from "./types";

function makeBrowserDocuments(locale: Locale): RuleDocument[] {
  return [
    {
      id: "browser-preview-rule",
      title: translate(locale, "browser.previewRuleTitle"),
      summary: translate(locale, "browser.previewRuleSummary"),
      groups: ["preview"],
      tags: ["fallback"],
      targets: ["generic"],
      complexity: 2,
      update_frequency: "occasional",
      maintenance_cost: "low",
      priority: 50,
      last_reviewed: "2026-04-16",
      file: translate(locale, "browser.previewRuleFile"),
      body: [
        "# Intent",
        "",
        translate(locale, "browser.previewRuleIntent"),
        "",
        "# Rule",
        "",
        translate(locale, "browser.previewRuleBody"),
      ].join("\n"),
    },
  ];
}

let browserDocuments = makeBrowserDocuments("en");

export function isTauriRuntime(): boolean {
  const candidate = window as Window & {
    __TAURI_INTERNALS__?: unknown;
  };

  return Boolean(candidate.__TAURI_INTERNALS__);
}

function asListItem(document: RuleDocument): RuleListItem {
  return {
    id: document.id,
    title: document.title,
    summary: document.summary,
    groups: document.groups,
    tags: document.tags,
    resolved_tags: document.tags,
    targets: document.targets,
    file: document.file,
  };
}

export function getBrowserWorkspaceSnapshot(locale: Locale): WorkspaceSnapshot {
  browserDocuments = makeBrowserDocuments(locale);

  return {
    mode: "browser",
    healthcheck: {
      ok: true,
      app: "intelligent-rule-manager",
      layer: "browser-fallback",
    },
    summary: {
      storage_root: translate(locale, "browser.storageUnavailable"),
      exports_dir: translate(locale, "browser.exportsUnavailable"),
      supported_artifacts: ["single-rule", "rule-set", "config-file"],
      supported_targets: ["agents-md", "trae-rule", "generic"],
    },
    rules: browserDocuments.map(asListItem),
    stats: {
      count: browserDocuments.length,
      average_complexity: 2,
      average_update_frequency: 2,
      average_maintenance_cost: 1,
      tag_count: 1,
      group_count: 1,
    },
    recommendation: {
      recommendation: "cli-is-enough",
      score: 19,
      stats: {
        count: browserDocuments.length,
        average_complexity: 2,
        average_update_frequency: 2,
        average_maintenance_cost: 1,
        tag_count: 1,
        group_count: 1,
      },
      reasons: [...browserRecommendation(locale, "cli-is-enough").reasons],
      suggested_features: [
        ...browserRecommendation(locale, "cli-is-enough").suggestedFeatures,
      ],
    },
  };
}

export function loadBrowserRule(file: string, locale: Locale): RuleDocument {
  const document = browserDocuments.find((item) => item.file === file);
  if (!document) {
    throw new Error(translate(locale, "browser.ruleNotFound", { file }));
  }
  return document;
}

export function createBrowserRule(
  input: NewRuleInput,
  locale: Locale,
): RuleDocument {
  const title = input.title.trim();
  const id = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const created: RuleDocument = {
    id,
    title,
    summary:
      input.summary?.trim() ||
      translate(locale, "browser.createdSummary", {
        title: title.toLowerCase(),
      }),
    groups: input.groups.length > 0 ? input.groups : ["shared"],
    tags: input.tags,
    targets: input.targets.length > 0 ? input.targets : ["agents-md", "trae-rule"],
    complexity: 2,
    update_frequency: "occasional",
    maintenance_cost: "low",
    priority: 50,
    last_reviewed: "2026-04-16",
    file: translate(locale, "browser.createdFile", { id }),
    body: [
      "# Intent",
      "",
      translate(locale, "browser.newRuleIntent"),
      "",
      "# Rule",
      "",
      translate(locale, "browser.newRuleBody"),
    ].join("\n"),
  };

  browserDocuments = [...browserDocuments, created];
  return created;
}

export function saveBrowserRule(document: RuleDocument): RuleDocument {
  browserDocuments = browserDocuments.map((item) =>
    item.file === document.file ? document : item,
  );

  return document;
}

export function composeBrowserRules(request: ComposeRequest): ComposeResult {
  const fallbackName = request.output_name?.trim() || `preview-${request.target}`;
  const fallbackPath =
    request.target === "agents-md"
      ? `browser preview/exports/${fallbackName}/AGENTS.md`
      : `browser preview/exports/${fallbackName}/.trae/rules/browser-preview-rule.md`;

  return {
    target: request.target,
    export_root: translate("en", "browser.exportsUnavailable"),
    selected_rule_ids: request.rule_ids,
    selected_tags: request.tags,
    files: [
      {
        path: fallbackPath,
        title: request.target === "agents-md" ? "AGENTS.md" : "Browser Preview Rule",
        content:
          request.target === "agents-md"
            ? "# AGENTS.md\n\nBrowser preview export.\n"
            : "---\ndescription: \"Browser preview export\"\nalwaysApply: false\n---\n\n# Browser Preview Rule\n",
      },
    ],
  };
}
