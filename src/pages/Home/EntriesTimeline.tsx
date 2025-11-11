import { FC } from "react";
import { Edit, Trash } from "react-feather";
import { Badge, Button, Card, Divider, Text, Timeline, View } from "reshaped";

import { Account, Entry } from "@/db/schema";
import { Link } from "@tanstack/react-router";

type TimelineEntry = Omit<Entry, "accountId"> & {
  account: Account | null;
};

export const EntriesTimeline: FC<{ entries: TimelineEntry[] }> = ({
  entries,
}) => {
  return (
    <View padding={3}>
      <Text variant="featured-1">Recent Entries</Text>
      <Divider />

      <View paddingTop={5}>
        <Timeline>
          {entries.map((entry) => (
            <Timeline.Item key={entry.id} markerSlot={null}>
              <Card padding={2}>
                <View
                  padding={2}
                  borderRadius="medium"
                  backgroundColor="neutral-faded"
                  gap={2}
                >
                  <View direction="row" justify="space-between" align="center">
                    <View gap={2} direction="row" align="center">
                      <Badge
                        color={entry.type === "debit" ? "positive" : "critical"}
                      >
                        {entry.type.toUpperCase()}
                      </Badge>

                      <Badge variant="outline">{entry.createdAt}</Badge>
                    </View>

                    <View gap={1} justify="end" direction="row">
                      <Button size="small" icon={<Edit />}></Button>
                      <Button
                        size="small"
                        color="critical"
                        icon={<Trash />}
                      ></Button>
                    </View>
                  </View>

                  <Divider />

                  <View paddingTop={2} direction="row" justify="space-between">
                    <View gap={1}>
                      <Link
                        style={{ textDecoration: "none", color: "inherit" }}
                        to={`/accounts/${entry.account?.id}`}
                      >
                        <Text variant="featured-2">{entry.account?.name}</Text>
                      </Link>

                      <View direction="row" gap={6} align="center">
                        <Text variant="caption-1">{entry.account?.code}</Text>
                        {entry.account?.phone && (
                          <Text variant="caption-1" color="neutral">
                            {entry.account?.phone}
                          </Text>
                        )}
                      </View>
                    </View>

                    <Text
                      variant="title-6"
                      color={entry.type === "debit" ? "positive" : "critical"}
                    >
                      {entry.type === "debit" ? "+" : "-"} ₹ {entry.amount}
                    </Text>
                  </View>

                  <View>
                    {entry.description && (
                      <Text variant="body-3" color="neutral-faded">
                        Notes: {entry.description}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      </View>
    </View>
  );
};
