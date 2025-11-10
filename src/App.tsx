import { Button, Text, View } from "reshaped";
import { DBSettings } from "./db/DatabaseSettings";
import { FC, useState } from "react";
import { useDb } from "./db";
import { Moon, Sun } from "react-feather";

import { Reshaped } from "reshaped";

type LayoutProps = {
  colorMode: "light" | "dark";
  toggleColorMode: () => void;
};

const Layout: FC<LayoutProps> = ({ colorMode, toggleColorMode }) => {
  return (
    <View
      backgroundColor="elevation-base"
      shadow="overlay"
      direction="row"
      justify="space-between"
    >
      <View padding={4}>
        <Text variant="featured-2" weight="bold">
          Chandan Hisab
        </Text>
      </View>

      <View padding={4} direction="row" align="center">
        <Button variant="ghost">Home</Button>
        <Button variant="ghost">Settings</Button>
        <Button
          onClick={toggleColorMode}
          variant="ghost"
          icon={colorMode === "dark" ? <Sun /> : <Moon />}
        />
      </View>
    </View>
  );
};

function App() {
  const [colorMode, setColorMode] = useState<"light" | "dark">("dark");

  const toggleColorMode = () => {
    setColorMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const { dbPath } = useDb();

  return (
    <Reshaped theme="slate" colorMode={colorMode}>
      {dbPath ? (
        <Layout colorMode={colorMode} toggleColorMode={toggleColorMode} />
      ) : (
        <View
          gap={3}
          align="center"
          justify="center"
          height="100vh"
          padding={4}
        >
          <DBSettings />
        </View>
      )}
    </Reshaped>
  );
}

export default App;
