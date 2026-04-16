use std::env;
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
pub struct Healthcheck {
    pub ok: bool,
    pub app: &'static str,
    pub layer: &'static str,
}

#[derive(Debug, Clone, Serialize)]
pub struct WorkspaceSummary {
    pub storage_root: String,
    pub exports_dir: String,
    pub supported_artifacts: Vec<&'static str>,
    pub supported_targets: Vec<&'static str>,
}

#[derive(Debug, Clone, Serialize)]
pub struct RuleListItem {
    pub id: String,
    pub title: String,
    pub summary: String,
    pub groups: Vec<String>,
    pub tags: Vec<String>,
    pub resolved_tags: Vec<String>,
    pub targets: Vec<String>,
    pub file: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleDocument {
    pub id: String,
    pub title: String,
    pub summary: String,
    pub groups: Vec<String>,
    pub tags: Vec<String>,
    pub targets: Vec<String>,
    pub complexity: u8,
    pub update_frequency: String,
    pub maintenance_cost: String,
    pub priority: i32,
    pub last_reviewed: String,
    pub file: String,
    pub body: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct NewRuleInput {
    pub title: String,
    pub summary: Option<String>,
    pub groups: Vec<String>,
    pub tags: Vec<String>,
    pub targets: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct RuleLibraryStats {
    pub count: usize,
    pub average_complexity: f64,
    pub average_update_frequency: f64,
    pub average_maintenance_cost: f64,
    pub tag_count: usize,
    pub group_count: usize,
}

#[derive(Debug, Clone, Serialize)]
pub struct VisualizationRecommendation {
    pub recommendation: String,
    pub score: i32,
    pub stats: RuleLibraryStats,
    pub reasons: Vec<String>,
    pub suggested_features: Vec<String>,
}

pub fn healthcheck() -> Healthcheck {
    Healthcheck {
        ok: true,
        app: "intelligent-rule-manager",
        layer: "rule-core",
    }
}

pub fn workspace_summary() -> WorkspaceSummary {
    let storage_root = default_rules_root();
    let exports_dir = storage_root.join("exports");

    WorkspaceSummary {
        storage_root: storage_root.display().to_string(),
        exports_dir: exports_dir.display().to_string(),
        supported_artifacts: vec!["single-rule", "rule-set", "config-file"],
        supported_targets: vec!["agents-md", "trae-rule", "generic"],
    }
}

pub fn default_rules_root() -> PathBuf {
    if let Ok(root) = env::var("LEARNWY_RULES_ROOT") {
        return PathBuf::from(root);
    }

    if let Ok(home) = env::var("LEARNWY_AI_HOME") {
        return PathBuf::from(home).join("rules");
    }

    if let Ok(home) = env::var("AGENTS_HOME") {
        return PathBuf::from(home).join("rules");
    }

    let user_home = env::var("HOME").unwrap_or_else(|_| "~".to_string());
    PathBuf::from(user_home)
        .join(".learnwy")
        .join("ai")
        .join("rules")
}

pub fn list_rules() -> Result<Vec<RuleListItem>, String> {
    let items = read_rule_documents()?
        .into_iter()
        .map(|document| as_list_item(&document))
        .collect::<Vec<_>>();

    let mut items = items;

    items.sort_by(|left, right| left.title.cmp(&right.title));
    Ok(items)
}

pub fn load_rule(file: String) -> Result<RuleDocument, String> {
    let path = PathBuf::from(file);
    let source = fs::read_to_string(&path)
        .map_err(|error| format!("Failed to read {}: {error}", path.display()))?;

    parse_rule_document(&path, &source)
}

pub fn create_rule(input: NewRuleInput) -> Result<RuleDocument, String> {
    let title = input.title.trim();
    if title.is_empty() {
        return Err("Rule title is required.".to_string());
    }

    let rules_root = default_rules_root();
    fs::create_dir_all(&rules_root)
        .map_err(|error| format!("Failed to create rules directory: {error}"))?;

    let id = slugify(title);
    let file = rules_root.join(format!("{id}.md"));
    if file.exists() {
        return Err(format!("A rule already exists at {}.", file.display()));
    }

    let document = RuleDocument {
        id,
        title: title.to_string(),
        summary: input
            .summary
            .unwrap_or_else(|| format!("Reusable rule for {}.", title.to_lowercase())),
        groups: normalize_values(input.groups, vec!["shared".to_string()]),
        tags: normalize_values(input.tags, Vec::new()),
        targets: normalize_values(input.targets, vec!["agents-md".to_string(), "trae-rule".to_string()]),
        complexity: 2,
        update_frequency: "occasional".to_string(),
        maintenance_cost: "low".to_string(),
        priority: 50,
        last_reviewed: today_iso_utc(),
        file: file.display().to_string(),
        body: default_rule_body(),
    };

    save_rule(document)
}

pub fn save_rule(mut document: RuleDocument) -> Result<RuleDocument, String> {
    if document.title.trim().is_empty() {
        return Err("Rule title is required.".to_string());
    }

    if document.file.trim().is_empty() {
        return Err("Rule file path is required.".to_string());
    }

    document.id = if document.id.trim().is_empty() {
        slugify(&document.title)
    } else {
        slugify(&document.id)
    };
    document.summary = document.summary.trim().to_string();
    document.groups = normalize_values(document.groups, vec!["shared".to_string()]);
    document.tags = normalize_values(document.tags, Vec::new());
    document.targets = normalize_values(document.targets, vec!["generic".to_string()]);
    document.body = if document.body.trim().is_empty() {
        default_rule_body()
    } else {
        document.body.trim().to_string()
    };
    if document.last_reviewed.trim().is_empty() {
        document.last_reviewed = today_iso_utc();
    }

    let file_path = PathBuf::from(&document.file);
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Failed to create {}: {error}", parent.display()))?;
    }

    let serialized = render_rule_document(&document);
    fs::write(&file_path, serialized)
        .map_err(|error| format!("Failed to write {}: {error}", file_path.display()))?;

    load_rule(document.file)
}

pub fn stats() -> Result<RuleLibraryStats, String> {
    let documents = read_rule_documents()?;
    Ok(build_stats(&documents))
}

pub fn recommend_visualization() -> Result<VisualizationRecommendation, String> {
    let documents = read_rule_documents()?;
    Ok(build_visualization_recommendation(&documents))
}

fn split_frontmatter(source: &str) -> Option<(&str, &str)> {
    if !source.starts_with("---\n") {
        return None;
    }

    let end_index = source.get(4..)?.find("\n---\n")?;
    let frontmatter_end = 4 + end_index;
    let frontmatter = &source[4..frontmatter_end];
    let body = &source[(frontmatter_end + 5)..];

    Some((frontmatter, body))
}

fn read_rule_documents() -> Result<Vec<RuleDocument>, String> {
    let rules_root = default_rules_root();
    read_rule_documents_from_root(&rules_root)
}

fn read_rule_documents_from_root(rules_root: &Path) -> Result<Vec<RuleDocument>, String> {
    if !rules_root.exists() {
        return Ok(Vec::new());
    }

    let mut documents = Vec::new();
    let markdown_files = collect_markdown_files(rules_root)?;

    for file_path in markdown_files {
        let source = fs::read_to_string(&file_path)
            .map_err(|error| format!("Failed to read {}: {error}", file_path.display()))?;
        documents.push(parse_rule_document(&file_path, &source)?);
    }

    documents.sort_by(|left, right| left.title.cmp(&right.title));
    Ok(documents)
}

fn collect_markdown_files(root: &Path) -> Result<Vec<PathBuf>, String> {
    let mut files = Vec::new();
    collect_markdown_files_into(root, &mut files)?;
    files.sort();
    Ok(files)
}

fn collect_markdown_files_into(root: &Path, files: &mut Vec<PathBuf>) -> Result<(), String> {
    let entries =
        fs::read_dir(root).map_err(|error| format!("Failed to read {}: {error}", root.display()))?;

    for entry in entries {
        let entry = entry.map_err(|error| format!("Failed to read directory entry: {error}"))?;
        let file_path = entry.path();

        if file_path.is_dir() {
            collect_markdown_files_into(&file_path, files)?;
            continue;
        }

        if file_path.extension().and_then(|value| value.to_str()) == Some("md") {
            files.push(file_path);
        }
    }

    Ok(())
}

fn parse_rule_document(file_path: &Path, source: &str) -> Result<RuleDocument, String> {
    let Some((frontmatter, body)) = split_frontmatter(source) else {
        return Err(format!("Rule file {} is missing YAML frontmatter.", file_path.display()));
    };

    let meta = parse_frontmatter(frontmatter);
    let title = first_value(&meta, "title").unwrap_or_else(|| {
        file_path
            .file_stem()
            .and_then(|value| value.to_str())
            .unwrap_or("untitled-rule")
            .to_string()
    });
    let id = first_value(&meta, "id").unwrap_or_else(|| slugify(&title));

    Ok(RuleDocument {
        id,
        title,
        summary: first_value(&meta, "summary").unwrap_or_default(),
        groups: meta.get("groups").cloned().unwrap_or_default(),
        tags: meta.get("tags").cloned().unwrap_or_default(),
        targets: meta
            .get("targets")
            .cloned()
            .unwrap_or_else(|| vec!["generic".to_string()]),
        complexity: first_value(&meta, "complexity")
            .and_then(|value| value.parse::<u8>().ok())
            .unwrap_or(2),
        update_frequency: first_value(&meta, "update_frequency")
            .unwrap_or_else(|| "occasional".to_string()),
        maintenance_cost: first_value(&meta, "maintenance_cost")
            .unwrap_or_else(|| "low".to_string()),
        priority: first_value(&meta, "priority")
            .and_then(|value| value.parse::<i32>().ok())
            .unwrap_or(50),
        last_reviewed: first_value(&meta, "last_reviewed").unwrap_or_else(today_iso_utc),
        file: file_path.display().to_string(),
        body: body.trim().to_string(),
    })
}

fn parse_frontmatter(frontmatter: &str) -> std::collections::BTreeMap<String, Vec<String>> {
    let mut result: std::collections::BTreeMap<String, Vec<String>> =
        std::collections::BTreeMap::new();
    let mut active_key: Option<String> = None;

    for raw_line in frontmatter.lines() {
        let line = raw_line.trim_end();
        if line.trim().is_empty() {
            continue;
        }

        let trimmed = line.trim_start();
        if let Some(value) = trimmed.strip_prefix("- ") {
            if let Some(key) = &active_key {
                result
                    .entry(key.clone())
                    .or_default()
                    .push(strip_quotes(value.trim()).to_string());
            }
            continue;
        }

        let Some((key, raw_value)) = line.split_once(':') else {
            active_key = None;
            continue;
        };

        let key = key.trim().to_lowercase();
        let value = raw_value.trim();
        active_key = Some(key.clone());

        if value.is_empty() {
            result.entry(key).or_default();
            continue;
        }

        result.insert(key, parse_value_list(value));
    }

    result
}

fn parse_value_list(value: &str) -> Vec<String> {
    let trimmed = value.trim();
    if trimmed.starts_with('[') && trimmed.ends_with(']') {
        return trimmed[1..trimmed.len() - 1]
            .split(',')
            .map(|part| strip_quotes(part.trim()).to_string())
            .filter(|part| !part.is_empty())
            .collect();
    }

    vec![strip_quotes(trimmed).to_string()]
}

fn strip_quotes(value: &str) -> &str {
    value.trim_matches(|character| character == '"' || character == '\'')
}

fn slugify(value: &str) -> String {
    let mut slug = String::new();
    let mut last_was_dash = false;

    for character in value.chars().flat_map(|character| character.to_lowercase()) {
        if character.is_ascii_alphanumeric() {
            slug.push(character);
            last_was_dash = false;
        } else if !last_was_dash {
            slug.push('-');
            last_was_dash = true;
        }
    }

    slug.trim_matches('-').to_string()
}

fn as_list_item(document: &RuleDocument) -> RuleListItem {
    RuleListItem {
        id: document.id.clone(),
        title: document.title.clone(),
        summary: document.summary.clone(),
        groups: document.groups.clone(),
        tags: document.tags.clone(),
        resolved_tags: resolve_rule_tags(&document.tags),
        targets: document.targets.clone(),
        file: document.file.clone(),
    }
}

fn normalize_values(values: Vec<String>, fallback: Vec<String>) -> Vec<String> {
    let mut normalized = Vec::new();

    for value in values {
        let value = value.trim().to_lowercase();
        if value.is_empty() || normalized.contains(&value) {
            continue;
        }
        normalized.push(value);
    }

    if normalized.is_empty() {
        fallback
    } else {
        normalized
    }
}

fn first_value(
    meta: &std::collections::BTreeMap<String, Vec<String>>,
    key: &str,
) -> Option<String> {
    meta.get(key).and_then(|value| value.first()).cloned()
}

fn tag_parent_map(tag: &str) -> &'static [&'static str] {
    match tag {
        "typescript" => &["web", "javascript", "tooling"],
        "javascript" => &["web"],
        "react" => &["frontend", "web", "typescript"],
        "node" => &["backend", "tooling", "javascript"],
        "lint" => &["quality", "tooling"],
        "eslint" => &["lint", "javascript", "typescript", "web"],
        "format" => &["quality", "tooling"],
        "prettier" => &["format", "javascript", "typescript", "web"],
        "git-hooks" => &["quality", "tooling"],
        "husky" => &["git-hooks", "tooling"],
        "lint-staged" => &["git-hooks", "lint", "format", "tooling"],
        "tsconfig" => &["typescript", "build-tools", "tooling"],
        "path-alias" => &["typescript", "module-resolution", "build-tools"],
        "module-resolution" => &["tooling"],
        "exports" => &["typescript", "module-structure"],
        "imports" => &["typescript", "module-structure"],
        "barrel-exports" => &["exports", "module-structure", "typescript"],
        "project-structure" => &["typescript", "module-structure", "tooling"],
        "shared-config" => &["typescript", "tooling"],
        "build-tools" => &["tooling"],
        "bundler" => &["build-tools", "web"],
        "vite" => &["bundler", "build-tools", "web", "typescript"],
        "tsup" => &["build-tools", "typescript"],
        "module-structure" => &["tooling"],
        _ => &[],
    }
}

fn resolve_rule_tags(tags: &[String]) -> Vec<String> {
    let mut resolved = Vec::new();

    for tag in tags {
        collect_tag_with_ancestors(tag, &mut resolved);
    }

    resolved
}

fn collect_tag_with_ancestors(tag: &str, resolved: &mut Vec<String>) {
    let normalized = tag.trim().to_lowercase();
    if normalized.is_empty() || resolved.contains(&normalized) {
        return;
    }

    resolved.push(normalized.clone());

    for parent in tag_parent_map(&normalized) {
        collect_tag_with_ancestors(parent, resolved);
    }
}

fn render_rule_document(document: &RuleDocument) -> String {
    let mut lines = vec![
        "---".to_string(),
        format!("id: {}", document.id),
        format!("title: {}", document.title),
        format!("summary: {}", document.summary),
        "groups:".to_string(),
    ];

    for group in &document.groups {
        lines.push(format!("  - {group}"));
    }

    lines.push("tags:".to_string());
    for tag in &document.tags {
        lines.push(format!("  - {tag}"));
    }

    lines.push("targets:".to_string());
    for target in &document.targets {
        lines.push(format!("  - {target}"));
    }

    lines.extend([
        format!("complexity: {}", document.complexity),
        format!("update_frequency: {}", document.update_frequency),
        format!("maintenance_cost: {}", document.maintenance_cost),
        format!("priority: {}", document.priority),
        format!("last_reviewed: {}", document.last_reviewed),
        "---".to_string(),
        String::new(),
        document.body.trim().to_string(),
        String::new(),
    ]);

    lines.join("\n")
}

fn default_rule_body() -> String {
    [
        "# Intent",
        "",
        "State the scenario or goal this rule is meant to support.",
        "",
        "# Rule",
        "",
        "Write the rule in normal Markdown so it stays compatible with AGENTS-style documents and Trae rule files.",
        "",
        "# Notes",
        "",
        "- Mention important tradeoffs.",
        "- Call out when the rule should not be applied.",
    ]
    .join("\n")
}

fn today_iso_utc() -> String {
    let seconds_since_epoch = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs() as i64)
        .unwrap_or(0);
    let days_since_epoch = seconds_since_epoch / 86_400;
    let (year, month, day) = civil_from_days(days_since_epoch);
    format!("{year:04}-{month:02}-{day:02}")
}

