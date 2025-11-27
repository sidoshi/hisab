import { Button, Text, useToast, View } from "reshaped";
import { DBSettings } from "./pages/Settings/DatabaseSettings";
import { FC } from "react";
import { useDb } from "./db";
import { Moon, RefreshCw, Sun } from "react-feather";

import { Link, Outlet } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { colorModeAtom, toggleColorModeAtom } from "./atoms/theme";
import { useQueryClient } from "@tanstack/react-query";
import { Navigation } from "./components/Navigation";

const Layout: FC = () => {
  const colorMode = useAtomValue(colorModeAtom);
  const toggleColorMode = useSetAtom(toggleColorModeAtom);

  const toast = useToast();

  const queryClient = useQueryClient();
  const resetQueryClient = () => {
    queryClient.invalidateQueries();
    toast.show({
      title: "Data Refreshed",
      color: "positive",
      icon: <RefreshCw />,
    });
  };

  return (
    <View>
      <View direction="row" justify="space-between">
        <View padding={4}>
          <Link to="/">
            <Text variant="featured-2" weight="bold" color="primary">
              Chandan Hisab
            </Text>
          </Link>
        </View>

        <View padding={4} direction="row" align="center">
          <Link to="/">
            {({ isActive }) => (
              <Button variant={isActive ? "outline" : "ghost"}>Home</Button>
            )}
          </Link>

          <Link to="/ledger">
            {({ isActive }) => (
              <Button variant={isActive ? "outline" : "ghost"}>Ledger</Button>
            )}
          </Link>

          <Link to="/accounts">
            {({ isActive }) => (
              <Button variant={isActive ? "outline" : "ghost"}>Accounts</Button>
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

          <Button
            onClick={resetQueryClient}
            variant="ghost"
            icon={<RefreshCw />}
          />
        </View>
      </View>

      <View>
        <Navigation />
        <Outlet />
      </View>
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
