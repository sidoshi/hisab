import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDb } from ".";
import { and, asc, count, desc, eq, isNull, like } from "drizzle-orm";
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
        .orderBy(asc(schema.accounts.name))
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

export const useAutocompleteAccounts = (searchText: string) => {
  const { db, schema } = useDb();

  return useQuery({
    initialData: [],
    queryKey: ["accounts-autocomplete", searchText],
    queryFn: async () => {
      const accounts = await db
        .select()
        .from(schema.accounts)
        .where(
          and(
            isNull(schema.accounts.deletedAt),
            like(schema.accounts.name, `%${searchText}%`)
          )
        )
        .limit(10)
        .all();

      return accounts;
    },
    enabled: searchText.length > 0,
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
      queryClient.invalidateQueries({ queryKey: ["accounts-with-balance"] });
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
    initialData: { entries: [], total: 0, hasMore: false },
    queryKey: ["entries-paginated", page, pageSize],
    queryFn: async () => {
      const rawEntries = await db
        .select()
        .from(schema.entries)
        .limit(pageSize)
        .offset(page * pageSize)
        .innerJoin(
          schema.accounts,
          eq(schema.entries.accountId, schema.accounts.id)
        )
        .where(
          and(
            isNull(schema.entries.deletedAt),
            isNull(schema.accounts.deletedAt)
          )
        )
        .orderBy(desc(schema.entries.createdAt))
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
        .innerJoin(
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

      const total = totalEntries?.count ? Number(totalEntries.count) : 0;
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

export const useUpdateEntry = () => {
  const { db, schema } = useDb();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      entryUpdate,
    }: {
      entryId: number;
      entryUpdate: Partial<EntryInsert>;
    }) => {
      await db
        .update(schema.entries)
        .set({ ...entryUpdate, updatedAt: new Date().toISOString() })
        .where(eq(schema.entries.id, entryId));

      queryClient.invalidateQueries({ queryKey: ["entries-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["account-with-balance"] });
      queryClient.invalidateQueries({ queryKey: ["accounts-with-balance"] });
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
      queryClient.invalidateQueries({ queryKey: ["account-with-balance"] });
      queryClient.invalidateQueries({ queryKey: ["accounts-with-balance"] });
    },
  });
};

export const useAccountWithEntries = (accountId: number) => {
  const { db, schema } = useDb();

  return useQuery({
    queryKey: ["account-with-balance", accountId],
    enabled: accountId != null,
    queryFn: async () => {
      const account = await db
        .select()
        .from(schema.accounts)
        .where(
          and(
            eq(schema.accounts.id, accountId),
            isNull(schema.accounts.deletedAt)
          )
        )
        .get();

      if (!account) {
        throw new Error("Account not found");
      }

      const entries = await db
        .select()
        .from(schema.entries)
        .where(
          and(
            eq(schema.entries.accountId, accountId),
            isNull(schema.entries.deletedAt)
          )
        )
        .orderBy(desc(schema.entries.createdAt))
        .all();

      const balance = entries.reduce((acc, entry) => {
        if (entry.type === "debit") {
          return acc + entry.amount;
        } else {
          return acc - entry.amount;
        }
      }, 0);

      return { ...account, entries, balance };
    },
  });
};

export const useAccountsWithBalance = (filterZeroBalance: boolean = false) => {
  const { db, schema } = useDb();

  return useQuery({
    queryKey: ["accounts-with-balance"],
    queryFn: async () => {
      // Get all non-deleted accounts with their entries and calculate balances
      const accountsWithEntries = await db
        .select({
          id: schema.accounts.id,
          name: schema.accounts.name,
          code: schema.accounts.code,
          phone: schema.accounts.phone,
          entryAmount: schema.entries.amount,
          entryType: schema.entries.type,
        })
        .from(schema.accounts)
        .leftJoin(
          schema.entries,
          and(
            eq(schema.accounts.id, schema.entries.accountId),
            isNull(schema.entries.deletedAt)
          )
        )
        .where(isNull(schema.accounts.deletedAt))
        .orderBy(asc(schema.accounts.name));

      // Group by account and calculate balances
      const accountBalances = new Map<
        number,
        {
          id: number;
          name: string;
          phone: string | null;
          code: string;
          amount: number;
        }
      >();

      accountsWithEntries.forEach((row) => {
        const { id, name, code, entryAmount, entryType, phone } = row;

        if (!accountBalances.has(id)) {
          accountBalances.set(id, {
            id,
            name,
            code,
            phone,
            amount: 0,
          });
        }

        const account = accountBalances.get(id)!;

        // Calculate balance: Add for debit, subtract for credit
        if (entryAmount !== null) {
          if (entryType === "debit") {
            account.amount += entryAmount;
          } else if (entryType === "credit") {
            account.amount -= entryAmount;
          }
        }
      });

      // Convert to array and determine the type based on final balance
      const accountsWithBalance = Array.from(accountBalances.values()).map(
        (account) => ({
          ...account,
          type: account.amount >= 0 ? ("debit" as const) : ("credit" as const),
        })
      );

      if (filterZeroBalance) {
        return accountsWithBalance.filter((account) => account.amount !== 0);
      }

      return accountsWithBalance;
    },
  });
};
