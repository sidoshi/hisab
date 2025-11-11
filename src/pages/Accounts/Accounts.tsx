import { useAccountsWithBalance } from "@/db/queries";
import { toLocaleString } from "@/utils";
import { Link } from "@tanstack/react-router";
import { FC } from "react";
import { Card, Divider, Loader, Table, Text, View } from "reshaped";

export const Accounts: FC = () => {
  const { data, isLoading } = useAccountsWithBalance();

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

      <Card elevated padding={0}>
        <Table>
          <Table.Row highlighted>
            <Table.Heading>ID</Table.Heading>
            <Table.Heading>Account</Table.Heading>
            <Table.Heading>Code</Table.Heading>
            <Table.Heading>Balance</Table.Heading>
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
                  <Text
                    color={account.type === "debit" ? "positive" : "critical"}
                    weight="bold"
                  >
                    {account.type === "debit" ? "+ " : "- "}
                    {toLocaleString(account.amount)}
                  </Text>
                </View>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>
      </Card>
    </View>
  );
};
