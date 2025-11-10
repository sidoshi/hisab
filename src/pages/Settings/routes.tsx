import { createRoute } from "@tanstack/react-router";

import { indexRoute } from "@/routes";
import { Settings } from "./Settings";
import { DBSettings } from "./DatabaseSettings";
import { GeneralSettings } from "./GeneralSettings";

const rootRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: "settings",
  component: Settings,
});

const databaseSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "database",
  component: DBSettings,
});

const generalSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: GeneralSettings,
});

export const settingsRoute = rootRoute.addChildren([
  databaseSettingsRoute,
  generalSettingsRoute,
]);
