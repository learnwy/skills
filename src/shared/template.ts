export type TemplateMapping = Record<string, string>;

const PLACEHOLDER_RE = /\{\{(\w+)\}\}/g;

export function render(template: string, mapping: TemplateMapping): string {
  return template.replace(PLACEHOLDER_RE, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(mapping, key) ? mapping[key] : `{{${key}}}`,
  );
}
