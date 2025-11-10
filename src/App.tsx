import { useEffect } from "react";
import { Text, View } from "reshaped";
import { loadDB } from "./db";

function App() {
  useEffect(() => {
    loadDB();
  }, []);

  return (
    <View gap={3} align="center" justify="center" height="100vh">
      <Text variant="title-1">Chandan Hisab</Text>
    </View>
  );
}

export default App;
