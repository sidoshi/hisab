import { invoke } from "@tauri-apps/api/core";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import Database from "@tauri-apps/plugin-sql";
import * as schema from "./schema";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Row = {
  columns: string[];
  values: string[];
};

type DatabaseContextValue = {
  db: ReturnType<typeof drizzle> | null;
  dbPath: string | null;
  openDb: () => Promise<void>;
  selectingDb: boolean;
  closeDb: () => Promise<void>;
};

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

const db = drizzle(
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

export const DatabaseProvider: FC<PropsWithChildren> = ({ children }) => {
  const [dbPath, setDbPath] = useState<string | null>(null);
  const [selectingDb, setSelectingDb] = useState(false);

  useEffect(() => {
    getCurrentDatabasePath().then((path) => {
      if (path) {
        setDbPath(path);
      }
    });
  }, []);

  useEffect(() => {
    async function initializeDB() {
      if (dbPath) {
        await initializeSQLPlugin();
        await Database.load(`sqlite:${dbPath}`);
      }
    }

    initializeDB();
  }, [dbPath]);

  const openDb = async () => {
    if (selectingDb) return;
    setSelectingDb(true);

    try {
      const dbPath = await showDatabaseSelectionDialog();

      if (dbPath) {
        setDbPath(dbPath);
      }
    } catch (err) {
      console.error("Error selecting or creating database: ", err);
    } finally {
      setSelectingDb(false);
    }
  };

  const closeDb = async () => {
    setDbPath(null);
  };

  const value = useMemo(
    () => ({
      db,
      dbPath,
      openDb,
      selectingDb,
      closeDb,
    }),
    [dbPath, selectingDb]
  );

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDb = () => {
  const db = useContext(DatabaseContext);
  if (!db) {
    throw new Error("useDB must be used within a DatabaseProvider");
  }
  return db;
};

async function getCurrentDatabasePath(): Promise<string | null> {
  return invoke<string | null>("get_current_database_path");
}

async function showDatabaseSelectionDialog() {
  return invoke<string | null>("show_database_selection_dialog");
}

async function initializeSQLPlugin() {
  return invoke<void>("initialize_sql_plugin");
}
