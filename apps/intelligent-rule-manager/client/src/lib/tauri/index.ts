import type { Locale } from "../i18n";
import {
  composeBrowserRules,
  createBrowserRule,
  getBrowserWorkspaceSnapshot,
  isTauriRuntime,
  loadBrowserRule,
  saveBrowserRule,
} from "./browser-runtime";
import {
  composeTauriRules,
  createTauriRule,
  getTauriWorkspaceSnapshot,
  loadTauriRule,
  saveTauriRule,
} from "./runtime-client";
import type {
  ComposeRequest,
  ComposeResult,
  NewRuleInput,
  RuleDocument,
  WorkspaceSnapshot,
} from "./types";

export * from "./types";

export async function getWorkspaceSnapshot(
  locale: Locale,
): Promise<WorkspaceSnapshot> {
  if (!isTauriRuntime()) {
    return getBrowserWorkspaceSnapshot(locale);
  }

  return getTauriWorkspaceSnapshot();
}

export async function loadRule(
  file: string,
  locale: Locale,
): Promise<RuleDocument> {
  if (!isTauriRuntime()) {
    return loadBrowserRule(file, locale);
  }

  return loadTauriRule(file);
}

export async function createRule(
  input: NewRuleInput,
  locale: Locale,
): Promise<RuleDocument> {
  if (!isTauriRuntime()) {
    return createBrowserRule(input, locale);
  }

  return createTauriRule(input);
}

export async function saveRule(document: RuleDocument): Promise<RuleDocument> {
  if (!isTauriRuntime()) {
    return saveBrowserRule(document);
  }

  return saveTauriRule(document);
}

export async function composeRules(
  request: ComposeRequest,
): Promise<ComposeResult> {
  if (!isTauriRuntime()) {
    return composeBrowserRules(request);
  }

  return composeTauriRules(request);
}
