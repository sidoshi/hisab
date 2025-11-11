import { FC } from "react";
import { Edit, Trash } from "react-feather";
import {
  Badge,
  Button,
  Card,
  Divider,
  Pagination,
  Text,
  Timeline,
  View,
} from "reshaped";

import { Account, Entry } from "@/db/schema";
import { Link } from "@tanstack/react-router";
import { toLocaleString } from "@/utils";

type TimelineEntry = Omit<Entry, "accountId"> & {
  account: Account | null;
};

type EntriesTimelineProps = {
  entries: TimelineEntry[];
  pagination?: {
    total: number;
    page: number;
    onPageChange: (page: number) => void;
  };
};

export const EntriesTimeline: FC<EntriesTimelineProps> = ({
  entries,
  pagination,
}) => {
  return (
    <View paddingInline={8} gap={8}>
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
                    {entry.type === "debit" ? "+" : "-"} ₹{" "}
                    {toLocaleString(entry.amount)}
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

      {pagination && (
        <View paddingBottom={10} align="center" justify="center">
          <Pagination
            total={pagination.total}
            previousAriaLabel="Previous page"
            nextAriaLabel="Next page"
            pageAriaLabel={(args) => `Page ${args.page}`}
            onChange={(args) => pagination.onPageChange(args.page - 1)}
            page={pagination.page + 1}
          />
        </View>
      )}
    </View>
  );
};
