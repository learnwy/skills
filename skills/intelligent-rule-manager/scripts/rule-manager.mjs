#!/usr/bin/env node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const DEFAULT_AGENTS_HOME = path.join(os.homedir(), ".agents");
const AGENTS_HOME = process.env.AGENTS_HOME
  ? path.resolve(process.env.AGENTS_HOME)
  : DEFAULT_AGENTS_HOME;
const RULES_ROOT = path.join(AGENTS_HOME, "rules");
const EXPORTS_DIR = path.join(RULES_ROOT, "exports");
const UPDATE_FREQUENCY_SCORES = {
  rare: 1,
  occasional: 2,
  monthly: 3,
  weekly: 4,
  frequent: 5,
};
const MAINTENANCE_COST_SCORES = {
  low: 1,
  medium: 2,
  high: 3,
  "very-high": 4,
};

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  try {
    switch (command) {
      case "init":
        await initStorage();
        return;
      case "create":
        await createRule(args);
        return;
      case "list":
        await listRulesCommand(args);
        return;
      case "inspect":
        await inspectRuleCommand(args);
        return;
      case "stats":
        await statsCommand(args);
        return;
      case "decide":
        await decideCommand(args);
        return;
      case "compose":
        await composeCommand(args);
        return;
      case "recommend-visualization":
        await recommendVisualizationCommand(args);
        return;
      case "help":
      case undefined:
        printHelp();
        return;
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error(formatOutput({ error: error.message }, args.format ?? "json"));
    process.exitCode = 1;
  }
}

function printHelp() {
  const help = `
Rule manager CLI

Commands:
  init
  create --title "Rule title" [--group frontend] [--tags a,b] [--targets agents-md,trae-rule]
  list [--tags a,b] [--groups x,y] [--target trae-rule] [--format json|markdown]
  inspect --id rule-id
  stats [--format json|markdown]
  decide --objective "..." [--artifact single-rule|rule-set|config-file] [--target agents-md]
  compose --objective "..." [--artifact single-rule|rule-set|config-file] [--mode auto|script|ai-prep]
  recommend-visualization [--format json|markdown]

Environment:
  AGENTS_HOME=/custom/path   Source root becomes $AGENTS_HOME/rules
  Default storage root       ~/.agents/rules
`;
  console.log(help.trim());
}

async function initStorage() {
  await fs.mkdir(RULES_ROOT, { recursive: true });
  await fs.mkdir(EXPORTS_DIR, { recursive: true });
  const readmePath = path.join(RULES_ROOT, "README.md");
  const existing = await safeReadFile(readmePath);
  if (!existing) {
    const readme = [
      "# Global Rule Library",
      "",
      `Storage root: \`${RULES_ROOT}\``,
      "",
      "- Put one Markdown rule per file.",
      "- Use YAML frontmatter for `tags`, `groups`, `targets`, `complexity`, `update_frequency`, and `maintenance_cost`.",
      "- Generated exports can be written to `exports/`.",
      "",
      "This directory is compatible with AGENTS-style and Trae-style Markdown rules because the body of each file is normal Markdown.",
      "",
    ].join("\n");
    await fs.writeFile(readmePath, readme, "utf8");
  }
  console.log(
    formatOutput(
      {
        ok: true,
        storage_root: RULES_ROOT,
        exports_dir: EXPORTS_DIR,
      },
      "json",
    ),
  );
}

