use std::env;
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

