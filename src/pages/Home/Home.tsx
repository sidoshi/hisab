import { FC, useState } from "react";
import { Grid, ScrollArea, View } from "reshaped";
import { EntriesBox } from "./EntriesBox/EntriesBox";
import { EntriesTimeline } from "./EntriesTimeline";
import { usePaginatedEntries } from "@/db/queries";

const PAGE_SIZE = 2;

export const Home: FC = () => {
  const [page, setPage] = useState(0);
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
          />
        </ScrollArea>
      </Grid>
    </View>
  );
};
