import { FC } from "react";
import { View, Text } from "reshaped";

export const Home: FC = () => {
  return (
    <View padding={4} gap={4}>
      <Text variant="featured-1" weight="bold">
        Welcome to Chandan Hisab
      </Text>
      <Text>
        This is the home page of your personal finance management application.
        Use the navigation links above to explore different features.
      </Text>
    </View>
  );
};
