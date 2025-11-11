import React, { FC } from "react";
import ReactDOM from "react-dom/client";

import "reshaped/themes/slate/theme.css";

import { DatabaseProvider } from "./db";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes";
import { Reshaped } from "reshaped";
import { useAtomValue } from "jotai";
import { colorModeAtom } from "./atoms/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const Root: FC = () => {
  const colorMode = useAtomValue(colorModeAtom);
  const queryClient = new QueryClient();

  return (
    <React.StrictMode>
      <DatabaseProvider>
        <QueryClientProvider client={queryClient}>
          <Reshaped theme="slate" colorMode={colorMode}>
            <RouterProvider router={router} />
          </Reshaped>
        </QueryClientProvider>
      </DatabaseProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Root />
);
