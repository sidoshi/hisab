import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  phone: text(),
});
