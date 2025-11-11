use crate::db_setup::get_current_database_path;
use base64::Engine;
use base64::engine::general_purpose;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{
    Column, Row, Sqlite, SqlitePool, TypeInfo,
    query::Query,
    sqlite::{SqliteArguments, SqliteRow},
};

use tauri::{AppHandle, command};

#[derive(Debug, Deserialize)]
pub struct SqlQuery {
    pub sql: String,
    pub params: Vec<serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct SqlRow {
    pub columns: Vec<String>,
    pub values: Vec<serde_json::Value>,
}

#[command]
pub async fn run_sql(app: AppHandle, query: SqlQuery) -> Result<Vec<SqlRow>, String> {
    let db_path = get_current_database_path(app.clone())
        .await?
        .expect("No database is selected in the current path");
    let uri = format!("sqlite://{}", db_path);

    let pool = SqlitePool::connect(&uri)
        .await
        .map_err(|e| format!("Failed to connect to DB: {}", e))?;

    let mut q = sqlx::query(&query.sql);
    for param in &query.params {
        q = bind_value(q, param);
    }

    let rows = q
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Query failed: {}", e))?;

    let result = rows
        .iter()
        .map(|row| {
            let columns = row
                .columns()
                .iter()
                .map(|c| c.name().to_string())
                .collect::<Vec<_>>();

            let values = (0..row.len())
                .map(|i| match row.try_get_raw(i) {
                    Ok(_) => sqlx_value_to_json(row, i),
                    Err(_) => Value::Null,
                })
                .collect::<Vec<_>>();

            SqlRow { columns, values }
        })
        .collect();

    Ok(result)
}

fn bind_value<'q>(
    query: Query<'q, Sqlite, SqliteArguments<'q>>,
    value: &'q Value,
) -> Query<'q, Sqlite, SqliteArguments<'q>> {
    match value {
        Value::Null => query.bind(None::<String>),
        Value::Bool(b) => query.bind(*b),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                query.bind(i)
            } else if let Some(f) = n.as_f64() {
                query.bind(f)
            } else {
                query
            }
        }
        Value::String(s) => query.bind(s),
        _ => query,
    }
}

fn sqlx_value_to_json(row: &SqliteRow, index: usize) -> Value {
    let column = row.column(index);
    let type_name = column.type_info().name();

    match type_name {
        "INTEGER" => row
            .try_get::<i64, _>(index)
            .map(Value::from)
            .unwrap_or(Value::Null),
        "REAL" => row
            .try_get::<f64, _>(index)
            .map(Value::from)
            .unwrap_or(Value::Null),
        "TEXT" => row
            .try_get::<String, _>(index)
            .map(Value::String)
            .unwrap_or(Value::Null),
        "BLOB" => row
            .try_get::<Vec<u8>, _>(index)
            .map(|bytes| Value::String(general_purpose::STANDARD.encode(&bytes)))
            .unwrap_or(Value::Null),
        "NULL" | _ => {
            if let Ok(val) = row.try_get::<i64, _>(index) {
                return Value::from(val);
            }
            if let Ok(val) = row.try_get::<f64, _>(index) {
                return Value::from(val);
            }
            if let Ok(val) = row.try_get::<String, _>(index) {
                return Value::String(val);
            }
            Value::Null
        }
    }
}