async function createRule(args) {
  const title = requireString(args.title, "--title is required");
  const id = slugify(args.id ?? title);
  const groupList = toList(args.group ?? args.groups ?? "shared");
  const tags = toList(args.tags);
  const targets = toList(args.targets || "agents-md,trae-rule");
  const complexity = clampNumber(args.complexity ?? 2, 1, 5);
  const updateFrequency = normalizeEnum(
    args.updateFrequency ?? args["update-frequency"] ?? "occasional",
    Object.keys(UPDATE_FREQUENCY_SCORES),
    "update frequency",
  );
  const maintenanceCost = normalizeEnum(
    args.maintenanceCost ?? args["maintenance-cost"] ?? "low",
    Object.keys(MAINTENANCE_COST_SCORES),
    "maintenance cost",
  );
  await fs.mkdir(RULES_ROOT, { recursive: true });
  const filePath = path.join(RULES_ROOT, `${id}.md`);
  const body = buildRuleTemplate({
    id,
    title,
    summary:
      args.summary ??
      `Reusable rule for ${title.toLowerCase()} across agent workflows.`,
    groups: groupList,
    tags,
    targets,
    complexity,
    update_frequency: updateFrequency,
    maintenance_cost: maintenanceCost,
    priority: Number(args.priority ?? 50),
    last_reviewed: args.lastReviewed ?? args["last-reviewed"] ?? today(),
  });
  await fs.writeFile(filePath, body, "utf8");
  console.log(
    formatOutput(
      {
        ok: true,
        file: filePath,
        id,
        title,
      },
      args.format ?? "json",
    ),
  );
}

async function listRulesCommand(args) {
  const rules = await loadRules();
  const filtered = filterRules(rules, {
    tags: toList(args.tags),
    groups: toList(args.groups ?? args.group),
    target: args.target,
  });
  console.log(formatOutput({ count: filtered.length, rules: summarizeRules(filtered) }, args.format ?? "markdown"));
}

async function inspectRuleCommand(args) {
  const id = requireString(args.id, "--id is required");
  const rules = await loadRules();
  const rule = rules.find((item) => item.meta.id === id || item.fileName === `${id}.md`);
  if (!rule) {
    throw new Error(`Rule not found: ${id}`);
  }
  console.log(
    formatOutput(
      {
        file: rule.path,
        metadata: rule.meta,
        body: rule.body.trim(),
      },
      args.format ?? "json",
    ),
  );
}

async function statsCommand(args) {
  const rules = await loadRules();
  const stats = buildStats(rules);
  console.log(formatOutput(stats, args.format ?? "json"));
}

async function decideCommand(args) {
  const objective = requireString(args.objective, "--objective is required");
  const rules = await loadRules();
  const filtered = filterRules(rules, {
    tags: toList(args.tags),
    groups: toList(args.groups ?? args.group),
    target: args.target,
  });
  const scored = scoreRules(filtered, objective);
  const stats = buildStats(filtered);
  const decision = buildDecision({
    objective,
    artifact: args.artifact ?? "rule-set",
    target: args.target ?? "generic",
    stats,
    scoredRules: scored,
  });
  console.log(formatOutput(decision, args.format ?? "json"));
}

async function composeCommand(args) {
  const objective = requireString(args.objective, "--objective is required");
  const artifact = args.artifact ?? "rule-set";
  const requestedMode = args.mode ?? "auto";
  const format = args.format ?? inferFormatFromArtifact(artifact);
  const rules = await loadRules();
  const filtered = filterRules(rules, {
    tags: toList(args.tags),
    groups: toList(args.groups ?? args.group),
    target: args.target,
  });
  const scored = scoreRules(filtered, objective);
  const decision = buildDecision({
    objective,
    artifact,
    target: args.target ?? "generic",
    stats: buildStats(filtered),
    scoredRules: scored,
  });

  const mode =
    requestedMode === "auto"
      ? decision.assembly_mode
      : requestedMode === "script"
        ? "script-first"
        : "ai-first";

  const selected = pickRules(scored, artifact);
  if (selected.length === 0) {
    throw new Error("No rules matched the requested filters/objective.");
  }

  const payload =
    mode === "script-first"
      ? buildScriptArtifact({
          artifact,
          objective,
          target: args.target ?? "generic",
          selected,
          decision,
        })
      : buildAiPrepArtifact({
          artifact,
          objective,
          target: args.target ?? "generic",
          selected,
          decision,
        });

  if (args.output) {
    const outputPath = path.resolve(args.output);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const serialized = formatOutput(payload, format);
    await fs.writeFile(outputPath, serialized.endsWith("\n") ? serialized : `${serialized}\n`, "utf8");
  }

  console.log(formatOutput(payload, format));
}

async function recommendVisualizationCommand(args) {
  const rules = await loadRules();
  const recommendation = buildVisualizationRecommendation(rules);
  console.log(formatOutput(recommendation, args.format ?? "json"));
}

