import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDb } from ".";
import { and, count, eq, isNull } from "drizzle-orm";
import { AccountInsert, EntryInsert } from "./schema";

export const usePaginatedAccounts = (
  page: number = 0,
  pageSize: number = 50
) => {
  const { db, schema } = useDb();

  return useQuery({
    queryKey: ["accounts-paginated"],
    queryFn: async () => {
      const accounts = await db
        .select()
        .from(schema.accounts)
        .limit(pageSize)
        .offset(page * pageSize)
        .where(isNull(schema.accounts.deletedAt))
        .all();

      const totalAccounts = await db
        .select({ count: count() })
        .from(schema.accounts)
        .where(isNull(schema.accounts.deletedAt))
        .get();

      const total = Number(totalAccounts?.count || 0);
      const hasMore = (page + 1) * pageSize < total;

      return { accounts, total, hasMore };
    },
  });
};

export const useInsertAccount = () => {
  const { db, schema } = useDb();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountInsert: AccountInsert) => {
      const result = await db
        .insert(schema.accounts)
        .values(accountInsert)
        .returning();

      queryClient.invalidateQueries({ queryKey: ["accounts-paginated"] });

      return result[0];
    },
  });
};

export const useDeleteAccount = () => {
  const { db, schema } = useDb();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: number) => {
      await db
        .update(schema.accounts)
        .set({ deletedAt: new Date().toISOString() })
        .where(eq(schema.accounts.id, accountId));

      queryClient.invalidateQueries({ queryKey: ["accounts-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["entries-paginated"] });
    },
  });
};

export const useCheckAccountCodeExists = (code: string | null) => {
  const { db, schema } = useDb();

  return useQuery({
    queryKey: ["account-exists", code],
    queryFn: async () => {
      const account = await db
        .select()
        .from(schema.accounts)
        .where(
          and(
            eq(schema.accounts.code, code!),
            isNull(schema.accounts.deletedAt)
          )
        )
        .get();

      return !!account;
    },
    enabled: code != null && code.length > 0,
  });
};

export const usePaginatedEntries = (
  page: number = 0,
  pageSize: number = 50
) => {
  const { db, schema } = useDb();

  return useQuery({
    queryKey: ["entries-paginated"],
    queryFn: async () => {
      const rawEntries = await db
        .select()
        .from(schema.entries)
        .limit(pageSize)
        .offset(page * pageSize)
        .leftJoin(
          schema.accounts,
          eq(schema.entries.accountId, schema.accounts.id)
        )
        .where(
          and(
            isNull(schema.entries.deletedAt),
            isNull(schema.accounts.deletedAt)
          )
        )
        .all();

      const entries = rawEntries.map(
        ({ accounts, entries: { accountId, ...entry } }) => ({
          ...entry,
          account: accounts,
        })
      );

      const totalEntries = await db
        .select({ count: count() })
        .from(schema.entries)
        .leftJoin(
          schema.accounts,
          eq(schema.entries.accountId, schema.accounts.id)
        )
        .where(
          and(
            isNull(schema.entries.deletedAt),
            isNull(schema.accounts.deletedAt)
          )
        )
        .get();

      const total = Number(totalEntries?.count || 0);
      const hasMore = (page + 1) * pageSize < total;

      return { entries, total, hasMore };
    },
  });
};

export const useInsertEntry = () => {
  const { db, schema } = useDb();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryInsert: EntryInsert) => {
      const result = await db
        .insert(schema.entries)
        .values(entryInsert)
        .returning();

      queryClient.invalidateQueries({ queryKey: ["entries-paginated"] });

      return result[0];
    },
  });
};

export const useDeleteEntry = () => {
  const { db, schema } = useDb();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: number) => {
      await db
        .update(schema.entries)
        .set({ deletedAt: new Date().toISOString() })
        .where(eq(schema.entries.id, entryId));

      queryClient.invalidateQueries({ queryKey: ["entries-paginated"] });
    },
  });
};
