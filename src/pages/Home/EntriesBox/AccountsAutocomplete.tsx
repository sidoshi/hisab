import { FC, useEffect, useState } from "react";
import { Autocomplete, FormControl, TextField, View } from "reshaped";

type Account = {
  name: string;
  code: string;
  id: number;
  phone: string;
};

enum AccountAutocompleteSelectionType {
  Existing = "existing",
  Create = "Create",
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
        code: string;
      };
    };

type AccountAutocompleteProps = {
  onSelect: (selection: AccountAutocompleteSelection) => void;
  value: AccountAutocompleteSelection | null;
};

const accounts: Account[] = [
  { id: 1, name: "Rajesh Shah", code: "RJS", phone: "1234567890" },
  { id: 2, name: "Manish Doshi", code: "MND", phone: "0987654321" },
  { id: 3, name: "Noor Shaikh", code: "NRS", phone: "1122334455" },
];

const existing = (account: Account) => ({
  type: AccountAutocompleteSelectionType.Existing,
  account,
});

const create = (name: string) => ({
  type: AccountAutocompleteSelectionType.Create,
  account: { name, code: "" },
});

export const AccountAutocomplete: FC<AccountAutocompleteProps> = ({
  onSelect,
  value,
}) => {
  const [text, setText] = useState(value?.account.name || "");

  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(text.toLowerCase())
  );

  useEffect(() => {
    if (value) {
      setText(value.account.name);
    }
  }, [value]);

  const addNewOption = (
    <Autocomplete.Item key={text} value={text} data={create(text)}>
      Add New: "{text}"
    </Autocomplete.Item>
  );

  return (
    <View direction="row" gap={4}>
      <FormControl required>
        <FormControl.Label>Account</FormControl.Label>
        <Autocomplete
          name="account"
          placeholder="Select or add account"
          value={text}
          inputAttributes={{
            autoCapitalize: "off",
            autoCorrect: "off",
          }}
          onChange={({ value }) => setText(value)}
          onItemSelect={({ data }) => {
            onSelect(data as AccountAutocompleteSelection);
          }}
        >
          {filteredAccounts.length === 0 && text !== "" ? addNewOption : null}
          {filteredAccounts.map((option) => (
            <Autocomplete.Item
              key={option.id}
              value={option.name}
              data={existing(option)}
            >
              {option.name}
            </Autocomplete.Item>
          ))}
        </Autocomplete>
      </FormControl>

      <FormControl required>
        <FormControl.Label>Code</FormControl.Label>
        <TextField
          onChange={(e) => {
            onSelect({
              type: AccountAutocompleteSelectionType.Create,
              account: {
                name: value?.account.name || "",
                code: e.value,
              },
            });
          }}
          name="code"
          placeholder="Enter code"
          value={value?.account.code || ""}
          disabled={value?.type === AccountAutocompleteSelectionType.Existing}
        />
      </FormControl>
    </View>
  );
};
