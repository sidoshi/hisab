mod db_setup;
mod drizzle_proxy;

include!(concat!(env!("OUT_DIR"), "/generated_migrations.rs"));

use base64::{Engine as _, engine::general_purpose};
use std::fs;
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
async fn save_pdf_file(
    app: tauri::AppHandle,
    data: String,
    suggested_name: Option<String>,
) -> Result<(), String> {
    let file_path = app
        .dialog()
        .file()
        .add_filter("PDF files", &["pdf"])
        .set_file_name(&suggested_name.unwrap_or("ledger.pdf".to_string()))
        .blocking_save_file();

    if let Some(path) = file_path {
        // Decode base64 data
        let pdf_data = general_purpose::STANDARD
            .decode(data)
            .map_err(|e| format!("Failed to decode base64: {}", e))?;

        // Write file
        let path = path.as_path().unwrap();
        fs::write(path, pdf_data).map_err(|e| format!("Failed to write file: {}", e))?;
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            drizzle_proxy::run_sql,
            db_setup::select_database_path,
            db_setup::create_new_database,
            db_setup::get_current_database_path,
            db_setup::show_database_selection_dialog,
            db_setup::initialize_sql_plugin,
            db_setup::delete_database_path,
            save_pdf_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
