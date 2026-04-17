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

#[derive(Debug, Clone, Deserialize)]
pub struct ComposeRequest {
    pub target: String,
    pub rule_ids: Vec<String>,
    pub tags: Vec<String>,
    pub output_name: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ComposedFile {
    pub path: String,
    pub title: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ComposeResult {
    pub target: String,
    pub export_root: String,
    pub selected_rule_ids: Vec<String>,
    pub selected_tags: Vec<String>,
    pub files: Vec<ComposedFile>,
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

pub fn compose_rules(request: ComposeRequest) -> Result<ComposeResult, String> {
    let documents = read_rule_documents()?;
    let export_root = default_rules_root().join("exports");
    compose_documents(&documents, &export_root, request)
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
            if file_path.file_name().and_then(|value| value.to_str()) == Some("exports") {
                continue;
            }
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

fn compose_documents(
    documents: &[RuleDocument],
    export_root: &Path,
    request: ComposeRequest,
) -> Result<ComposeResult, String> {
    let target = request.target.trim().to_lowercase();
    if target.is_empty() {
        return Err("Compose target is required.".to_string());
    }

    if target != "agents-md" && target != "trae-rule" {
        return Err(format!("Unsupported compose target: {target}."));
    }

    let selected_rule_ids = normalize_values(request.rule_ids, Vec::new());
    let selected_tags = normalize_values(request.tags, Vec::new());

    if selected_rule_ids.is_empty() && selected_tags.is_empty() {
        return Err("Select at least one tag or one rule before composing.".to_string());
    }

    let selected_documents =
        select_documents_for_target(documents, &target, &selected_rule_ids, &selected_tags);

    if selected_documents.is_empty() {
        return Err(format!(
            "No rules matched target {} for the selected tags or rule ids.",
            target
        ));
    }

    let bundle_name = request
        .output_name
        .as_deref()
        .map(slugify)
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| format!("{}-{}", slugify(&target), today_iso_utc()));

    let files = if target == "agents-md" {
        build_agents_export(export_root, &bundle_name, &selected_documents, &selected_tags)?
    } else {
        build_trae_export(export_root, &bundle_name, &selected_documents)?
    };

    Ok(ComposeResult {
        target,
        export_root: export_root.display().to_string(),
        selected_rule_ids,
        selected_tags,
        files,
    })
}

fn select_documents_for_target(
    documents: &[RuleDocument],
    target: &str,
    rule_ids: &[String],
    tags: &[String],
) -> Vec<RuleDocument> {
    let mut selected = documents
        .iter()
        .filter(|document| supports_target(document, target))
        .filter(|document| {
            let matches_rule = rule_ids.contains(&document.id);
            let resolved_tags = resolve_rule_tags(&document.tags);
            let matches_tag = tags.iter().any(|tag| resolved_tags.contains(tag));
            matches_rule || matches_tag
        })
        .cloned()
        .collect::<Vec<_>>();

    selected.sort_by(|left, right| left.title.cmp(&right.title));
    selected
}

fn supports_target(document: &RuleDocument, target: &str) -> bool {
    document
        .targets
        .iter()
        .any(|candidate| candidate == target || candidate == "generic")
}

fn build_agents_export(
    export_root: &Path,
    bundle_name: &str,
    documents: &[RuleDocument],
    selected_tags: &[String],
) -> Result<Vec<ComposedFile>, String> {
    let file_path = export_root
        .join("agents")
        .join(bundle_name)
        .join("AGENTS.md");
    let content = render_agents_document(documents, selected_tags);
    write_export_file(&file_path, &content)?;

    Ok(vec![ComposedFile {
        path: file_path.display().to_string(),
        title: "AGENTS.md".to_string(),
        content,
    }])
}

fn build_trae_export(
    export_root: &Path,
    bundle_name: &str,
    documents: &[RuleDocument],
) -> Result<Vec<ComposedFile>, String> {
    let mut files = Vec::new();

    for document in documents {
        let file_path = export_root
            .join("trae")
            .join(bundle_name)
            .join(".trae")
            .join("rules")
            .join(format!("{}.md", document.id));
        let content = render_trae_document(document);
        write_export_file(&file_path, &content)?;
        files.push(ComposedFile {
            path: file_path.display().to_string(),
            title: document.title.clone(),
            content,
        });
    }

    Ok(files)
}

fn write_export_file(file_path: &Path, content: &str) -> Result<(), String> {
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Failed to create {}: {error}", parent.display()))?;
    }

    fs::write(file_path, content)
        .map_err(|error| format!("Failed to write {}: {error}", file_path.display()))
}

fn render_agents_document(documents: &[RuleDocument], selected_tags: &[String]) -> String {
    let mut lines = vec![
        "# AGENTS.md".to_string(),
        String::new(),
        "This file was composed by Intelligent Rule Manager from selected reusable rules."
            .to_string(),
        String::new(),
        format!("Generated on: {}", today_iso_utc()),
        format!("Included rules: {}", documents.len()),
    ];

    if !selected_tags.is_empty() {
        lines.push(format!("Selected tags: {}", selected_tags.join(", ")));
    }

    lines.extend([
        String::new(),
        "## Included Rules".to_string(),
    ]);

    for document in documents {
        lines.push(format!("- {} (`{}`)", document.title, document.id));
    }

    lines.push(String::new());
    lines.push("## Rule Guidance".to_string());
    lines.push(String::new());

    for document in documents {
        lines.push(format!("## {}", document.title));
        if !document.summary.trim().is_empty() {
            lines.push(String::new());
            lines.push(document.summary.trim().to_string());
        }

        lines.push(String::new());
        lines.push(format!(
            "Source rule: `{}` | Tags: {}",
            document.id,
            if document.tags.is_empty() {
                "none".to_string()
            } else {
                document.tags.join(", ")
            }
        ));
        lines.push(String::new());
        lines.push(shift_headings(&document.body, 2));
        lines.push(String::new());
    }

    lines.join("\n").trim_end().to_string() + "\n"
}

fn render_trae_document(document: &RuleDocument) -> String {
    let description = if document.summary.trim().is_empty() {
        document.title.trim().to_string()
    } else {
        document.summary.trim().to_string()
    };

    [
        "---".to_string(),
        format!("description: {:?}", description),
        "alwaysApply: false".to_string(),
        "---".to_string(),
        String::new(),
        format!("# {}", document.title.trim()),
        String::new(),
        shift_headings(&document.body, 1),
        String::new(),
    ]
    .join("\n")
}

fn shift_headings(source: &str, offset: usize) -> String {
    source
        .lines()
        .map(|line| {
            let trimmed = line.trim_start();
            let indent_len = line.len() - trimmed.len();
            let indent = &line[..indent_len];

            if !trimmed.starts_with('#') {
                return line.to_string();
            }

            let level = trimmed.chars().take_while(|character| *character == '#').count();
            let remainder = trimmed[level..].trim_start();
            let shifted_level = usize::min(level + offset, 6);
            format!("{}{} {}", indent, "#".repeat(shifted_level), remainder)
        })
        .collect::<Vec<_>>()
        .join("\n")
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
        civil_from_days, compose_documents, default_rules_root, parse_frontmatter,
        read_rule_documents_from_root, render_agents_document, render_trae_document,
        resolve_rule_tags, split_frontmatter, ComposeRequest, RuleDocument,
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

    #[test]
    fn ignores_generated_exports_during_rule_discovery() {
        let fixture_root = temp_fixture_root("intelligent-rule-manager-exports");
        let exports_dir = fixture_root.join("exports").join("agents").join("bundle");
        fs::create_dir_all(&exports_dir).expect("create exports dir");
        fs::write(
            exports_dir.join("AGENTS.md"),
            "# Generated bundle\n\nThis should not be parsed as a source rule.\n",
        )
        .expect("write generated export");

        let documents = read_rule_documents_from_root(&fixture_root).expect("read rule documents");
        assert!(documents.is_empty());

        fs::remove_dir_all(&fixture_root).expect("remove fixture root");
    }

    #[test]
    fn renders_agents_document_with_nested_headings() {
        let content = render_agents_document(
            &[fixture_rule(
                "named-exports",
                "Named exports",
                "Prefer named exports.",
                vec!["typescript", "exports"],
                vec!["agents-md", "trae-rule"],
            )],
            &["typescript".to_string()],
        );

        assert!(content.contains("# AGENTS.md"));
        assert!(content.contains("## Named exports"));
        assert!(content.contains("### Intent"));
        assert!(content.contains("Selected tags: typescript"));
    }

    #[test]
    fn renders_split_trae_rule_with_frontmatter() {
        let content = render_trae_document(&fixture_rule(
            "named-exports",
            "Named exports",
            "Prefer named exports.",
            vec!["typescript", "exports"],
            vec!["agents-md", "trae-rule"],
        ));

        assert!(content.contains("description: \"Prefer named exports.\""));
        assert!(content.contains("alwaysApply: false"));
        assert!(content.contains("# Named exports"));
        assert!(content.contains("## Intent"));
    }

    #[test]
    fn composes_agents_and_trae_exports_from_selected_tags_and_rules() {
        let documents = vec![
            fixture_rule(
                "named-exports",
                "Named exports",
                "Prefer named exports.",
                vec!["typescript", "exports"],
                vec!["agents-md", "trae-rule"],
            ),
            fixture_rule(
                "generated-i18n",
                "Generated i18n",
                "Use generated locale outputs.",
                vec!["i18n", "tooling"],
                vec!["agents-md", "trae-rule"],
            ),
        ];
        let export_root = temp_fixture_root("compose-exports");

        let agents = compose_documents(
            &documents,
            &export_root,
            ComposeRequest {
                target: "agents-md".to_string(),
                rule_ids: vec!["named-exports".to_string()],
                tags: vec!["i18n".to_string()],
                output_name: Some("workspace-guidance".to_string()),
            },
        )
        .expect("compose agents export");

        assert_eq!(agents.files.len(), 1);
        assert!(agents.files[0].path.ends_with("AGENTS.md"));
        assert!(agents.files[0].content.contains("Named exports"));
        assert!(agents.files[0].content.contains("Generated i18n"));

        let trae = compose_documents(
            &documents,
            &export_root,
            ComposeRequest {
                target: "trae-rule".to_string(),
                rule_ids: vec!["named-exports".to_string()],
                tags: vec!["i18n".to_string()],
                output_name: Some("workspace-guidance".to_string()),
            },
        )
        .expect("compose trae export");

        assert_eq!(trae.files.len(), 2);
        assert!(trae.files.iter().all(|file| file.path.contains("/.trae/rules/")));

        fs::remove_dir_all(&export_root).expect("remove export fixture");
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

    fn fixture_rule(
        id: &str,
        title: &str,
        summary: &str,
        tags: Vec<&str>,
        targets: Vec<&str>,
    ) -> RuleDocument {
        RuleDocument {
            id: id.to_string(),
            title: title.to_string(),
            summary: summary.to_string(),
            groups: vec!["shared".to_string()],
            tags: tags.into_iter().map(str::to_string).collect(),
            targets: targets.into_iter().map(str::to_string).collect(),
            complexity: 2,
            update_frequency: "occasional".to_string(),
            maintenance_cost: "low".to_string(),
            priority: 50,
            last_reviewed: "2026-04-17".to_string(),
            file: format!("/tmp/{id}.md"),
            body: [
                "# Intent",
                "",
                "Keep exports explicit.",
                "",
                "# Rule",
                "",
                "- Use named exports.",
            ]
            .join("\n"),
        }
    }
}
