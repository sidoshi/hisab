import { invoke } from "@tauri-apps/api/core";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import Database from "@tauri-apps/plugin-sql";
import * as schema from "./schema";

type Row = {
  columns: string[];
  values: string[];
};

let db: ReturnType<typeof drizzle> | null = null;

export async function loadDB(path: string) {
  if (db == null) {
    // Load the database using the selected path to run the migrations
    await Database.load(`sqlite:${path}`);

    db = drizzle(
      async (sql, params, method) => {
        try {
          const rows = await invoke<Row[]>("run_sql", {
            query: { sql, params },
          });
          if (rows.length === 0 && method === "get") {
            /**
             * 🛠 Workaround for Drizzle ORM SQLite Proxy `.get()` bug
             *
             * `.get()` with no results throws due to Drizzle trying to destructure `undefined`.
             * See: https://github.com/drizzle-team/drizzle-orm/issues/4113
             *
             * Until fixed upstream, we return `{}` when rows are empty to avoid crashes.
             */
            return {} as { rows: string[] };
          }
          return method === "get"
            ? { rows: rows[0].values }
            : { rows: rows.map((r) => r.values) };
        } catch (e: unknown) {
          console.error("Error from sqlite proxy server: ", e);
          return { rows: [] };
        }
      },
      {
        schema,
        logger: true,
      }
    );
  }

  return db;
}

export async function selectExistingDatabase(): Promise<string> {
  return invoke<string>("select_database_path");
}

export async function createNewDatabase(): Promise<string> {
  return invoke<string>("create_new_database");
}

export async function getCurrentDatabasePath(): Promise<string | null> {
  return invoke<string | null>("get_current_database_path");
}

export async function showDatabaseSelectionDialog() {
  return invoke<string | null>("show_database_selection_dialog");
}
