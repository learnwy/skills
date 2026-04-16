import {
  EXTENSION_RUNTIME_MESSAGES,
  type ExtensionRuntimeKey,
  type Locale,
} from "./generated-i18n";

export type { Locale, ExtensionRuntimeKey };

export function normalizeLocale(value?: string | null): Locale {
  const normalized = value?.toLowerCase() ?? "";
  return normalized.startsWith("zh") ? "zh-CN" : "en";
}

export function translate(
  locale: Locale,
  key: ExtensionRuntimeKey,
  variables: Record<string, string | number> = {},
): string {
  const template = EXTENSION_RUNTIME_MESSAGES[locale][key] ?? EXTENSION_RUNTIME_MESSAGES.en[key];
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    String(variables[name] ?? `{${name}}`),
  );
}
