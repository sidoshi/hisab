import { Text, View } from "reshaped";
import { DBSettings } from "./db/DatabaseSettings";
import { FC } from "react";
import { useDb } from "./db";

const Layout: FC = () => {
  return (
    <View padding={4} gap={3} align="start">
      <Text variant="featured-2" weight="bold">
        Chandan Hisab
      </Text>
    </View>
  );
};

function App() {
  const { dbPath } = useDb();

  return dbPath ? (
    <Layout />
  ) : (
    <View gap={3} align="center" justify="center" height="100vh" padding={4}>
      <DBSettings />
    </View>
  );
}

export default App;
