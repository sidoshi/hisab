import { useAccountsWithBalance } from "@/db/queries";
import { toLocaleString } from "@/utils";
import { Link } from "@tanstack/react-router";
import { FC } from "react";
import { View, Text, Table, Grid, Loader, Divider, Card } from "reshaped";

export const Ledger: FC = () => {
  const { data, isLoading } = useAccountsWithBalance();

  if (isLoading) {
    return (
      <View justify="center" align="center" height="80vh">
        <Loader />
      </View>
    );
  }

  const debitAccounts =
    data?.filter((account) => account.type === "debit") || [];
  const debitTotal = debitAccounts.reduce(
    (sum, account) => sum + account.amount,
    0
  );

  const creditAccounts =
    data?.filter((account) => account.type === "credit") || [];
  const creditTotal = creditAccounts.reduce(
    (sum, account) => sum + account.amount,
    0
  );

  const balance = debitTotal + creditTotal;

  return (
    <View padding={4} paddingInline={15} gap={4}>
      <Card>
        <View direction="row" justify="space-between" align="center">
          <Text variant="featured-1">Ledger</Text>

          <Text variant="body-1" color={balance >= 0 ? "positive" : "critical"}>
            Balance: {balance >= 0 ? "+ " : "- "}
            {toLocaleString(balance)}
          </Text>
        </View>
      </Card>

      <Divider />

      <Grid columns="1fr 1fr" rows="1fr" gap={2}>
        <Card elevated padding={0}>
          <Table>
            <Table.Row highlighted>
              <Table.Heading>Account</Table.Heading>
              <Table.Heading>Debit</Table.Heading>
            </Table.Row>

            {debitAccounts.map((account) => (
              <Table.Row key={account.id}>
                <Table.Cell>
                  <View>
                    <Link to={`/accounts/${account.id}`}>
                      <Text>{account.name}</Text>
                    </Link>
                  </View>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="featured-3" color="positive">
                    + {toLocaleString(account.amount)}
                  </Text>
                </Table.Cell>
              </Table.Row>
            ))}

            <Table.Row>
              <Table.Cell>
                <Text weight="bold">Total</Text>
              </Table.Cell>
              <Table.Cell>
                <Text variant="featured-2" weight="bold" color="positive">
                  + {toLocaleString(debitTotal)}
                </Text>
              </Table.Cell>
            </Table.Row>
          </Table>
        </Card>

        <Card elevated padding={0}>
          <Table>
            <Table.Row highlighted>
              <Table.Heading>Account</Table.Heading>
              <Table.Heading>Credit</Table.Heading>
            </Table.Row>

            {creditAccounts.map((account) => (
              <Table.Row key={account.id}>
                <Table.Cell>
                  <View>
                    <Link to={`/accounts/${account.id}`}>
                      <Text>{account.name}</Text>
                    </Link>
                  </View>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="featured-3" color="critical">
                    - {toLocaleString(account.amount)}
                  </Text>
                </Table.Cell>
              </Table.Row>
            ))}

            <Table.Row>
              <Table.Cell>
                <Text weight="bold">Total</Text>
              </Table.Cell>
              <Table.Cell>
                <Text variant="featured-2" weight="bold" color="critical">
                  - {toLocaleString(creditTotal)}
                </Text>
              </Table.Cell>
            </Table.Row>
          </Table>
        </Card>
      </Grid>
    </View>
  );
};
