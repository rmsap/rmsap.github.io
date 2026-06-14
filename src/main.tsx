import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { HEADER_OFFSET } from "./constants/layout";

document.documentElement.style.setProperty(
  "--header-offset",
  `${HEADER_OFFSET}px`,
);

const container = document.getElementById("root")!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Pages are prerendered without a query string, but only the blog index renders
// differently based on it (?tag=…, sort order). Every other route ignores the
// query, so a shared link like /blog/a-post?utm_source=… can still hydrate the
// prerendered markup — forcing a fresh render there would blank the content on
// exactly the shared/crawled links prerendering exists to serve.
const path = window.location.pathname.replace(/\/$/, "");
const queryAffectsRender = path === "/blog" && window.location.search !== "";

// Hydrate only when prerendered markup exists and the served markup matches the
// URL: the SPA-redirect shim didn't rewrite it to a different route (in which
// case the served markup is the homepage), and the query string, if any,
// doesn't change this route's initial render.
// firstElementChild (not hasChildNodes) so stray whitespace inside #root in
// index.html doesn't count as prerendered markup.
if (
  container.firstElementChild !== null &&
  !window.__SPA_PATH_REWRITTEN__ &&
  !queryAffectsRender
) {
  hydrateRoot(container, app);
} else {
  container.innerHTML = ""; // discard stale/mismatched markup before re-rendering
  createRoot(container).render(app);
}
