export type Locale = "en" | "zh-CN";

type MessageKey =
  | "locale.label"
  | "locale.en"
  | "locale.zh-CN"
  | "hero.eyebrow"
  | "hero.title"
  | "hero.lede"
  | "status.foundation"
  | "status.runtime"
  | "status.runtimeValue"
  | "status.storage"
  | "status.storageLoading"
  | "status.ruleCount"
  | "status.ruleCountValue"
  | "status.ruleCountLoading"
  | "facts.capabilities"
  | "facts.supportedArtifacts"
  | "facts.libraryMetrics"
  | "facts.tags"
  | "facts.groups"
  | "facts.averageComplexity"
  | "facts.visualizationSignal"
  | "facts.recommendation"
  | "facts.score"
  | "facts.loading"
  | "insights.label"
  | "insights.why"
  | "insights.features"
  | "insights.targets"
  | "workspace.label"
  | "panel.library.title"
  | "panel.library.body"
  | "panel.workspace.title"
  | "panel.workspace.body"
  | "panel.inspector.title"
  | "panel.inspector.body"
  | "action.newRule"
  | "action.closeNewRule"
  | "action.saveChanges"
  | "action.saved"
  | "action.saving"
  | "action.createRule"
  | "action.creating"
  | "action.cancel"
  | "search.label"
  | "search.placeholder"
  | "filters.group"
  | "filters.tag"
  | "filters.target"
  | "filters.allGroups"
  | "filters.allTags"
  | "filters.allTargets"
  | "empty.loadingWorkspaceTitle"
  | "empty.loadingWorkspaceBody"
  | "empty.noMatchingRulesTitle"
  | "empty.noMatchingRulesBody"
  | "empty.noRulesTitle"
  | "empty.noRulesBody"
  | "empty.noDocumentTitle"
  | "empty.noDocumentBody"
  | "empty.noRuleSelectedTitle"
  | "empty.noRuleSelectedBody"
  | "rule.noSummary"
  | "create.title"
  | "create.fieldTitle"
  | "create.titlePlaceholder"
  | "create.fieldSummary"
  | "create.summaryPlaceholder"
  | "create.fieldGroups"
  | "create.groupsPlaceholder"
  | "create.fieldTags"
  | "create.tagsPlaceholder"
  | "create.fieldTargets"
  | "create.targetsPlaceholder"
  | "editor.bodyTitle"
  | "editor.bodyField"
  | "editor.previewTitle"
  | "editor.previewLoading"
  | "inspector.metaTitle"
  | "inspector.fileTitle"
  | "milestones.label"
  | "milestone.composeExport"
  | "milestone.previewPolish"
  | "milestone.smokeTest"
  | "errors.workspaceLoad"
  | "errors.ruleLoad"
  | "errors.createRule"
  | "errors.saveRule"
  | "browser.storageUnavailable"
  | "browser.exportsUnavailable"
  | "browser.previewRuleTitle"
  | "browser.previewRuleSummary"
  | "browser.previewRuleFile"
  | "browser.previewRuleIntent"
  | "browser.previewRuleBody"
  | "browser.createdSummary"
  | "browser.createdFile"
  | "browser.newRuleIntent"
  | "browser.newRuleBody"
  | "browser.ruleNotFound";