function buildRuleTemplate(meta) {
  return `${toFrontmatter(meta)}

# Intent

State the scenario or goal this rule is meant to support.

# Rule

Write the rule in normal Markdown so it stays compatible with AGENTS-style documents and Trae rule files.

# Notes

- Mention important tradeoffs.
- Call out when the rule should not be applied.
`;
}

function buildScriptArtifact({ artifact, objective, target, selected, decision }) {
  if (artifact === "config-file") {
    return {
      type: "config-file",
      target,
      objective,
      assembly_mode: "script-first",
      generated_at: new Date().toISOString(),
      selected_rules: selected.map(asConfigRule),
      decision_summary: decision.summary,
    };
  }

  if (artifact === "single-rule") {
    const rule = selected[0];
    return {
      type: "single-rule",
      target,
      objective,
      assembly_mode: "script-first",
      rule: asConfigRule(rule),
      markdown: renderSingleRule(rule),
    };
  }

  return {
    type: "rule-set",
    target,
    objective,
    assembly_mode: "script-first",
    selected_rules: selected.map(asConfigRule),
    markdown: renderRuleSet(selected, { objective, target }),
  };
}

function buildAiPrepArtifact({ artifact, objective, target, selected, decision }) {
  return {
    type: artifact,
    target,
    objective,
    assembly_mode: "ai-first",
    instruction: "Use the selected rules and outline below to synthesize a cohesive final artifact instead of concatenating files verbatim.",
    outline: buildSuggestedOutline(artifact, selected),
    decision_summary: decision.summary,
    selected_rules: selected.map((rule) => ({
      ...asConfigRule(rule),
      excerpt: rule.body.trim().slice(0, 800),
    })),
  };
}

function buildSuggestedOutline(artifact, selected) {
  if (artifact === "config-file") {
    return [
      "Include storage root, selected filters, and target.",
      "List selected rule ids with title, groups, tags, and rationale.",
      "Add sync/export metadata if relevant.",
    ];
  }
  if (artifact === "single-rule") {
    return [
      "One short title that matches the task objective.",
      "Intent section with scope and activation conditions.",
      "Unified rule body that removes overlap from source rules.",
      "Exceptions or tradeoffs section.",
    ];
  }
  return [
    "Title and short purpose statement.",
    "High-priority rules first, grouped by intent.",
    "Merge overlapping instructions into one concise narrative.",
    "End with exceptions, sync notes, or export notes if needed.",
  ];
}

function buildDecision({ objective, artifact, target, stats, scoredRules }) {
  const signals = [];
  const keywords = normalizeWords(objective);
  const rewriteRequested = containsAny(keywords, [
    "merge",
    "rewrite",
    "reorganize",
    "synthesize",
    "tailor",
    "condense",
    "customize",
  ]);
  const artifactNeedsDeterminism = artifact === "config-file";
  const topRuleScore = scoredRules[0]?.score ?? 0;

  if (artifactNeedsDeterminism) {
    signals.push("config files benefit from deterministic script generation");
  }
  if (stats.count >= 10) {
    signals.push("rule volume is high");
  }
  if (stats.average_complexity >= 3.3) {
    signals.push("average rule complexity is high");
  }
  if (stats.group_count >= 4) {
    signals.push("multiple rule groups are involved");
  }
  if (rewriteRequested) {
    signals.push("objective asks for synthesis or restructuring");
  }

  const assemblyMode =
    artifactNeedsDeterminism
      ? "script-first"
      : rewriteRequested || stats.count >= 10 || stats.average_complexity >= 3.3 || stats.group_count >= 4
        ? "ai-first"
        : topRuleScore < 15 && stats.count > 0
          ? "ai-first"
          : "script-first";

  return {
    objective,
    artifact,
    target,
    assembly_mode: assemblyMode,
    stats_snapshot: stats,
    summary:
      assemblyMode === "script-first"
        ? "Use scripts to deterministically filter and compile the output."
        : "Use scripts to gather and rank source rules, then let AI synthesize the final artifact.",
    signals,
  };
}

