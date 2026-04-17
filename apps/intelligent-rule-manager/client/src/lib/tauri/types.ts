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
  resolved_tags?: string[];
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

export type ComposeTarget = "agents-md" | "trae-rule";

export type ComposeRequest = {
  target: ComposeTarget;
  rule_ids: string[];
  tags: string[];
  output_name?: string;
};

export type ComposedFile = {
  path: string;
  title: string;
  content: string;
};

export type ComposeResult = {
  target: ComposeTarget;
  export_root: string;
  selected_rule_ids: string[];
  selected_tags: string[];
  files: ComposedFile[];
};

export type WorkspaceSnapshot = {
  mode: "tauri" | "browser";
  healthcheck: Healthcheck;
  summary: WorkspaceSummary;
  rules: RuleListItem[];
  stats: RuleLibraryStats;
  recommendation: VisualizationRecommendation;
};
