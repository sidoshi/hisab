import { FC, useState } from "react";
import {
  Button,
  Grid,
  Modal,
  ScrollArea,
  Text,
  useToast,
  View,
} from "reshaped";
import { EntriesBox } from "./EntriesBox/EntriesBox";
import { EntriesTimeline } from "./EntriesTimeline";
import { useDeleteEntry, usePaginatedEntries } from "@/db/queries";
import { CheckCircle } from "react-feather";

const PAGE_SIZE = 50;

export const Home: FC = () => {
  const [page, setPage] = useState(0);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const {
    data: { entries, total },
  } = usePaginatedEntries(page, PAGE_SIZE);

  const { mutateAsync: deleteEntry } = useDeleteEntry();
  const toast = useToast();

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
          />
        </ScrollArea>
      </Grid>

      <Modal
        active={deleteEntryId != null}
        onClose={() => setDeleteEntryId(null)}
      >
        <View gap={2}>
          <Modal.Title>Delete Entry</Modal.Title>
          <Text>
            Are you sure you want to delete this entry? This action cannot be
            undone.
          </Text>

          <View direction="row" justify="end" gap={2}>
            <Button variant="ghost" onClick={() => setDeleteEntryId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                deleteEntry(deleteEntryId!);
                toast?.show({
                  text: "The entry has been deleted successfully.",
                  icon: CheckCircle,
                });
                setDeleteEntryId(null);
              }}
              color="critical"
            >
              Delete
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};
