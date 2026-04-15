mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::healthcheck,
            commands::workspace_summary,
            commands::list_rules,
            commands::load_rule,
            commands::create_rule,
            commands::save_rule
        ])
        .run(tauri::generate_context!())
        .expect("error while running intelligent-rule-manager");
}
