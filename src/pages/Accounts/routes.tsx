import { createRoute, Outlet } from "@tanstack/react-router";

import { indexRoute } from "@/routes";
import { Accounts } from "./Accounts";
import { AccountDetails } from "./AccountDetails";

const rootRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: "accounts",
  component: Outlet,
});

const accountsListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Accounts,
});

export const accountDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$accountId",
  component: AccountDetails,
});

export const accountsRoute = rootRoute.addChildren([
  accountsListRoute,
  accountDetailsRoute,
]);
