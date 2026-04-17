use rule_core::{
    ComposeRequest, ComposeResult, Healthcheck, NewRuleInput, RuleDocument,
    RuleLibraryStats, RuleListItem, VisualizationRecommendation, WorkspaceSummary,
};

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

#[tauri::command]
pub fn compose_rules(request: ComposeRequest) -> Result<ComposeResult, String> {
    rule_core::compose_rules(request)
}

#[tauri::command]
pub fn stats() -> Result<RuleLibraryStats, String> {
    rule_core::stats()
}

#[tauri::command]
pub fn recommend_visualization() -> Result<VisualizationRecommendation, String> {
    rule_core::recommend_visualization()
}