fn build_stats(documents: &[RuleDocument]) -> RuleLibraryStats {
    let mut tags = std::collections::BTreeSet::new();
    let mut groups = std::collections::BTreeSet::new();

    for document in documents {
        for tag in &document.tags {
            tags.insert(tag.clone());
        }

        for group in &document.groups {
            groups.insert(group.clone());
        }
    }

    RuleLibraryStats {
        count: documents.len(),
        average_complexity: round(average(
            documents
                .iter()
                .map(|document| document.complexity as f64)
                .collect(),
        )),
        average_update_frequency: round(average(
            documents
                .iter()
                .map(|document| update_frequency_score(&document.update_frequency) as f64)
                .collect(),
        )),
        average_maintenance_cost: round(average(
            documents
                .iter()
                .map(|document| maintenance_cost_score(&document.maintenance_cost) as f64)
                .collect(),
        )),
        tag_count: tags.len(),
        group_count: groups.len(),
    }
}

fn build_visualization_recommendation(documents: &[RuleDocument]) -> VisualizationRecommendation {
    let stats = build_stats(documents);
    let quantity_score = scale(stats.count as i32, &[(6, 10), (12, 20), (24, 30), (40, 40)]);
    let complexity_score = (stats.average_complexity * 5.0).round() as i32;
    let update_score = (stats.average_update_frequency * 4.0).round() as i32;
    let maintenance_score = (stats.average_maintenance_cost * 6.0).round() as i32;
    let taxonomy_score = scale((stats.tag_count + stats.group_count) as i32, &[(10, 6), (20, 12), (35, 18)]);
    let total_score = quantity_score + complexity_score + update_score + maintenance_score + taxonomy_score;

    let recommendation = if stats.count >= 20 && total_score >= 65 {
        "build-macos-app"
    } else if stats.count >= 8 && total_score >= 40 {
        "consider-macos-app-soon"
    } else {
        "cli-is-enough"
    };

    let mut reasons = Vec::new();
    if stats.count >= 25 {
        reasons.push("The rule library is large enough that manual browsing will become slow.".to_string());
    }
    if stats.average_complexity >= 3.0 {
        reasons.push("Rules are complex enough that preview and side-by-side editing would reduce mistakes.".to_string());
    }
    if stats.average_update_frequency >= 3.0 {
        reasons.push("Rules are updated frequently, which makes tagging, syncing, and export workflows more valuable.".to_string());
    }
    if stats.average_maintenance_cost >= 2.2 {
        reasons.push("Maintenance cost is trending high, so visual grouping and quick review can pay off.".to_string());
    }
    if (stats.tag_count + stats.group_count) >= 20 {
        reasons.push("Taxonomy sprawl suggests a GUI for grouping and filtering would improve discoverability.".to_string());
    }
    if reasons.is_empty() {
        reasons.push("The current library is still small enough that a CLI-first workflow is efficient.".to_string());
    }

    VisualizationRecommendation {
        recommendation: recommendation.to_string(),
        score: total_score,
        stats,
        reasons,
        suggested_features: if recommendation == "cli-is-enough" {
            vec!["Keep using Markdown files plus the CLI for assembly and export.".to_string()]
        } else {
            vec![
                "Rule editor with metadata form fields".to_string(),
                "Grouping and tag filters".to_string(),
                "Live Markdown preview".to_string(),
                "One-click export for AGENTS.md and Trae targets".to_string(),
                "Sync status and conflict visibility".to_string(),
            ]
        },
    }
}

