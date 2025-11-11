import { FC } from "react";
import {
  Autocomplete,
  Button,
  Card,
  FormControl,
  NumberField,
  Tabs,
  TextArea,
  TextField,
  View,
} from "reshaped";

function AccountAutocomplete() {
  const options = ["Rajesh Shah", "Manish Doshi", "Noor Shaikh"];

  return (
    <FormControl required>
      <FormControl.Label>Account</FormControl.Label>
      <Autocomplete
        name="account"
        placeholder="Select or add account"
        value=""
        onChange={console.log}
      >
        {options.map((option) => (
          <Autocomplete.Item key={option} value={option}>
            {option}
          </Autocomplete.Item>
        ))}
      </Autocomplete>
    </FormControl>
  );
}

export const EntriesBox: FC = () => {
  return (
    <View>
      <Card padding={3}>
        <View gap={3} as="form">
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

          <AccountAutocomplete />

          <View direction="row" gap={4}>
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
            <FormControl required>
              <FormControl.Label>Code</FormControl.Label>
              <TextField
                onChange={console.log}
                name="code"
                placeholder="Enter code"
                value="RJS"
                disabled
              />
            </FormControl>
          </View>

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
      </Card>
    </View>
  );
};
