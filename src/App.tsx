import { useEffect, useState } from "react";
import { Button, Text, View } from "reshaped";
import {
  loadDB,
  getCurrentDatabasePath,
  showDatabaseSelectionDialog,
} from "./db";

function App() {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [selectingDB, setSelectingDB] = useState(false);

  useEffect(() => {
    setupDB();
  }, []);

  const setupDB = async () => {
    try {
      let currentPath = await getCurrentDatabasePath();
      setCurrentPath(currentPath);

      if (currentPath) {
        console.log("Using database at path: ", currentPath);
        await loadDB(currentPath);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openDB = async () => {
    if (selectingDB) return;
    setSelectingDB(true);

    try {
      const selectedPath = await showDatabaseSelectionDialog();
      console.log("Selected database path: ", selectedPath);
      if (selectedPath) {
        setCurrentPath(selectedPath);
        await loadDB(selectedPath);
      }
    } catch (err) {
      console.error("Error selecting or creating database: ", err);
    } finally {
      setSelectingDB(false);
    }
  };

  return (
    <View gap={3} align="center" justify="center" height="100vh" padding={4}>
      <Text variant="title-3">Chandan Hisab</Text>

      {currentPath == null ? (
        <>
          <Text>Select or create a database to get started.</Text>
          <Button onClick={openDB}>Open Database</Button>
        </>
      ) : (
        <>
          <Text>Current Database Path: {currentPath}</Text>
        </>
      )}
    </View>
  );
}

export default App;