function buildVisualizationRecommendation(rules) {
  const stats = buildStats(rules);
  const quantityScore = scale(stats.count, [
    [6, 10],
    [12, 20],
    [24, 30],
    [40, 40],
  ]);
  const complexityScore = Math.round(stats.average_complexity * 5);
  const updateScore = Math.round(stats.average_update_frequency * 4);
  const maintenanceScore = Math.round(stats.average_maintenance_cost * 6);
  const taxonomyScore = scale(stats.tag_count + stats.group_count, [
    [10, 6],
    [20, 12],
    [35, 18],
  ]);
  const totalScore =
    quantityScore +
    complexityScore +
    updateScore +
    maintenanceScore +
    taxonomyScore;
  let recommendation = "cli-is-enough";
  if (stats.count >= 20 && totalScore >= 65) {
    recommendation = "build-macos-app";
  } else if (stats.count >= 8 && totalScore >= 40) {
    recommendation = "consider-macos-app-soon";
  }

  const reasons = [];
  if (stats.count >= 25) {
    reasons.push("The rule library is large enough that manual browsing will become slow.");
  }
  if (stats.average_complexity >= 3) {
    reasons.push("Rules are complex enough that preview and side-by-side editing would reduce mistakes.");
  }
  if (stats.average_update_frequency >= 3) {
    reasons.push("Rules are updated frequently, which makes tagging, syncing, and export workflows more valuable.");
  }
  if (stats.average_maintenance_cost >= 2.2) {
    reasons.push("Maintenance cost is trending high, so visual grouping and quick review can pay off.");
  }
  if (stats.tag_count + stats.group_count >= 20) {
    reasons.push("Taxonomy sprawl suggests a GUI for grouping and filtering would improve discoverability.");
  }
  if (reasons.length === 0) {
    reasons.push("The current library is still small enough that a CLI-first workflow is efficient.");
  }

  return {
    recommendation,
    score: totalScore,
    stats,
    reasons,
    suggested_features:
      recommendation === "cli-is-enough"
        ? ["Keep using Markdown files plus the CLI for assembly and export."]
        : [
            "Rule editor with metadata form fields",
            "Grouping and tag filters",
            "Live Markdown preview",
            "One-click export for AGENTS.md and Trae targets",
            "Sync status and conflict visibility",
          ],
  };
}

function buildStats(rules) {
  const count = rules.length;
  const averageComplexity = average(rules.map((rule) => Number(rule.meta.complexity ?? 1)));
  const updateAverage = average(
    rules.map((rule) => UPDATE_FREQUENCY_SCORES[String(rule.meta.update_frequency ?? "rare")] ?? 1),
  );
  const maintenanceAverage = average(
    rules.map((rule) => MAINTENANCE_COST_SCORES[String(rule.meta.maintenance_cost ?? "low")] ?? 1),
  );
  const tags = new Set();
  const groups = new Set();
  for (const rule of rules) {
    for (const tag of ensureArray(rule.meta.tags)) tags.add(tag);
    for (const group of ensureArray(rule.meta.groups)) groups.add(group);
  }
  return {
    count,
    average_complexity: round(averageComplexity),
    average_update_frequency: round(updateAverage),
    average_maintenance_cost: round(maintenanceAverage),
    tag_count: tags.size,
    group_count: groups.size,
  };
}

function scoreRules(rules, objective) {
  const objectiveWords = normalizeWords(objective);
  return rules
    .map((rule) => {
      const haystack = normalizeWords(
        [
          rule.meta.id,
          rule.meta.title,
          rule.meta.summary,
          ...ensureArray(rule.meta.tags),
          ...ensureArray(rule.meta.groups),
          ...ensureArray(rule.meta.targets),
          rule.body.slice(0, 1200),
        ].join(" "),
      );
      const priorityBoost = Number(rule.meta.priority ?? 0) / 10;
      let score = priorityBoost;
      let matchCount = 0;
      for (const word of objectiveWords) {
        if (haystack.includes(word)) {
          score += word.length > 4 ? 8 : 4;
          matchCount += 1;
        }
      }
      if (objectiveWords.some((word) => ensureArray(rule.meta.tags).includes(word))) {
        score += 10;
        matchCount += 1;
      }
      if (objectiveWords.some((word) => ensureArray(rule.meta.groups).includes(word))) {
        score += 8;
        matchCount += 1;
      }
      return { ...rule, score, match_count: matchCount };
    })
    .sort((left, right) => right.score - left.score || left.meta.title.localeCompare(right.meta.title));
}

