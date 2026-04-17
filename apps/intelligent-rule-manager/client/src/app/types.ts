import type { MessageKey } from "../lib/i18n";

export type WorkspaceView = "overview" | "library" | "editor" | "compose";

export type TranslateFn = (
  key: MessageKey,
  variables?: Record<string, string | number>,
) => string;

export type ViewTab = {
  id: WorkspaceView;
  label: string;
};

export type ViewMeta = {
  label: string;
  description: string;
  eyebrow: string;
};

export type PanelCopy = {
  title: string;
  body: string;
};
