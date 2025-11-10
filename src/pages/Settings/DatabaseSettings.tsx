import { FC } from "react";
import { Button, Text, View } from "reshaped";
import { useDb } from "@/db";

export const DBSettings: FC = () => {
  const { dbPath, openDb, selectingDb, closeDb } = useDb();

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
            <Button
              variant="outline"
              color="primary"
              onClick={openDb}
              disabled={selectingDb}
            >
              {selectingDb
                ? "Selecting..."
                : dbPath == null
                ? "Open Database"
                : "Change Database"}
            </Button>

            {dbPath != null && (
              <Button variant="outline" color="critical" onClick={closeDb}>
                Close Database
              </Button>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
