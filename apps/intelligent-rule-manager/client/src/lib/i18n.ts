import {
  CLIENT_BROWSER_RECOMMENDATIONS,
  CLIENT_MESSAGES,
  CLIENT_RECOMMENDATION_LABELS,
  type Locale,
  type MessageKey,
  type RecommendationKey,
} from "./generated-i18n";

export type { Locale, MessageKey };

export function normalizeLocale(value?: string | null): Locale {
  const normalized = value?.toLowerCase() ?? "";
  return normalized.startsWith("zh") ? "zh-CN" : "en";
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") {
    return "en";
  }

  return normalizeLocale(navigator.language);
}

export function translate(
  locale: Locale,
  key: MessageKey,
  variables: Record<string, string | number> = {},
): string {
  const template = CLIENT_MESSAGES[locale][key] ?? CLIENT_MESSAGES.en[key];
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    String(variables[name] ?? `{${name}}`),
  );
}

export function recommendationLabel(
  locale: Locale,
  value?: string,
): string {
  if (!value) {
    return translate(locale, "facts.loading");
  }

  return CLIENT_RECOMMENDATION_LABELS[locale][value as RecommendationKey] ?? value;
}

export function browserRecommendation(locale: Locale, value: string) {
  return (
    CLIENT_BROWSER_RECOMMENDATIONS[locale][
      value as keyof (typeof CLIENT_BROWSER_RECOMMENDATIONS)[Locale]
    ] ?? CLIENT_BROWSER_RECOMMENDATIONS[locale]["cli-is-enough"]
  );
}
