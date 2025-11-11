import { FC } from "react";
import { Edit, Trash } from "react-feather";
import { Badge, Button, Card, Divider, Text, Timeline, View } from "reshaped";

const entries = [
  {
    id: 1,
    amount: 500,
    account: "Rajesh Shah",
    type: "debit",
    code: "RJS",
    date: "2024-10-01",
    phone: "123-456-7890",
    notes: null,
  },
  {
    id: 2,
    amount: 200,
    account: "Manish Doshi",
    code: "MND",
    type: "credit",
    date: "2024-10-02",
    notes: "Payment received",
    phone: null,
  },
  {
    id: 3,
    amount: 150,
    account: "Noor Shaikh",
    code: "NRS",
    type: "debit",
    date: "2024-10-03",
    notes: null,
  },
  {
    id: 4,
    amount: 300,
    account: "Rajesh Shah",
    code: "RJS",
    type: "credit",
    date: "2024-10-04",
    phone: "987-654-3210",
    notes: "Refund issued",
  },
  {
    id: 5,
    amount: 400,
    account: "Fatima Khan",
    code: "FTK",
    type: "debit",
    date: "2024-10-05",
    phone: null,
    notes: "Purchase of supplies",
  },
];

export const EntriesTimeline: FC = () => {
  return (
    <View padding={3}>
      <Text variant="featured-1">Recent Entries</Text>
      <Divider />

      <View paddingTop={5}>
        <Timeline>
          {entries.map((entry) => (
            <Timeline.Item markerSlot={null}>
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

                      <Badge variant="outline">{entry.date}</Badge>
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
                      <Text variant="featured-2">{entry.account}</Text>
                      <View direction="row" gap={6} align="center">
                        <Text variant="caption-1">{entry.code}</Text>
                        {entry.phone && (
                          <Text variant="caption-1" color="neutral">
                            {entry.phone}
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
                    {entry.notes && (
                      <Text variant="body-3" color="neutral-faded">
                        Notes: {entry.notes}
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
