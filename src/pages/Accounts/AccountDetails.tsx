import { FC } from "react";
import { View, Card, Divider, Text, Loader } from "reshaped";
import { useParams } from "@tanstack/react-router";
import { useAccountWithEntries } from "@/db/queries";
import { toLocaleString } from "@/utils";
import { EntriesTimeline } from "../Home/EntriesTimeline";

export const AccountDetails: FC = () => {
  const { accountId } = useParams({ strict: false });
  const { data, isLoading } = useAccountWithEntries(accountId);

  if (isLoading || data == null) {
    return (
      <View justify="center" align="center" height="80vh">
        <Loader />
      </View>
    );
  }

  const balance = data.balance;

  const { entries, ...account } = data;
  const entriesWithAccount = entries.map((entry) => ({
    ...entry,
    account: account,
  }));
  return (
    <View padding={4} paddingInline={15} gap={4}>
      <Card>
        <View direction="row" justify="space-between" align="center">
          <Text variant="featured-2">{data?.name}</Text>

          <Text variant="body-1" color={balance >= 0 ? "positive" : "critical"}>
            Balance: {balance >= 0 ? "+ " : "- "}
            {toLocaleString(balance)}
          </Text>
        </View>
      </Card>

      <Divider />

      <EntriesTimeline entries={entriesWithAccount} />
    </View>
  );
};
