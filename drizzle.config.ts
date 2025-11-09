import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

const resolvedDbPath = path.resolve(
  process.env.DB_PATH!.replace(/^~(?=$|\/|\\)/, process.env.HOME!)
);

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./src-tauri/migrations",

  verbose: false,
  strict: true,
  dbCredentials: {
    url: `file:${resolvedDbPath}`,
  },
});
