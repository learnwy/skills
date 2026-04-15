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

type WorkspaceSnapshot = {
  mode: "tauri" | "browser";
  healthcheck: Healthcheck;
  summary: WorkspaceSummary;
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
};

function isTauriRuntime(): boolean {
  const candidate = window as Window & {
    __TAURI_INTERNALS__?: unknown;
  };

  return Boolean(candidate.__TAURI_INTERNALS__);
}

export async function getWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  if (!isTauriRuntime()) {
    return browserFallback;
  }

  const [healthcheck, summary] = await Promise.all([
    invoke<Healthcheck>("healthcheck"),
    invoke<WorkspaceSummary>("workspace_summary"),
  ]);

  return {
    mode: "tauri",
    healthcheck,
    summary,
  };
}

