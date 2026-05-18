import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HEADER_OFFSET } from "./constants/layout";

document.documentElement.style.setProperty(
  "--header-offset",
  `${HEADER_OFFSET}px`,
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
