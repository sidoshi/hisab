import { FC } from "react";
import { Button, Card, Popover, Text, useToast, View } from "reshaped";
import { useDb } from "@/db";
import { CheckCircle, Info } from "react-feather";
import { open, ask } from "@tauri-apps/plugin-dialog";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";
import * as path from "@tauri-apps/api/path";
import {
  getAccountsWithBalance,
  useInsertAccount,
  useInsertEntry,
} from "@/db/queries";
import { AccountWithBalance } from "@/db/schema";

type Snapshot = {
  accounts: AccountWithBalance[];
};

const SnapshotInfo: FC = () => (
  <Card>
    <View
      gap={4}
      padding={4}
      borderRadius="medium"
      backgroundColor="elevation-base"
      border
      borderColor="neutral-faded"
    >
      <Text variant="body-1">
        Over time you will notice that the app becomes slower as the entries
        grows in size. To mitigate this, you can snapshot your database. The old
        database will remain intact and can be accessed later if needed.
      </Text>

      <Text variant="body-1">
        On restoring from snapshot, the accounts will be copied over to the new
        database and each account will only have the last 1 entry representing
        its current balance. As a result, the ledger history will be reset but
        the ledger itself will remain accurate.
      </Text>
    </View>
  </Card>
);

export const DBSettings: FC = () => {
  const { dbPath, openDb, selectingDb, closeDb, db, schema } = useDb();

  const { mutateAsync: insertEntry } = useInsertEntry();
  const { mutateAsync: insertAccount } = useInsertAccount();

  const toast = useToast();

  async function createSnapshot() {
    if (dbPath == null) return;

    const data = await getAccountsWithBalance(false, db, schema);

    const dir = await open({
      directory: true,
      title: "Select the directory to save the snapshot",
      defaultPath: await path.dirname(dbPath),
    });
    if (dir == null) {
      toast.show({
        title: "Snapshot creation cancelled",
        color: "neutral",
      });
      return;
    }

    // Open file save dialog to get path
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .split("Z")[0];
    const filename = `hisab_snapshot_${timestamp}.json`;
    const filePath = await path.join(dir as string, filename);

    let encoder = new TextEncoder();
    const snapshot: Snapshot = {
      accounts: data,
    };
    let snapshotJSON = encoder.encode(JSON.stringify(snapshot));
    await writeFile(filePath, snapshotJSON);

    toast.show({
      title: `Snapshot saved to ${filePath}`,
      color: "positive",
      icon: <CheckCircle />,
    });
  }

  async function loadSnapshot() {
    if (dbPath == null) return;

    const data = await getAccountsWithBalance(false, db, schema);
    if (data.length > 0) {
      const answer = await ask(
        `The current database is not empty.
        We recommend loading snapshots into a fresh database to avoid data duplication.
        Are you sure you want to proceed? `,
        {
          title: "Restore Snapshot",
          kind: "warning",
          okLabel: "Proceed",
          cancelLabel: "Cancel",
        }
      );
      if (!answer) {
        toast.show({
          title: "Snapshot restore cancelled",
          color: "neutral",
        });
        return;
      }
    }

    const file = await open({
      multiple: false,
      directory: false,
      title: "Select the snapshot file to restore",
      filters: [
        {
          name: "JSON Files",
          extensions: ["json"],
        },
      ],
      defaultPath: await path.dirname(dbPath),
    });

    if (file == null) {
      toast.show({
        title: "Snapshot restore cancelled",
        color: "neutral",
      });
      return;
    }

    const snapshotData = await readFile(file as string);
    const decoder = new TextDecoder("utf-8");
    const snapshotJson = decoder.decode(snapshotData);
    const snapshot: Snapshot = JSON.parse(snapshotJson);

    // insert accounts and entries into db
    for (const account of snapshot.accounts) {
      const newAccount = await insertAccount({
        name: account.name,
        code: account.code,
        phone: account.phone,
      });

      // insert a single entry representing the balance
      await insertEntry({
        accountId: newAccount.id,
        amount: account.amount,
        type: account.type,
        description: "Snapshot restore - initial balance",
      });
    }

    toast.show({
      title: `Snapshot restored from ${file}`,
      color: "positive",
      icon: <CheckCircle />,
    });
  }

  return (
    <View gap={4} align="start">
      <View>
        <Text variant="featured-1" weight="bold">
          Database Settings
        </Text>
        <Text>Manage your database preferences</Text>
      </View>

      <View divided gap={4} paddingTop={6} direction="row">
        <Text variant="body-1" weight="bold">
          Location
        </Text>

        <View gap={2}>
          {dbPath != null && (
            <View
              border
              padding={4}
              backgroundColor="elevation-base"
              borderColor="neutral-faded"
              borderRadius="medium"
            >
              <Text variant="body-1">{dbPath}</Text>
            </View>
          )}

          <View gap={2} direction="row">
            {dbPath == null && (
              <Button
                variant="outline"
                color="primary"
                onClick={openDb}
                disabled={selectingDb}
              >
                {selectingDb ? "Selecting..." : "Open Database"}
              </Button>
            )}

            {dbPath != null && (
              <Button variant="outline" color="critical" onClick={closeDb}>
                Close Database and Exit
              </Button>
            )}
          </View>
        </View>
      </View>

      {dbPath != null && (
        <View divided gap={4} paddingTop={6} direction="row">
          <Text variant="body-1" weight="bold">
            Snapshots
          </Text>

          <View gap={2} direction="row">
            <Button variant="outline" onClick={createSnapshot}>
              Create Snapshot
            </Button>

            <Button variant="outline" onClick={loadSnapshot}>
              Restore from Snapshot
            </Button>

            <Popover width="calc(var(--rs-unit-x1) * 100)">
              <Popover.Trigger>
                {(attributes) => (
                  <Button
                    attributes={attributes}
                    variant="outline"
                    icon={Info}
                  />
                )}
              </Popover.Trigger>
              <Popover.Content>
                <SnapshotInfo />
              </Popover.Content>
            </Popover>
          </View>
        </View>
      )}
    </View>
  );
};
