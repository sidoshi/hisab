import { DeleteAccountModal } from "@/components/DeleteAccountModal";
import { useAccountsWithBalance } from "@/db/queries";
import { toLocaleString } from "@/utils";
import { Link } from "@tanstack/react-router";
import { FC, useEffect, useState } from "react";
import { Edit, Trash } from "react-feather";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  FormControl,
  Loader,
  Table,
  Text,
  View,
} from "reshaped";

export const Accounts: FC = () => {
  const [deleteAccountId, setDeleteAccountId] = useState<number | null>(null);
  const [filterZeroBalance, setFilterZeroBalance] = useState(true);
  const { data, isLoading, refetch } =
    useAccountsWithBalance(filterZeroBalance);

  useEffect(() => {
    refetch();
  }, [filterZeroBalance, refetch]);

  if (isLoading) {
    return (
      <View justify="center" align="center" height="80vh">
        <Loader />
      </View>
    );
  }

  return (
    <View padding={4} paddingInline={15} gap={4}>
      <Card>
        <View direction="row" justify="space-between" align="center">
          <Text variant="featured-1">Accounts</Text>

          <Text variant="body-1" color="primary">
            Accounts: {data?.length || 0}
          </Text>
        </View>
      </Card>

      <Divider />

      <View>
        <View direction="row" align="center" justify="end" padding={2} gap={2}>
          <FormControl>
            <Checkbox
              name="filterZeroBalance"
              checked={filterZeroBalance}
              onChange={({ checked }) => {
                setFilterZeroBalance(checked);
              }}
            />
          </FormControl>
          <FormControl.Label>Filter 0 Balance Accounts</FormControl.Label>
        </View>
        <Card elevated padding={0}>
          <Table>
            <Table.Row highlighted>
              <Table.Heading>ID</Table.Heading>
              <Table.Heading>Account</Table.Heading>
              <Table.Heading>Code</Table.Heading>
              <Table.Heading>Phone</Table.Heading>
              <Table.Heading>Balance</Table.Heading>
              <Table.Heading></Table.Heading>
            </Table.Row>

            {data?.map((account) => (
              <Table.Row key={account.id}>
                <Table.Cell>
                  <View>
                    <Text>{account.id}</Text>
                  </View>
                </Table.Cell>
                <Table.Cell>
                  <View>
                    <Link to={`/accounts/${account.id}`}>
                      <Text>{account.name}</Text>
                    </Link>
                  </View>
                </Table.Cell>
                <Table.Cell>
                  <View>
                    <Text>{account.code}</Text>
                  </View>
                </Table.Cell>
                <Table.Cell>
                  <View>
                    <Text>{account.phone || "-"}</Text>
                  </View>
                </Table.Cell>
                <Table.Cell>
                  <View>
                    <Text
                      color={account.type === "debit" ? "positive" : "critical"}
                      weight="bold"
                    >
                      {account.type === "debit" ? "+ " : "- "}
                      {toLocaleString(account.amount)}
                    </Text>
                  </View>
                </Table.Cell>

                <Table.Cell align="end" width="80px">
                  <View width="80px" gap={2} direction="row" justify="end">
                    <Button size="small" icon={Edit}></Button>
                    <Button
                      size="small"
                      color="critical"
                      onClick={() => setDeleteAccountId(account.id)}
                      icon={Trash}
                    ></Button>
                  </View>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table>
        </Card>
      </View>

      <DeleteAccountModal
        deleteAccountId={deleteAccountId}
        onClose={() => setDeleteAccountId(null)}
      />
    </View>
  );
};
