import { FC, useRef } from "react";
import {
  Button,
  Card,
  FormControl,
  Modal,
  Tabs,
  Text,
  TextArea,
  TextField,
  useToast,
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
} from "@/pages/Home/EntriesBox/AccountsAutocomplete";
import {
  useCheckAccountCodeExists,
  useInsertAccount,
  useUpdateEntry,
} from "@/db/queries";
import { toLocaleString } from "@/utils";
import { EntryWithAccount } from "@/db/schema";
import { EntryFormSchema } from "@/pages/Home/EntriesBox/EntriesBox";
import { CheckCircle } from "react-feather";

type EntryFormInputs = {
  type: "debit" | "credit";
  selectedAccount: AccountAutocompleteSelection | null;
  amount: number;
  notes: string;
  code: string;
};

const EditEntryForm: FC<{
  entry: EntryWithAccount;
  onSubmit: SubmitHandler<EntryFormInputs>;
  onClose: () => void;
}> = ({ entry, onSubmit, onClose }) => {
  const accountSelectRef = useRef<HTMLInputElement>(null);
  const form = useForm<EntryFormInputs>({
    defaultValues: {
      selectedAccount: {
        type: AccountAutocompleteSelectionType.Existing,
        account: entry.account!,
      },
      amount: entry.amount,
      notes: entry.description || "",
      code: entry.account?.code || "",
      type: entry.type,
    },
    resolver: zodResolver(
      EntryFormSchema.extend({ type: z.enum(["debit", "credit"]) })
    ),
  });
  const { handleSubmit, watch, setError } = form;

  const codeValue = watch("code");
  const selectedAccount = watch("selectedAccount");
  const { data: codeExists } = useCheckAccountCodeExists(codeValue);

  const onFormSubmit: SubmitHandler<EntryFormInputs> = (data) => {
    if (
      codeExists != null &&
      selectedAccount?.type === AccountAutocompleteSelectionType.Create
    ) {
      setError("code", {
        type: "manual",
        message: "Code is already taken. Please choose another one.",
      });
      return;
    }

    onSubmit(data);
  };

  return (
    <View>
      <Card padding={3}>
        <FormProvider {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onFormSubmit)(e);
            }}
          >
            <View gap={3}>
              <Controller
                name="type"
                control={form.control}
                render={({ field }) => (
                  <Tabs
                    name="type"
                    value={field.value}
                    onChange={({ value }) => field.onChange(value)}
                  >
                    <Tabs.List>
                      <Tabs.Item value="debit">
                        <Text color="positive"> + DEBIT જમા</Text>
                      </Tabs.Item>
                      <Tabs.Item value="credit">
                        <Text color="critical"> - CREDIT ઉધાર</Text>
                      </Tabs.Item>
                    </Tabs.List>
                  </Tabs>
                )}
              />

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
                <Controller
                  name="notes"
                  control={form.control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      onChange={({ value }) => field.onChange(value)}
                      name="notes"
                      placeholder="Optionally add any extra notes"
                    />
                  )}
                />
              </FormControl>

              <View direction="row" justify="end" gap={2}>
                <Button type="submit" elevated variant="solid" color="positive">
                  Update
                </Button>

                <Button onClick={onClose} variant="faded" color="critical">
                  Close
                </Button>
              </View>
            </View>
          </form>
        </FormProvider>
      </Card>
    </View>
  );
};

type EditEntryModalProps = {
  entry: EntryWithAccount | null;
  onClose: () => void;
};

export const EditEntryModal: FC<EditEntryModalProps> = ({ entry, onClose }) => {
  const { mutateAsync: insertAccount } = useInsertAccount();
  const { mutateAsync: updateEntry } = useUpdateEntry();
  const toast = useToast();

  const onSubmit: SubmitHandler<EntryFormInputs> = async (data) => {
    if (entry == null) return;

    if (
      data.selectedAccount?.type === AccountAutocompleteSelectionType.Create
    ) {
      const newAccount = await insertAccount({
        name: data.selectedAccount.account.name,
        code: data.code,
      });

      await updateEntry({
        entryId: entry.id,
        entryUpdate: {
          accountId: newAccount.id,
          amount: data.amount,
          description: data.notes,
          type: data.type,
        },
      });
    } else {
      await updateEntry({
        entryId: entry.id,
        entryUpdate: {
          accountId: data.selectedAccount!.account.id,
          amount: data.amount,
          description: data.notes,
          type: data.type,
        },
      });
    }
    toast.show({
      text: "The entry has been updated successfully.",
      icon: CheckCircle,
    });

    onClose();
  };

  return (
    <Modal active={entry != null} onClose={onClose}>
      <View gap={2}>
        <Modal.Title>Edit Entry</Modal.Title>
        {entry && (
          <EditEntryForm entry={entry} onSubmit={onSubmit} onClose={onClose} />
        )}
      </View>
    </Modal>
  );
};
