mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::healthcheck,
            commands::workspace_summary
        ])
        .run(tauri::generate_context!())
        .expect("error while running intelligent-rule-manager");
}

