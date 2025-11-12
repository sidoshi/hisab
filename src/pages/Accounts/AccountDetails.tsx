import { FC, useState } from "react";
import { View, Card, Divider, Text, Loader, Button } from "reshaped";
import { useParams } from "@tanstack/react-router";
import { useAccountWithEntries } from "@/db/queries";
import { toLocaleString } from "@/utils";
import { EntriesTimeline } from "../Home/EntriesTimeline";
import { DeleteEntryModal } from "@/components/DeleteEntryModal";
import { EditEntryModal } from "@/components/EditEntryModal";
import { EntryWithAccount } from "@/db/schema";
import { Edit, Trash } from "react-feather";

export const AccountDetails: FC = () => {
  const { accountId } = useParams({ strict: false });
  const { data, isLoading } = useAccountWithEntries(accountId);

  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const [editEntry, setEditEntry] = useState<EntryWithAccount | null>(null);

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
        <View direction="row" justify="space-between">
          <View>
            <Text variant="featured-2">{data?.name}</Text>

            <View gap={4} direction="row" align="center">
              <Text variant="caption-1" color="neutral">
                {data?.code}
              </Text>

              <Text variant="caption-1" color="neutral">
                {data?.phone || "(No Phone)"}
              </Text>
            </View>

            <View gap={1} direction="row" align="center" paddingTop={10}>
              <Button size={"small"} icon={Edit} />
              <Button color="critical" size={"small"} icon={Trash} />
            </View>
          </View>

          <View>
            <Text
              variant="body-1"
              color={balance >= 0 ? "positive" : "critical"}
            >
              Balance: {balance >= 0 ? "+ " : "- "}
              {toLocaleString(balance)}
            </Text>
          </View>
        </View>
      </Card>

      <Divider />

      <EntriesTimeline
        entries={entriesWithAccount}
        setDeleteEntryId={setDeleteEntryId}
        setEditEntry={setEditEntry}
      />

      <DeleteEntryModal
        deleteEntryId={deleteEntryId}
        onClose={() => setDeleteEntryId(null)}
      />

      <EditEntryModal entry={editEntry} onClose={() => setEditEntry(null)} />
    </View>
  );
};