fn average(values: Vec<f64>) -> f64 {
    if values.is_empty() {
        return 0.0;
    }

    values.iter().sum::<f64>() / values.len() as f64
}

fn round(value: f64) -> f64 {
    (value * 100.0).round() / 100.0
}

fn scale(value: i32, thresholds: &[(i32, i32)]) -> i32 {
    let mut score = 0;
    for (threshold, points) in thresholds {
        if value >= *threshold {
            score = *points;
        }
    }
    score
}

fn update_frequency_score(value: &str) -> i32 {
    match value {
        "rare" => 1,
        "occasional" => 2,
        "monthly" => 3,
        "weekly" => 4,
        "frequent" => 5,
        _ => 1,
    }
}

fn maintenance_cost_score(value: &str) -> i32 {
    match value {
        "low" => 1,
        "medium" => 2,
        "high" => 3,
        "very-high" => 4,
        _ => 1,
    }
}

fn civil_from_days(days_since_epoch: i64) -> (i64, i64, i64) {
    let z = days_since_epoch + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096) / 365;
    let mut year = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = mp + if mp < 10 { 3 } else { -9 };
    year += if month <= 2 { 1 } else { 0 };
    (year, month, day)
}

#[cfg(test)]
mod tests {
    use std::fs;
    use std::path::PathBuf;
    use std::time::{SystemTime, UNIX_EPOCH};

