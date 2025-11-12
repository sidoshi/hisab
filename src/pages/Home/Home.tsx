import { FC, useState } from "react";
import { Grid, ScrollArea, View } from "reshaped";
import { EntriesBox } from "./EntriesBox/EntriesBox";
import { EntriesTimeline } from "./EntriesTimeline";
import { usePaginatedEntries } from "@/db/queries";
import { DeleteEntryModal } from "@/components/DeleteEntryModal";
import { EntryWithAccount } from "@/db/schema";
import { EditEntryModal } from "@/components/EditEntryModal";

const PAGE_SIZE = 50;

export const Home: FC = () => {
  const [page, setPage] = useState(0);

  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const [editEntry, setEditEntry] = useState<EntryWithAccount | null>(null);

  const {
    data: { entries, total },
  } = usePaginatedEntries(page, PAGE_SIZE);

  return (
    <View padding={4}>
      <Grid columns="1fr 2fr" rows="1fr" gap={4}>
        <EntriesBox />
        <ScrollArea height="calc(100vh - 80px)">
          <EntriesTimeline
            pagination={{
              page,
              onPageChange: setPage,
              total: Math.ceil(total / PAGE_SIZE),
            }}
            entries={entries}
            setDeleteEntryId={setDeleteEntryId}
            setEditEntry={setEditEntry}
          />
        </ScrollArea>
      </Grid>

      <DeleteEntryModal
        deleteEntryId={deleteEntryId}
        onClose={() => setDeleteEntryId(null)}
      />

      <EditEntryModal entry={editEntry} onClose={() => setEditEntry(null)} />
    </View>
  );
};
