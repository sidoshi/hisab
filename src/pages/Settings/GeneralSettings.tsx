import { colorModeAtom } from "@/atoms/theme";
import { useAtom } from "jotai";
import { FC } from "react";
import { Radio, RadioGroup, Text, View } from "reshaped";

export const GeneralSettings: FC = () => {
  const [colorMode, setColorMode] = useAtom(colorModeAtom);

  return (
    <View gap={4} align="start">
      <View>
        <Text variant="featured-1" weight="bold">
          General Settings
        </Text>
        <Text>Manage your general preferences</Text>
      </View>

      <View divided gap={4} paddingTop={6} direction="row">
        <Text variant="body-1" weight="bold">
          Theme
        </Text>

        <View gap={2}>
          <RadioGroup
            value={colorMode}
            name="theme"
            onChange={({ value }) => setColorMode(value as "light" | "dark")}
          >
            <View gap={2}>
              <Radio value="light">Light</Radio>
              <Radio value="dark">Dark</Radio>
            </View>
          </RadioGroup>
        </View>
      </View>
    </View>
  );
};
