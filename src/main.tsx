import React from "react";
import ReactDOM from "react-dom/client";

import "reshaped/themes/slate/theme.css";

import App from "./App";
import { DatabaseProvider } from "./db";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DatabaseProvider>
      <App />
    </DatabaseProvider>
  </React.StrictMode>
);
