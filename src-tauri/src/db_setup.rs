use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogResult};
use tauri_plugin_sql::Builder;
use tokio::sync::Mutex;

pub struct DatabasePath(pub Arc<Mutex<Option<PathBuf>>>);

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
            let db_path_state: State<DatabasePath> = app.state();
            let mut db_path = db_path_state.0.lock().await;
            *db_path = Some(file_path.clone());

            // Initialize the SQL plugin with the selected database
            if let Err(e) = initialize_sql_plugin(&app, &file_path).await {
                return Err(format!("Failed to initialize database: {}", e));
            }

            Ok(path_str)
        }
        None => Err("No database file selected".to_string()),
    }
}

#[tauri::command]
pub async fn get_current_database_path(app: AppHandle) -> Result<Option<String>, String> {
    let db_path_state: State<DatabasePath> = app.state();
    let db_path = db_path_state.0.lock().await;

    Ok(db_path.as_ref().map(|p| p.to_string_lossy().to_string()))
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
            let db_path_state: State<DatabasePath> = app.state();
            let mut db_path = db_path_state.0.lock().await;
            *db_path = Some(file_path.clone());

            // Initialize the SQL plugin with the new database
            if let Err(e) = initialize_sql_plugin(&app, &file_path).await {
                return Err(format!("Failed to initialize database: {}", e));
            }

            Ok(path_str)
        }
        None => Err("No database file location selected".to_string()),
    }
}

async fn initialize_sql_plugin(
    app: &AppHandle,
    db_path: &PathBuf,
) -> Result<(), Box<dyn std::error::Error>> {
    let migrations = crate::load_migrations();
    let db_uri = format!("sqlite:{}", db_path.to_string_lossy());

    let sql_plugin = Builder::default()
        .add_migrations(&db_uri, migrations)
        .build();

    app.plugin(sql_plugin)?;
    Ok(())
}

#[tauri::command]
pub async fn show_database_selection_dialog(app: AppHandle) -> Result<String, String> {
    // First check if we already have a database path stored (in case of app restart)
    let db_path_state: State<DatabasePath> = app.state();
    let existing_path = {
        let db_path = db_path_state.0.lock().await;
        db_path.clone()
    };

    if existing_path.is_some() {
        return Ok(existing_path.unwrap().to_string_lossy().to_string()); // Database already initialized
    }

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
