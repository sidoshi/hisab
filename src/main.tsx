import React, { FC } from "react";
import ReactDOM from "react-dom/client";

import "reshaped/themes/slate/theme.css";

import { DatabaseProvider } from "./db";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes";
import { Reshaped } from "reshaped";
import { useAtomValue } from "jotai";
import { colorModeAtom } from "./atoms/theme";

const Root: FC = () => {
  const colorMode = useAtomValue(colorModeAtom);

  return (
    <React.StrictMode>
      <DatabaseProvider>
        <Reshaped theme="slate" colorMode={colorMode}>
          <RouterProvider router={router} />
        </Reshaped>
      </DatabaseProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Root />
);
