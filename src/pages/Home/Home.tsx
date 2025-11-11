import { FC } from "react";
import { Grid, View } from "reshaped";
import { EntriesBox } from "./EntriesBox/EntriesBox";
import { EntriesTimeline } from "./EntriesTimeline";
import { usePaginatedEntries } from "@/db/queries";

export const Home: FC = () => {
  const {
    data: { entries },
  } = usePaginatedEntries();

  return (
    <View padding={3}>
      <Grid columns="1fr 2fr" rows="1fr" gap={4}>
        <EntriesBox />
        <EntriesTimeline entries={entries} />
      </Grid>
    </View>
  );
};
