import React from "react";
import ReactDOM from "react-dom/client";
import { Reshaped } from "reshaped";
import "reshaped/themes/slate/theme.css";

import App from "./App";
import { DatabaseProvider } from "./db";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Reshaped theme="slate" colorMode="dark">
      <DatabaseProvider>
        <App />
      </DatabaseProvider>
    </Reshaped>
  </React.StrictMode>
);
