import { Button, Text, View } from "reshaped";
import { DBSettings } from "./pages/Settings/DatabaseSettings";
import { FC } from "react";
import { useDb } from "./db";
import { Moon, Sun } from "react-feather";

import { Link, Outlet } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { colorModeAtom, toggleColorModeAtom } from "./atoms/theme";

const Layout: FC = () => {
  const colorMode = useAtomValue(colorModeAtom);
  const toggleColorMode = useSetAtom(toggleColorModeAtom);

  return (
    <View>
      <View
        backgroundColor="elevation-base"
        shadow="overlay"
        direction="row"
        justify="space-between"
      >
        <View padding={4}>
          <Text variant="featured-2" weight="bold" color="primary">
            Chandan Hisab
          </Text>
        </View>

        <View padding={4} direction="row" align="center">
          <Link to="/">
            {({ isActive }) => (
              <Button variant={isActive ? "outline" : "ghost"}>Home</Button>
            )}
          </Link>

          <Link to="/settings">
            {({ isActive }) => (
              <Button variant={isActive ? "outline" : "ghost"}>Settings</Button>
            )}
          </Link>

          <Button
            onClick={toggleColorMode}
            variant="ghost"
            icon={colorMode === "dark" ? <Sun /> : <Moon />}
          />
        </View>
      </View>

      <Outlet />
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
