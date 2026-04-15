use rule_core::{Healthcheck, RuleListItem, WorkspaceSummary};

#[tauri::command]
pub fn healthcheck() -> Healthcheck {
    rule_core::healthcheck()
}

#[tauri::command]
pub fn workspace_summary() -> WorkspaceSummary {
    rule_core::workspace_summary()
}

#[tauri::command]
pub fn list_rules() -> Result<Vec<RuleListItem>, String> {
    rule_core::list_rules()
}
