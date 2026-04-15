use rule_core::{Healthcheck, NewRuleInput, RuleDocument, RuleListItem, WorkspaceSummary};

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

#[tauri::command]
pub fn load_rule(file: String) -> Result<RuleDocument, String> {
    rule_core::load_rule(file)
}

#[tauri::command]
pub fn create_rule(input: NewRuleInput) -> Result<RuleDocument, String> {
    rule_core::create_rule(input)
}

#[tauri::command]
pub fn save_rule(document: RuleDocument) -> Result<RuleDocument, String> {
    rule_core::save_rule(document)
}