function pickRules(scoredRules, artifact) {
  const matched = scoredRules.filter((rule) => rule.match_count > 0);
  const fallback = matched.length > 0 ? matched : scoredRules.slice(0, Math.min(3, scoredRules.length));
  if (artifact === "single-rule") {
    return scoredRules.slice(0, 1);
  }
  if (artifact === "config-file") {
    return fallback;
  }
  return fallback;
}

function filterRules(rules, { tags, groups, target }) {
  return rules.filter((rule) => {
    if (tags.length > 0 && !tags.every((tag) => ensureArray(rule.meta.tags).includes(tag))) {
      return false;
    }
    if (groups.length > 0 && !groups.every((group) => ensureArray(rule.meta.groups).includes(group))) {
      return false;
    }
    if (target && !ensureArray(rule.meta.targets).includes(target)) {
      return false;
    }
    return true;
  });
}

async function loadRules() {
  const exists = await pathExists(RULES_ROOT);
  if (!exists) {
    return [];
  }
  const entries = await fs.readdir(RULES_ROOT, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(RULES_ROOT, entry.name));
  const rules = [];
  for (const filePath of files) {
    const source = await fs.readFile(filePath, "utf8");
    if (!source.startsWith("---\n")) {
      continue;
    }
    const parsed = parseMarkdownRule(source);
    rules.push({
      path: filePath,
      fileName: path.basename(filePath),
      meta: parsed.meta,
      body: parsed.body,
    });
  }
  return rules;
}

function parseMarkdownRule(source) {
  if (!source.startsWith("---\n")) {
    return {
      meta: {
        id: "untitled-rule",
        title: "Untitled Rule",
        groups: ["ungrouped"],
        tags: [],
        targets: ["generic"],
        complexity: 1,
        update_frequency: "rare",
        maintenance_cost: "low",
      },
      body: source,
    };
  }

  const endIndex = source.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    throw new Error("Malformed frontmatter block.");
  }
  const frontmatter = source.slice(4, endIndex);
  const body = source.slice(endIndex + 5);
  const meta = parseFrontmatter(frontmatter);
  meta.id = String(meta.id ?? slugify(String(meta.title ?? "untitled-rule")));
  meta.title = String(meta.title ?? meta.id);
  meta.summary = String(meta.summary ?? "");
  meta.groups = ensureArray(meta.groups);
  meta.tags = ensureArray(meta.tags);
  meta.targets = ensureArray(meta.targets);
  if (meta.targets.length === 0) {
    meta.targets = ["generic"];
  }
  meta.complexity = clampNumber(meta.complexity ?? 1, 1, 5);
  meta.update_frequency = normalizeLooseEnum(meta.update_frequency, Object.keys(UPDATE_FREQUENCY_SCORES), "rare");
  meta.maintenance_cost = normalizeLooseEnum(
    meta.maintenance_cost,
    Object.keys(MAINTENANCE_COST_SCORES),
    "low",
  );
  meta.priority = Number(meta.priority ?? 0);
  return { meta, body };
}

function parseFrontmatter(frontmatter) {
  const result = {};
  let activeKey = null;
  for (const rawLine of frontmatter.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      continue;
    }
    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && activeKey) {
      const existing = ensureArray(result[activeKey]);
      existing.push(parseScalar(listMatch[1]));
      result[activeKey] = existing;
      continue;
    }
    const keyValueMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyValueMatch) {
      activeKey = null;
      continue;
    }
    const [, key, rawValue] = keyValueMatch;
    activeKey = key;
    if (!rawValue) {
      result[key] = [];
      continue;
    }
    result[key] = parseScalar(rawValue);
  }
  return result;
}

function parseScalar(value) {
  const trimmed = String(value).trim();
  if (trimmed === "[]") return [];
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((part) => stripQuotes(part.trim()))
      .filter(Boolean);
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  return stripQuotes(trimmed);
}