type Dictionary = Record<MessageKey, string>;

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    "locale.label": "Language",
    "locale.en": "English",
    "locale.zh-CN": "简体中文",
    "hero.eyebrow": "Tauri + React + Rust workspace",
    "hero.title": "Intelligent Rule Manager",
    "hero.lede":
      "A cross-platform desktop app for browsing, editing, composing, and exporting Markdown rule libraries backed by a shared Rust core and CLI.",
    "status.foundation": "Current foundation",
    "status.runtime": "Runtime",
    "status.runtimeValue": "Running in {mode} mode with data from {layer}.",
    "status.storage": "Storage model",
    "status.storageLoading": "Loading storage root from rule-core workspace summary...",
    "status.ruleCount": "Rule count",
    "status.ruleCountValue": "{count} discovered rule{suffix}",
    "status.ruleCountLoading": "Loading discovered rules from rule-core...",
    "facts.capabilities": "Workspace capabilities",
    "facts.supportedArtifacts": "Supported artifacts",
    "facts.libraryMetrics": "Library metrics",
    "facts.tags": "Tags: {count}",
    "facts.groups": "Groups: {count}",
    "facts.averageComplexity": "Avg complexity: {value}",
    "facts.visualizationSignal": "Visualization signal",
    "facts.recommendation": "Recommendation: {value}",
    "facts.score": "Score: {value}",
    "facts.loading": "loading",
    "insights.label": "Recommendation insights",
    "insights.why": "Why this recommendation",
    "insights.features": "Suggested capabilities",
    "insights.targets": "Supported targets",
    "workspace.label": "Rule manager workspace",
    "panel.library.title": "Library",
    "panel.library.body":
      "Search, group, tag, and target filters make the file-backed rule store navigable.",
    "panel.workspace.title": "Workspace",
    "panel.workspace.body":
      "Create new rules, edit body content, and review a live preview before saving.",
    "panel.inspector.title": "Inspector",
    "panel.inspector.body":
      "Metadata editing stays visible while the body editor remains in the main workspace.",
    "action.newRule": "New rule",
    "action.closeNewRule": "Close new rule",
    "action.saveChanges": "Save changes",
    "action.saved": "Saved",
    "action.saving": "Saving...",
    "action.createRule": "Create rule",
    "action.creating": "Creating...",
    "action.cancel": "Cancel",
    "search.label": "Search rules",
    "search.placeholder": "Search by title, id, tag, or group",
    "filters.group": "Group",
    "filters.tag": "Tag",
    "filters.target": "Target",
    "filters.allGroups": "All groups",
    "filters.allTags": "All tags",
    "filters.allTargets": "All targets",
    "empty.loadingWorkspaceTitle": "Loading workspace",
    "empty.loadingWorkspaceBody": "Fetching the current rule library summary and list.",
    "empty.noMatchingRulesTitle": "No matching rules",
    "empty.noMatchingRulesBody":
      "Try a broader search term or reset one of the active filters.",
    "empty.noRulesTitle": "No rules discovered yet",
    "empty.noRulesBody":
      "Create Markdown rule files in the resolved rule storage root to populate this list.",
    "empty.noDocumentTitle": "No document loaded",
    "empty.noDocumentBody": "Select a rule to edit its body or open the new-rule form.",
    "empty.noRuleSelectedTitle": "No rule selected",
    "empty.noRuleSelectedBody":
      "Select a rule from the library pane to inspect and edit it here.",
    "rule.noSummary": "No summary yet.",
    "create.title": "Create rule from template",
    "create.fieldTitle": "Title",
    "create.titlePlaceholder": "TypeScript Import Hygiene",
    "create.fieldSummary": "Summary",
    "create.summaryPlaceholder": "One sentence explaining the purpose of the rule.",
    "create.fieldGroups": "Groups",
    "create.groupsPlaceholder": "shared, frontend",
    "create.fieldTags": "Tags",
    "create.tagsPlaceholder": "typescript, imports, lint",
    "create.fieldTargets": "Targets",
    "create.targetsPlaceholder": "agents-md, trae-rule",
    "editor.bodyTitle": "Body editor",
    "editor.bodyField": "Markdown body",
    "editor.previewTitle": "Live body preview",
    "editor.previewLoading": "Loading the selected rule document...",
    "inspector.metaTitle": "Metadata editor",
    "inspector.fileTitle": "File",
    "milestones.label": "Next milestones",
    "milestone.composeExport": "Implement rule compose and export actions from the shared Rust core",
    "milestone.previewPolish": "Add validation polish and richer markdown preview rendering",
    "milestone.smokeTest": "Run a full Tauri smoke test against the desktop shell",
    "errors.workspaceLoad": "Unknown workspace loading error",
    "errors.ruleLoad": "Unknown rule loading error",
    "errors.createRule": "Unknown create rule error",
    "errors.saveRule": "Unknown save rule error",
    "browser.storageUnavailable": "Unavailable in browser preview",
    "browser.exportsUnavailable": "Unavailable in browser preview",
    "browser.previewRuleTitle": "Browser Preview Rule",
    "browser.previewRuleSummary": "Fallback example shown when the app is running outside Tauri.",
    "browser.previewRuleFile": "Browser-only preview data",
    "browser.previewRuleIntent": "Preview how the desktop app behaves before the Tauri runtime is attached.",
    "browser.previewRuleBody": "This sample rule lets the browser build stay interactive during local UI work.",
    "browser.createdSummary": "Reusable rule for {title}.",
    "browser.createdFile": "Browser preview/{id}.md",
    "browser.newRuleIntent": "State the scenario or goal this rule is meant to support.",
    "browser.newRuleBody":
      "Write the rule in normal Markdown so it stays compatible with AGENTS-style documents and Trae rule files.",
    "browser.ruleNotFound": "No browser fallback rule found for {file}",
  },
  "zh-CN": {
    "locale.label": "语言",
    "locale.en": "English",
    "locale.zh-CN": "简体中文",
    "hero.eyebrow": "Tauri + React + Rust 工作区",
    "hero.title": "智能规则管理器",
    "hero.lede": "一个跨平台桌面应用，用于浏览、编辑、组合和导出 Markdown 规则库，底层由共享的 Rust Core 和 CLI 驱动。",
    "status.foundation": "当前基础状态",
    "status.runtime": "运行时",
    "status.runtimeValue": "当前运行在 {mode} 模式，数据来自 {layer}。",
    "status.storage": "存储模型",
    "status.storageLoading": "正在从 rule-core 工作区摘要加载规则根目录...",
    "status.ruleCount": "规则数量",
    "status.ruleCountValue": "已发现 {count} 条规则",
    "status.ruleCountLoading": "正在从 rule-core 加载规则列表...",
    "facts.capabilities": "工作区能力",
    "facts.supportedArtifacts": "支持的产物",
    "facts.libraryMetrics": "规则库指标",
    "facts.tags": "标签：{count}",
    "facts.groups": "分组：{count}",
    "facts.averageComplexity": "平均复杂度：{value}",
    "facts.visualizationSignal": "可视化信号",
    "facts.recommendation": "建议：{value}",
    "facts.score": "分数：{value}",
    "facts.loading": "加载中",
    "insights.label": "建议洞察",
    "insights.why": "为什么给出这个建议",
    "insights.features": "建议能力",
    "insights.targets": "支持的目标",
    "workspace.label": "规则管理工作区",
    "panel.library.title": "规则库",
    "panel.library.body": "通过搜索、分组、标签和目标过滤，让基于文件的规则库更容易浏览。",
    "panel.workspace.title": "工作区",
    "panel.workspace.body": "创建新规则、编辑正文内容，并在保存前查看实时预览。",
    "panel.inspector.title": "检查器",
    "panel.inspector.body": "在主工作区编辑正文的同时，元数据编辑始终保持可见。",
    "action.newRule": "新建规则",
    "action.closeNewRule": "关闭新建规则",
    "action.saveChanges": "保存修改",
    "action.saved": "已保存",
    "action.saving": "保存中...",
    "action.createRule": "创建规则",
    "action.creating": "创建中...",
    "action.cancel": "取消",
    "search.label": "搜索规则",
    "search.placeholder": "按标题、ID、标签或分组搜索",
    "filters.group": "分组",
    "filters.tag": "标签",
    "filters.target": "目标",
    "filters.allGroups": "全部分组",
    "filters.allTags": "全部标签",
    "filters.allTargets": "全部目标",
    "empty.loadingWorkspaceTitle": "正在加载工作区",
    "empty.loadingWorkspaceBody": "正在获取当前规则库摘要和列表。",
    "empty.noMatchingRulesTitle": "没有匹配的规则",
    "empty.noMatchingRulesBody": "试试更宽的搜索词，或者重置当前的过滤条件。",
    "empty.noRulesTitle": "还没有发现任何规则",
    "empty.noRulesBody": "请在解析后的规则根目录中创建 Markdown 规则文件以填充此列表。",
    "empty.noDocumentTitle": "没有加载文档",
    "empty.noDocumentBody": "选择一条规则来编辑正文，或者打开新建规则表单。",
    "empty.noRuleSelectedTitle": "未选择规则",
    "empty.noRuleSelectedBody": "请先从规则库面板中选择一条规则，再在这里查看和编辑。",
    "rule.noSummary": "还没有摘要。",
    "create.title": "从模板创建规则",
    "create.fieldTitle": "标题",
    "create.titlePlaceholder": "TypeScript Import Hygiene",
    "create.fieldSummary": "摘要",
    "create.summaryPlaceholder": "用一句话说明这条规则的作用。",
    "create.fieldGroups": "分组",
    "create.groupsPlaceholder": "shared, frontend",
    "create.fieldTags": "标签",
    "create.tagsPlaceholder": "typescript, imports, lint",
    "create.fieldTargets": "目标",
    "create.targetsPlaceholder": "agents-md, trae-rule",
    "editor.bodyTitle": "正文编辑器",
    "editor.bodyField": "Markdown 正文",
    "editor.previewTitle": "正文实时预览",
    "editor.previewLoading": "正在加载所选规则文档...",
    "inspector.metaTitle": "元数据编辑器",
    "inspector.fileTitle": "文件",
    "milestones.label": "下一步里程碑",
    "milestone.composeExport": "基于共享 Rust Core 实现规则组合与导出动作",
    "milestone.previewPolish": "补充校验打磨与更丰富的 Markdown 预览渲染",
    "milestone.smokeTest": "针对桌面壳运行一次完整的 Tauri 冒烟测试",
    "errors.workspaceLoad": "未知的工作区加载错误",
    "errors.ruleLoad": "未知的规则加载错误",
    "errors.createRule": "未知的创建规则错误",
    "errors.saveRule": "未知的保存规则错误",
    "browser.storageUnavailable": "浏览器预览模式下不可用",
    "browser.exportsUnavailable": "浏览器预览模式下不可用",
    "browser.previewRuleTitle": "浏览器预览规则",
    "browser.previewRuleSummary": "当应用运行在 Tauri 之外时展示的回退示例。",
    "browser.previewRuleFile": "仅浏览器预览数据",
    "browser.previewRuleIntent": "在接入 Tauri 运行时之前，先预览桌面应用的行为。",
    "browser.previewRuleBody": "这条示例规则让浏览器构建在本地 UI 开发时也能保持可交互。",
    "browser.createdSummary": "用于 {title} 的可复用规则。",
    "browser.createdFile": "浏览器预览/{id}.md",
    "browser.newRuleIntent": "说明这条规则要支持的场景或目标。",
    "browser.newRuleBody": "请使用普通 Markdown 编写规则内容，以兼容 AGENTS 风格文档和 Trae 规则文件。",
    "browser.ruleNotFound": "没有找到对应 {file} 的浏览器回退规则",
  },
};

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
  const template = dictionaries[locale][key] ?? dictionaries.en[key];
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    String(variables[name] ?? `{${name}}`),
  );
}

export function recommendationLabel(
  locale: Locale,
  value?: string,
): string {
  const map: Record<string, string> =
    locale === "zh-CN"
      ? {
          "cli-is-enough": "CLI 已足够",
          "consider-macos-app-soon": "建议尽快做桌面应用",
          "build-macos-app": "应该构建桌面应用",
        }
      : {
          "cli-is-enough": "CLI is enough",
          "consider-macos-app-soon": "Consider a desktop app soon",
          "build-macos-app": "Build a desktop app",
        };

  return value ? map[value] ?? value : translate(locale, "facts.loading");
}
