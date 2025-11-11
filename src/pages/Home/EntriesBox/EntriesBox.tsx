import { FC, useState } from "react";
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
  AccountAutocomplete,
  AccountAutocompleteSelection,
} from "./AccountsAutocomplete";

export const EntriesBox: FC = () => {
  const [selectedAccount, setSelectedAccount] =
    useState<AccountAutocompleteSelection | null>(null);

  return (
    <View>
      <Card padding={3}>
        <form onSubmit={(e) => e.preventDefault()}>
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

            <AccountAutocomplete
              value={selectedAccount}
              onSelect={setSelectedAccount}
            />

            <FormControl required>
              <FormControl.Label>Amount</FormControl.Label>
              <NumberField
                onChange={console.log}
                increaseAriaLabel="Increase value"
                decreaseAriaLabel="Decrease value"
                name="amount"
                placeholder="Enter amount"
              />
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

              <Button type="reset" variant="faded" color="critical">
                Clear
              </Button>
            </View>
          </View>
        </form>
      </Card>
    </View>
  );
};
