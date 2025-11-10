import { Link, Outlet } from "@tanstack/react-router";
import { FC } from "react";
import { Grid, MenuItem, Text, View } from "reshaped";

export const Settings: FC = () => {
  return (
    <View paddingInline={15} paddingTop={8}>
      <Grid columns="1fr 4fr" rows="1fr" gap={4}>
        <View padding={4} paddingTop={8} gap={4} borderRadius="medium">
          <Text variant="featured-3" weight="bold">
            Settings
          </Text>

          <View direction="column" justify="start">
            <Link
              style={{ textDecoration: "none", color: "inherit" }}
              to="/settings/"
              activeOptions={{ exact: true }}
            >
              {({ isActive }) => (
                <MenuItem selected={isActive} roundedCorners>
                  General
                </MenuItem>
              )}
            </Link>

            <Link
              style={{ textDecoration: "none", color: "inherit" }}
              to="/settings/database"
              activeOptions={{ exact: true }}
            >
              {({ isActive }) => (
                <MenuItem selected={isActive} roundedCorners>
                  Database
                </MenuItem>
              )}
            </Link>
          </View>
        </View>
        <View>
          <Outlet />
        </View>
      </Grid>
    </View>
  );
};
