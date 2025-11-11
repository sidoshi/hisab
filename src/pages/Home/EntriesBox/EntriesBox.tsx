import { FC, useRef, useState } from "react";
import {
  Button,
  Card,
  FormControl,
  Tabs,
  TextArea,
  TextField,
  View,
} from "reshaped";
import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  AccountAutocomplete,
  AccountAutocompleteSelection,
  AccountAutocompleteSelectionType,
} from "./AccountsAutocomplete";
import { useInsertAccount, useInsertEntry } from "@/db/queries";
import { toLocaleString } from "@/utils";

export const EntryFormSchema = z.object({
  selectedAccount: z
    .discriminatedUnion("type", [
      z.object({
        type: z.literal(AccountAutocompleteSelectionType.Existing),
        account: z.object({
          name: z.string().min(4, "Account name is required"),
          code: z.string(),
          id: z.number(),
          phone: z.string().nullable(),
          createdAt: z.string(),
          updatedAt: z.string(),
          deletedAt: z.string().nullable(),
        }),
      }),
      z.object({
        type: z.literal(AccountAutocompleteSelectionType.Create),
        account: z.object({
          name: z.string(),
        }),
      }),
    ])
    .nullable()
    .refine((value) => value !== null, {
      message: "Please select an account",
    }),
  amount: z.number().positive("Amount must be greater than 0"),
  notes: z.string(),
  code: z.string().min(2, "Code is required"),
});

type EntryFormInputs = {
  selectedAccount: AccountAutocompleteSelection | null;
  amount: number;
  notes: string;
  code: string;
};

export const EntriesBox: FC = () => {
  const [entryType, setEntryType] = useState<"debit" | "credit">("debit");

  const accountSelectRef = useRef<HTMLInputElement>(null);
  const form = useForm<EntryFormInputs>({
    defaultValues: {
      selectedAccount: null,
      amount: 0,
      notes: "",
      code: "",
    },
    resolver: zodResolver(EntryFormSchema),
  });
  const { handleSubmit, reset } = form;

  const { mutateAsync: insertAccount } = useInsertAccount();
  const { mutateAsync: insertEntry } = useInsertEntry();

  const onSubmit: SubmitHandler<EntryFormInputs> = async (data) => {
    if (
      data.selectedAccount?.type === AccountAutocompleteSelectionType.Create
    ) {
      const newAccount = await insertAccount({
        name: data.selectedAccount.account.name,
        code: data.code,
      });

      await insertEntry({
        accountId: newAccount.id,
        amount: data.amount,
        description: data.notes,
        type: entryType,
      });
    } else {
      await insertEntry({
        accountId: data.selectedAccount!.account.id,
        amount: data.amount,
        description: data.notes,
        type: entryType,
      });
    }

    accountSelectRef.current?.focus();
    setTimeout(() => {
      reset();
    }, 50);
  };

  return (
    <View>
      <Card padding={3}>
        <FormProvider {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }}
          >
            <View gap={3}>
              <Tabs
                itemWidth="equal"
                variant="pills-elevated"
                size="large"
                value={entryType}
                onChange={({ value }) =>
                  setEntryType(value as "debit" | "credit")
                }
              >
                <Tabs.List>
                  <Tabs.Item value="debit">DEBIT</Tabs.Item>
                  <Tabs.Item value="credit">CREDIT</Tabs.Item>
                </Tabs.List>
              </Tabs>

              <AccountAutocomplete accountSelectRef={accountSelectRef} />

              <FormControl required>
                <FormControl.Label>Amount</FormControl.Label>
                <Controller
                  name="amount"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={toLocaleString(field.value)}
                      name="amount"
                      hasError={!!fieldState.error}
                      placeholder="Enter amount"
                      onChange={({ value }) => {
                        const numberValue = Number(
                          value.toString().replace(/,/g, "")
                        );
                        if (isNaN(numberValue) || numberValue < 0) {
                          return;
                        }
                        field.onChange(numberValue);
                      }}
                    />
                  )}
                />
                <FormControl.Helper>
                  {form.formState.errors.amount?.message}
                </FormControl.Helper>
              </FormControl>

              <FormControl>
                <FormControl.Label>Notes</FormControl.Label>
                <TextArea
                  name="notes"
                  placeholder="Optionally add any extra notes"
                />
              </FormControl>

              <View direction="row" justify="end" gap={2}>
                <Button type="submit" elevated variant="solid" color="positive">
                  Enter
                </Button>

                <Button
                  onClick={() => reset()}
                  variant="faded"
                  color="critical"
                >
                  Clear
                </Button>
              </View>
            </View>
          </form>
        </FormProvider>
      </Card>
    </View>
  );
};
