import { FC, useRef } from "react";
import {
  Button,
  Card,
  FormControl,
  NumberField,
  Tabs,
  TextArea,
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

export const EntryFormSchema = z.object({
  selectedAccount: z
    .discriminatedUnion("type", [
      z.object({
        type: z.literal(AccountAutocompleteSelectionType.Existing),
        account: z.object({
          name: z.string().min(4, "Account name is required"),
          code: z.string(),
          id: z.number(),
          phone: z.string(),
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

  const onSubmit: SubmitHandler<EntryFormInputs> = (data) => {
    console.log(data, "submitted");
    reset();
    accountSelectRef.current?.focus();
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
                defaultValue="debit"
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
                    <NumberField
                      {...field}
                      name="amount"
                      hasError={!!fieldState.error}
                      increaseAriaLabel="increase"
                      decreaseAriaLabel="decrease"
                      placeholder="Enter amount"
                      min={0}
                      onChange={({ value }) => {
                        field.onChange(Number(value));
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
