mod db_setup;
mod drizzle_proxy;

include!(concat!(env!("OUT_DIR"), "/generated_migrations.rs"));

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            drizzle_proxy::run_sql,
            db_setup::select_database_path,
            db_setup::create_new_database,
            db_setup::get_current_database_path,
            db_setup::show_database_selection_dialog,
            db_setup::initialize_sql_plugin
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
