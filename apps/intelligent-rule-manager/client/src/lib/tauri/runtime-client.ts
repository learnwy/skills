import { invoke } from "@tauri-apps/api/core";
import type {
  ComposeRequest,
  ComposeResult,
  Healthcheck,
  NewRuleInput,
  RuleDocument,
  RuleLibraryStats,
  RuleListItem,
  VisualizationRecommendation,
  WorkspaceSnapshot,
  WorkspaceSummary,
} from "./types";

export async function getTauriWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
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

export function loadTauriRule(file: string): Promise<RuleDocument> {
  return invoke<RuleDocument>("load_rule", { file });
}

export function createTauriRule(input: NewRuleInput): Promise<RuleDocument> {
  return invoke<RuleDocument>("create_rule", { input });
}

export function saveTauriRule(document: RuleDocument): Promise<RuleDocument> {
  return invoke<RuleDocument>("save_rule", { document });
}

export function composeTauriRules(
  request: ComposeRequest,
): Promise<ComposeResult> {
  return invoke<ComposeResult>("compose_rules", { request });
}
