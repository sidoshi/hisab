import React from "react";
import ReactDOM from "react-dom/client";
import { Reshaped } from "reshaped";
import "reshaped/themes/slate/theme.css";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Reshaped theme="slate" colorMode="dark">
      <App />
    </Reshaped>
  </React.StrictMode>
);