    use super::{
        civil_from_days, default_rules_root, parse_frontmatter, read_rule_documents_from_root,
        resolve_rule_tags, split_frontmatter,
    };

    #[test]
    fn parses_frontmatter_lists_and_scalars() {
        let source = r#"---
id: frontend-review
title: Frontend Review
summary: Review UI changes carefully.
groups:
  - frontend
  - review
tags: [ui, accessibility]
targets:
  - agents-md
---

# Rule
"#;

        let (frontmatter, _) = split_frontmatter(source).expect("expected frontmatter");
        let parsed = parse_frontmatter(frontmatter);

        assert_eq!(parsed.get("id").expect("id"), &vec!["frontend-review".to_string()]);
        assert_eq!(parsed.get("groups").expect("groups").len(), 2);
        assert_eq!(parsed.get("tags").expect("tags").len(), 2);
        assert_eq!(parsed.get("targets").expect("targets").len(), 1);
    }

    #[test]
    fn converts_epoch_days_to_calendar_date() {
        assert_eq!(civil_from_days(0), (1970, 1, 1));
    }

    #[test]
    fn defaults_to_learnwy_shared_rules_root() {
        let original_home = std::env::var("HOME").ok();
        let original_learnwy_root = std::env::var("LEARNWY_RULES_ROOT").ok();
        let original_learnwy_home = std::env::var("LEARNWY_AI_HOME").ok();
        let original_agents_home = std::env::var("AGENTS_HOME").ok();

        unsafe {
            std::env::remove_var("LEARNWY_RULES_ROOT");
            std::env::remove_var("LEARNWY_AI_HOME");
            std::env::remove_var("AGENTS_HOME");
            std::env::set_var("HOME", "/tmp/learnwy-home");
        }

        assert_eq!(
            default_rules_root(),
            PathBuf::from("/tmp/learnwy-home/.learnwy/ai/rules")
        );

        restore_env("HOME", original_home);
        restore_env("LEARNWY_RULES_ROOT", original_learnwy_root);
        restore_env("LEARNWY_AI_HOME", original_learnwy_home);
        restore_env("AGENTS_HOME", original_agents_home);
    }

