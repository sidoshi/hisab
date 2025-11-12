import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: int().primaryKey({ autoIncrement: true }),

  name: text().notNull().unique(),
  code: text().notNull().unique(),
  phone: text(),

  createdAt: text("createdAt")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`(current_timestamp)`),
  deletedAt: text("deletedAt"),
});

export type Account = typeof accounts.$inferSelect;
export type AccountInsert = typeof accounts.$inferInsert;
export type AccountUpdate = Partial<AccountInsert>;
export type AccountWithBalance = Account & {
  amount: number;
  type: "debit" | "credit";
};

export const entries = sqliteTable("entries", {
  id: int().primaryKey({ autoIncrement: true }),
  accountId: int()
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),

  amount: int().notNull(),
  description: text(),
  type: text({ enum: ["debit", "credit"] }).notNull(),

  createdAt: text("createdAt")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`(current_timestamp)`),
  deletedAt: text("deletedAt"),
});

export type Entry = typeof entries.$inferSelect;
export type EntryInsert = typeof entries.$inferInsert;
export type EntryUpdate = Partial<EntryInsert>;
export type EntryWithAccount = Omit<Entry, "accountId"> & {
  account: Account | null;
};
