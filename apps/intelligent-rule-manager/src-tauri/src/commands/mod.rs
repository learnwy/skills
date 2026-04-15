use rule_core::{Healthcheck, WorkspaceSummary};

#[tauri::command]
pub fn healthcheck() -> Healthcheck {
    rule_core::healthcheck()
}

#[tauri::command]
pub fn workspace_summary() -> WorkspaceSummary {
    rule_core::workspace_summary()
}

