use std::env;
use std::fs;
use std::path::PathBuf;

use serde::Serialize;

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

        let Some((frontmatter, _body)) = split_frontmatter(&source) else {
            continue;
        };

        let meta = parse_frontmatter(frontmatter);
        let title = meta
            .get("title")
            .and_then(|value| value.first())
            .cloned()
            .unwrap_or_else(|| {
                file_path
                    .file_stem()
                    .and_then(|value| value.to_str())
                    .unwrap_or("untitled-rule")
                    .to_string()
            });
        let id = meta
            .get("id")
            .and_then(|value| value.first())
            .cloned()
            .unwrap_or_else(|| slugify(&title));

        items.push(RuleListItem {
            id,
            title,
            summary: meta
                .get("summary")
                .and_then(|value| value.first())
                .cloned()
                .unwrap_or_default(),
            groups: meta.get("groups").cloned().unwrap_or_default(),
            tags: meta.get("tags").cloned().unwrap_or_default(),
            targets: meta.get("targets").cloned().unwrap_or_else(|| vec!["generic".to_string()]),
            file: file_path.display().to_string(),
        });
    }

    items.sort_by(|left, right| left.title.cmp(&right.title));
    Ok(items)
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

#[cfg(test)]
mod tests {
    use super::{parse_frontmatter, split_frontmatter};

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
}
