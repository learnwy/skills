import { invoke } from "@tauri-apps/api/core";

export type Healthcheck = {
  ok: boolean;
  app: string;
  layer: string;
};

export type WorkspaceSummary = {
  storage_root: string;
  exports_dir: string;
  supported_artifacts: string[];
  supported_targets: string[];
};

export type RuleLibraryStats = {
  count: number;
  average_complexity: number;
  average_update_frequency: number;
  average_maintenance_cost: number;
  tag_count: number;
  group_count: number;
};

export type VisualizationRecommendation = {
  recommendation: string;
  score: number;
  stats: RuleLibraryStats;
  reasons: string[];
  suggested_features: string[];
};

export type RuleListItem = {
  id: string;
  title: string;
  summary: string;
  groups: string[];
  tags: string[];
  targets: string[];
  file: string;
};

export type RuleDocument = RuleListItem & {
  complexity: number;
  update_frequency: string;
  maintenance_cost: string;
  priority: number;
  last_reviewed: string;
  body: string;
};

export type NewRuleInput = {
  title: string;
  summary?: string;
  groups: string[];
  tags: string[];
  targets: string[];
};

type WorkspaceSnapshot = {
  mode: "tauri" | "browser";
  healthcheck: Healthcheck;
  summary: WorkspaceSummary;
  rules: RuleListItem[];
  stats: RuleLibraryStats;
  recommendation: VisualizationRecommendation;
};

const browserFallback: WorkspaceSnapshot = {
  mode: "browser",
  healthcheck: {
    ok: true,
    app: "intelligent-rule-manager",
    layer: "browser-fallback",
  },
  summary: {
    storage_root: "Unavailable in browser preview",
    exports_dir: "Unavailable in browser preview",
    supported_artifacts: ["single-rule", "rule-set", "config-file"],
    supported_targets: ["agents-md", "trae-rule", "generic"],
  },
  rules: [
    {
      id: "browser-preview-rule",
      title: "Browser Preview Rule",
      summary: "Fallback example shown when the app is running outside Tauri.",
      groups: ["preview"],
      tags: ["fallback"],
      targets: ["generic"],
      file: "Browser-only preview data",
    },
  ],
  stats: {
    count: 1,
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
      count: 1,
      average_complexity: 2,
      average_update_frequency: 2,
      average_maintenance_cost: 1,
      tag_count: 1,
      group_count: 1,
    },
    reasons: [
      "The current library is still small enough that a CLI-first workflow is efficient.",
    ],
    suggested_features: [
      "Keep using Markdown files plus the CLI for assembly and export.",
    ],
  },
};

let browserDocuments: RuleDocument[] = [
  {
    id: "browser-preview-rule",
    title: "Browser Preview Rule",
    summary: "Fallback example shown when the app is running outside Tauri.",
    groups: ["preview"],
    tags: ["fallback"],
    targets: ["generic"],
    complexity: 2,
    update_frequency: "occasional",
    maintenance_cost: "low",
    priority: 50,
    last_reviewed: "2026-04-16",
    file: "Browser-only preview data",
    body: [
      "# Intent",
      "",
      "Preview how the desktop app behaves before the Tauri runtime is attached.",
      "",
      "# Rule",
      "",
      "This sample rule lets the browser build stay interactive during local UI work.",
    ].join("\n"),
  },
];

function isTauriRuntime(): boolean {
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
    targets: document.targets,
    file: document.file,
  };
}

export async function getWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  if (!isTauriRuntime()) {
    return {
      ...browserFallback,
      rules: browserDocuments.map(asListItem),
      stats: {
        ...browserFallback.stats,
        count: browserDocuments.length,
      },
      recommendation: {
        ...browserFallback.recommendation,
        stats: {
          ...browserFallback.recommendation.stats,
          count: browserDocuments.length,
        },
      },
    };
  }

  const [healthcheck, summary, rules, stats, recommendation] = await Promise.all([
    invoke<Healthcheck>("healthcheck"),
    invoke<WorkspaceSummary>("workspace_summary"),
    invoke<RuleListItem[]>("list_rules"),
    invoke<RuleLibraryStats>("stats"),
    invoke<VisualizationRecommendation>("recommend_visualization"),
  ]);

  return {
    mode: "tauri",
    healthcheck,
    summary,
    rules,
    stats,
    recommendation,
  };
}

export async function loadRule(file: string): Promise<RuleDocument> {
  if (!isTauriRuntime()) {
    const document = browserDocuments.find((item) => item.file === file);
    if (!document) {
      throw new Error(`No browser fallback rule found for ${file}`);
    }
    return document;
  }

  return invoke<RuleDocument>("load_rule", { file });
}

export async function createRule(input: NewRuleInput): Promise<RuleDocument> {
  if (!isTauriRuntime()) {
    const title = input.title.trim();
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const created: RuleDocument = {
      id,
      title,
      summary: input.summary?.trim() || `Reusable rule for ${title.toLowerCase()}.`,
      groups: input.groups.length > 0 ? input.groups : ["shared"],
      tags: input.tags,
      targets: input.targets.length > 0 ? input.targets : ["agents-md", "trae-rule"],
      complexity: 2,
      update_frequency: "occasional",
      maintenance_cost: "low",
      priority: 50,
      last_reviewed: "2026-04-16",
      file: `Browser preview/${id}.md`,
      body: [
        "# Intent",
        "",
        "State the scenario or goal this rule is meant to support.",
        "",
        "# Rule",
        "",
        "Write the rule in normal Markdown so it stays compatible with AGENTS-style documents and Trae rule files.",
      ].join("\n"),
    };
    browserDocuments = [...browserDocuments, created];
    return created;
  }

  return invoke<RuleDocument>("create_rule", { input });
}

export async function saveRule(document: RuleDocument): Promise<RuleDocument> {
  if (!isTauriRuntime()) {
    browserDocuments = browserDocuments.map((item) =>
      item.file === document.file ? document : item,
    );
    return document;
  }

  return invoke<RuleDocument>("save_rule", { document });
}
