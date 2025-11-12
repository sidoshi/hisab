import { FC, RefObject, useEffect, useState } from "react";
import { Autocomplete, FormControl, Grid, MenuItem, TextField } from "reshaped";

import { useController, useFormContext, useWatch } from "react-hook-form";
import { Account } from "@/db/schema";
import {
  useAutocompleteAccounts,
  useCheckAccountCodeExists,
} from "@/db/queries";

function shortCodeFromName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 3).toUpperCase();
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];

  return (firstName.substring(0, 2) + lastName.substring(0, 1)).toUpperCase();
}

export enum AccountAutocompleteSelectionType {
  Existing = "existing",
  Create = "create",
}

export type AccountAutocompleteSelection =
  | {
      type: AccountAutocompleteSelectionType.Existing;
      account: Account;
    }
  | {
      type: AccountAutocompleteSelectionType.Create;
      account: {
        name: string;
      };
    };

const existing = (account: Account) => ({
  type: AccountAutocompleteSelectionType.Existing,
  account,
});

const create = (name: string) => ({
  type: AccountAutocompleteSelectionType.Create,
  account: { name },
});

type AccountsAutocompleteProps = {
  accountSelectRef: RefObject<HTMLInputElement | null>;
};

export const AccountAutocomplete: FC<AccountsAutocompleteProps> = ({
  accountSelectRef,
}) => {
  const { control, setError, clearErrors } = useFormContext();

  const selectedAccount = useWatch({
    control,
    name: "selectedAccount",
  });

  const [text, setText] = useState(selectedAccount?.account?.name || "");
  const { data: accounts } = useAutocompleteAccounts(text);

  useEffect(() => {
    if (selectedAccount) {
      setText(selectedAccount.account.name.toUpperCase());
    } else {
      setText("");
    }
  }, [selectedAccount?.account?.name]);

  const filteredAccounts = accounts
    .filter((account) =>
      account.name.toLowerCase().includes(text.toLowerCase())
    )
    .slice(0, 5);

  const selectedAccountField = useController({
    control,
    name: "selectedAccount",
    rules: { required: true },
  });
  const codeField = useController({
    control,
    name: "code",
    rules: { required: true },
    disabled:
      selectedAccount?.type === AccountAutocompleteSelectionType.Existing,
  });

  const { data: codeExists } = useCheckAccountCodeExists(codeField.field.value);
  useEffect(() => {
    clearErrors("code");
    if (
      codeExists &&
      selectedAccount?.type === AccountAutocompleteSelectionType.Create
    ) {
      setError("code", {
        type: "manual",
        message: "Code is already taken. Please choose another one.",
      });
    }
  }, [codeExists]);

  const setCodeOnAccountSelect = (account: AccountAutocompleteSelection) => {
    if (account.type === AccountAutocompleteSelectionType.Existing) {
      codeField.field.onChange(account.account.code);
    } else {
      codeField.field.onChange(shortCodeFromName(account.account.name));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const addNewOption = (
    <Autocomplete.Item key={text} value={text} data={create(text)}>
      Add New: "{text}"
    </Autocomplete.Item>
  );

  return (
    <Grid columns="1fr 1fr" rows="1fr" gap={4}>
      <div onKeyDown={handleKeyDown}>
        <FormControl required>
          <FormControl.Label>Account</FormControl.Label>
          <Autocomplete
            {...selectedAccountField.field}
            placeholder="Select or add account"
            value={text}
            inputAttributes={{
              ref: accountSelectRef,
              autoCapitalize: "off",
              autoCorrect: "off",
            }}
            onChange={({ value }) => {
              setText(value.toUpperCase());
            }}
            onBlur={() => {
              if (selectedAccount == null) {
                setText("");
              }
              if (text !== selectedAccount) {
                setText(selectedAccount?.account?.name || "");
              }
            }}
            hasError={!!selectedAccountField.fieldState.error}
            onItemSelect={({ data }) => {
              let selectedAccount = data as AccountAutocompleteSelection;
              selectedAccountField.field.onChange(selectedAccount);
              setText(selectedAccount.account.name.toUpperCase());
              setCodeOnAccountSelect(selectedAccount);
            }}
          >
            {filteredAccounts.length === 0 && text !== "" ? addNewOption : null}
            {filteredAccounts.map((option) => (
              <Autocomplete.Item
                key={option.id}
                value={option.name}
                data={existing(option)}
              >
                <MenuItem>
                  {option.name} ({option.code})
                </MenuItem>
              </Autocomplete.Item>
            ))}
          </Autocomplete>
          <FormControl.Helper>
            {selectedAccountField.fieldState.error?.message}
          </FormControl.Helper>
        </FormControl>
      </div>

      <FormControl required>
        <FormControl.Label>Code</FormControl.Label>
        <TextField
          {...codeField.field}
          hasError={!!codeField.fieldState.error}
          inputAttributes={{
            autoCapitalize: "off",
            autoCorrect: "off",
          }}
          onChange={(e) => codeField.field.onChange(e.value.toUpperCase())}
          placeholder="Enter code"
        />
        <FormControl.Helper>
          {codeField.fieldState.error?.message}
        </FormControl.Helper>
      </FormControl>
    </Grid>
  );
};
