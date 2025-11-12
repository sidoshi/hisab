use std::path::PathBuf;
use tauri::{AppHandle, plugin::Plugin};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogResult};
use tauri_plugin_sql::Builder;
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn select_database_path(app: AppHandle) -> Result<String, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    app.dialog()
        .file()
        .add_filter("SQLite Database", &["db", "sqlite", "sqlite3"])
        .set_title("Select Database File")
        .pick_file(move |file_path| {
            tx.send(file_path).unwrap();
        });

    let dialog_result = rx.recv().unwrap();
    match dialog_result {
        Some(file_path) => {
            let file_path: PathBuf = file_path.try_into().unwrap();
            let path_str = file_path.to_string_lossy().to_string();

            // Store the selected path in app state
            let store = app.store("store").expect("Failed to get store");
            store.set("database_path", path_str.clone());

            // Initialize the SQL plugin with the selected database
            if let Err(e) = initialize_sql_plugin(app.clone()).await {
                return Err(format!("Failed to initialize database: {}", e));
            }

            Ok(path_str)
        }
        None => Err("No database file selected".to_string()),
    }
}

#[tauri::command]
pub async fn get_current_database_path(app: AppHandle) -> Result<Option<String>, String> {
    let store = app
        .store("store")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    let path_value = store.get("database_path");
    let path = path_value.and_then(|v| v.as_str().map(|s| s.to_string()));

    Ok(path)
}

#[tauri::command]
pub async fn delete_database_path(app: AppHandle) -> Result<(), String> {
    let store = app
        .store("store")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    store.delete("database_path");
    Ok(())
}

#[tauri::command]
pub async fn create_new_database(app: AppHandle) -> Result<String, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    app.dialog()
        .file()
        .add_filter("SQLite Database", &["db", "sqlite", "sqlite3"])
        .set_title("Create New Database File")
        .set_file_name("database.db")
        .save_file(move |file_path| {
            tx.send(file_path).unwrap();
        });

    let dialog_result = rx.recv().unwrap();
    match dialog_result {
        Some(file_path) => {
            let file_path: PathBuf = file_path.try_into().unwrap();
            let path_str = file_path.to_string_lossy().to_string();

            // Store the selected path in app state
            let store = app.store("store").expect("Failed to get store");
            store.set("database_path", path_str.clone());

            // Initialize the SQL plugin with the new database
            if let Err(e) = initialize_sql_plugin(app.clone()).await {
                return Err(format!("Failed to initialize database: {}", e));
            }

            Ok(path_str)
        }
        None => Err("No database file location selected".to_string()),
    }
}

#[tauri::command]
pub async fn initialize_sql_plugin(app: AppHandle) -> Result<(), String> {
    let migrations = crate::load_migrations();
    let migrations = migrations.into_iter().rev().collect::<Vec<_>>();
    let db_path = get_current_database_path(app.clone())
        .await?
        .ok_or("No database path set")?;
    let db_uri = format!("sqlite:{}", db_path);

    let sql_plugin = Builder::default()
        .add_migrations(&db_uri, migrations)
        .build();

    app.remove_plugin(sql_plugin.name());
    app.plugin(sql_plugin).expect("Error adding plugin");
    Ok(())
}

#[tauri::command]
pub async fn show_database_selection_dialog(app: AppHandle) -> Result<String, String> {
    let choice = app
        .dialog()
        .message("Would you like to open an existing database or create a new one?")
        .buttons(MessageDialogButtons::YesNoCancelCustom(
            "Use Existing".to_string(),
            "Create New".to_string(),
            "Cancel".to_string(),
        ))
        .blocking_show_with_result();

    match choice {
        MessageDialogResult::Custom(s) => match s.as_str() {
            "Use Existing" => select_database_path(app.clone()).await,
            "Create New" => create_new_database(app.clone()).await,
            _ => Err("Cancelled".into()),
        },
        _ => Err("Cancelled".into()),
    }
}
