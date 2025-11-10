import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import App from "./App";

import { Home } from "./pages/Home/Home";
import { settingsRoute } from "./pages/Settings/routes";

const rootRoute = createRootRoute();

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "index",
  component: App,
});

const homeRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: "/",
  component: Home,
});

const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([homeRoute, settingsRoute]),
]);

export const router = createRouter({
  routeTree,
});