    #[test]
    fn resolves_parent_tags_for_filtering() {
        let resolved = resolve_rule_tags(&[
            "typescript".to_string(),
            "eslint".to_string(),
            "lint-staged".to_string(),
        ]);

        assert!(resolved.contains(&"typescript".to_string()));
        assert!(resolved.contains(&"web".to_string()));
        assert!(resolved.contains(&"lint".to_string()));
        assert!(resolved.contains(&"format".to_string()));
        assert!(resolved.contains(&"git-hooks".to_string()));
        assert!(resolved.contains(&"quality".to_string()));
    }

    #[test]
    fn reads_markdown_rules_recursively() {
        let fixture_root = temp_fixture_root("intelligent-rule-manager");
        let nested_dir = fixture_root.join("web").join("typescript");
        fs::create_dir_all(&nested_dir).expect("create nested rules directory");

        fs::write(
            nested_dir.join("named-exports.md"),
            r#"---
id: named-exports
title: Named exports
summary: Prefer named exports.
groups: [frontend]
tags: [typescript, exports]
targets: [agents-md]
---

# Rule

Prefer named exports over default exports.
"#,
        )
        .expect("write nested rule");

        let documents = read_rule_documents_from_root(&fixture_root).expect("read rule documents");
        assert_eq!(documents.len(), 1);
        assert_eq!(documents[0].id, "named-exports");

        fs::remove_dir_all(&fixture_root).expect("remove fixture root");
    }

    fn temp_fixture_root(name: &str) -> PathBuf {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|duration| duration.as_nanos())
            .unwrap_or(0);

        std::env::temp_dir().join(format!("{name}-{suffix}"))
    }

    fn restore_env(key: &str, value: Option<String>) {
        match value {
            Some(value) => unsafe { std::env::set_var(key, value) },
            None => unsafe { std::env::remove_var(key) },
        }
    }
}
