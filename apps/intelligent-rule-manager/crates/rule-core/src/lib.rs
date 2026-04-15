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
    if let Ok(home) = env::var("AGENTS_HOME") {
        return PathBuf::from(home).join("rules");
    }

    let user_home = env::var("HOME").unwrap_or_else(|_| "~".to_string());
    PathBuf::from(user_home).join(".agents").join("rules")
}

pub fn list_rules() -> Result<Vec<RuleListItem>, String> {
    let rules_root = default_rules_root();
    if !rules_root.exists() {
        return Ok(Vec::new());
    }

    let mut items = Vec::new();
    let entries = fs::read_dir(&rules_root)
        .map_err(|error| format!("Failed to read rules directory: {error}"))?;

    for entry in entries {
        let entry = entry.map_err(|error| format!("Failed to read directory entry: {error}"))?;
        let file_path = entry.path();

        if !file_path.is_file() {
            continue;
        }

        if file_path.extension().and_then(|value| value.to_str()) != Some("md") {
            continue;
        }

        let source = fs::read_to_string(&file_path)
            .map_err(|error| format!("Failed to read {}: {error}", file_path.display()))?;
        let document = parse_rule_document(&file_path, &source)?;
        items.push(as_list_item(&document));
    }

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
        targets: document.targets.clone(),
        file: document.file.clone(),
    }
}

fn normalize_values(values: Vec<String>, fallback: Vec<String>) -> Vec<String> {
    let normalized: Vec<String> = values
        .into_iter()
        .map(|value| value.trim().to_lowercase())
        .filter(|value| !value.is_empty())
        .collect();

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
    use super::{civil_from_days, parse_frontmatter, split_frontmatter};

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
}
