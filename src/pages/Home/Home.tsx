import { FC } from "react";
import { Grid, View } from "reshaped";
import { EntriesBox } from "./EntriesBox";
import { EntriesTimeline } from "./EntriesTimeline";

export const Home: FC = () => {
  return (
    <View padding={3}>
      <Grid columns="1fr 2fr" rows="1fr" gap={4}>
        <EntriesBox />
        <EntriesTimeline />
      </Grid>
    </View>
  );
};
