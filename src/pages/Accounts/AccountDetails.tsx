import { FC } from "react";
import { View, Card, Divider, Text, Loader } from "reshaped";
import { useParams } from "@tanstack/react-router";
import { useAccountWithBalance } from "@/db/queries";
import { toLocaleString } from "@/utils";

export const AccountDetails: FC = () => {
  const { accountId } = useParams({ strict: false });
  const { data, isLoading } = useAccountWithBalance(accountId);

  if (isLoading) {
    return (
      <View justify="center" align="center" height="80vh">
        <Loader />
      </View>
    );
  }

  const balance = data?.balance || 0;
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
    </View>
  );
};