function toFrontmatter(meta) {
  const lines = ["---"];
  const orderedKeys = [
    "id",
    "title",
    "summary",
    "groups",
    "tags",
    "targets",
    "complexity",
    "update_frequency",
    "maintenance_cost",
    "priority",
    "last_reviewed",
  ];
  for (const key of orderedKeys) {
    const value = meta[key];
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${item}`);
      }
      continue;
    }
    lines.push(`${key}: ${value}`);
  }
  lines.push("---");
  return lines.join("\n");
}

function renderSingleRule(rule) {
  return `${toFrontmatter(rule.meta)}

${rule.body.trim()}
`;
}

function renderRuleSet(rules, { objective, target }) {
  const sections = [
    "---",
    `title: Assembled Rule Set`,
    `objective: ${objective}`,
    `target: ${target}`,
    `generated_at: ${new Date().toISOString()}`,
    "---",
    "",
    "# Assembled Rule Set",
    "",
    `Objective: ${objective}`,
    "",
    `Target: ${target}`,
    "",
  ];

  for (const rule of rules) {
    sections.push(`## ${rule.meta.title}`);
    sections.push("");
    sections.push(`Source: ${rule.meta.id}`);
    sections.push("");
    sections.push(rule.body.trim());
    sections.push("");
  }

  return sections.join("\n");
}

function summarizeRules(rules) {
  return rules.map((rule) => ({
    id: rule.meta.id,
    title: rule.meta.title,
    groups: rule.meta.groups,
    tags: rule.meta.tags,
    targets: rule.meta.targets,
    complexity: rule.meta.complexity,
    update_frequency: rule.meta.update_frequency,
    maintenance_cost: rule.meta.maintenance_cost,
    file: rule.path,
  }));
}

function asConfigRule(rule) {
  return {
    id: rule.meta.id,
    title: rule.meta.title,
    summary: rule.meta.summary,
    groups: rule.meta.groups,
    tags: rule.meta.tags,
    targets: rule.meta.targets,
    complexity: rule.meta.complexity,
    update_frequency: rule.meta.update_frequency,
    maintenance_cost: rule.meta.maintenance_cost,
    priority: rule.meta.priority,
    file: rule.path,
    score: rule.score,
    match_count: rule.match_count,
  };
}

function formatOutput(payload, format) {
  if (format === "markdown") {
    if (payload.markdown) {
      return payload.markdown;
    }
    const lines = [];
    for (const [key, value] of Object.entries(payload)) {
      lines.push(`- ${key}: ${formatMarkdownValue(value)}`);
    }
    return lines.join("\n");
  }
  return JSON.stringify(payload, null, 2);
}

function formatMarkdownValue(value) {
  if (Array.isArray(value)) {
    return value.length === 0 ? "[]" : value.map((item) => JSON.stringify(item)).join(", ");
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function parseArgs(tokens) {
  const args = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    const next = tokens[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function requireString(value, message) {
  if (!value || !String(value).trim()) {
    throw new Error(message);
  }
  return String(value).trim();
}

function normalizeEnum(value, allowed, label) {
  const normalized = String(value).trim().toLowerCase();
  if (!allowed.includes(normalized)) {
    throw new Error(`Unsupported ${label}: ${value}`);
  }
  return normalized;
}

function normalizeLooseEnum(value, allowed, fallback) {
  const normalized = String(value ?? fallback).trim().toLowerCase();
  return allowed.includes(normalized) ? normalized : fallback;
}

function toList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function ensureArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  }
  if (value === undefined || value === null || value === "") {
    return [];
  }
  return [String(value).trim().toLowerCase()].filter(Boolean);
}

function normalizeWords(text) {
  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2);
}

function containsAny(values, targets) {
  return targets.some((target) => values.includes(target));
}

function average(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function scale(value, thresholds) {
  let score = 0;
  for (const [threshold, points] of thresholds) {
    if (value >= threshold) {
      score = points;
    }
  }
  return score;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function stripQuotes(value) {
  return String(value).replace(/^['"]|['"]$/g, "");
}

function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return min;
  }
  return Math.min(max, Math.max(min, numeric));
}

async function safeReadFile(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function inferFormatFromArtifact(artifact) {
  return artifact === "config-file" ? "json" : "markdown";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

await main();
