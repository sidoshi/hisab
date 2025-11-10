mod db_setup;
mod drizzle_proxy;

use db_setup::DatabasePath;
use std::sync::Arc;
use tokio::sync::Mutex;

include!(concat!(env!("OUT_DIR"), "/generated_migrations.rs"));

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(DatabasePath(Arc::new(Mutex::new(None))))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            drizzle_proxy::run_sql,
            db_setup::select_database_path,
            db_setup::create_new_database,
            db_setup::get_current_database_path,
            db_setup::show_database_selection_dialog
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
