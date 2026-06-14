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

// Normalize a path/route for comparison: drop trailing slashes, treat "" as "/".
const norm = (p: string) => p.replace(/\/+$/, "") || "/";

// Cloudflare's `not_found_handling: single-page-application` serves the
// prerendered HOMEPAGE markup for any unmatched path, so the served HTML isn't
// necessarily for this route. scripts/prerender.ts stamps each page with the
// route it was rendered for; if that doesn't match the current path, the markup
// is the SPA fallback and hydrating it would mismatch (e.g. homepage markup on a
// NotFound route), so we must client-render instead.
const markupMatchesRoute =
  window.__PRERENDERED_PATH__ != null &&
  norm(window.location.pathname) === norm(window.__PRERENDERED_PATH__);

// Pages are prerendered without a query string, but only the blog index renders
// differently based on it (?tag=…, sort order). Every other route ignores the
// query, so a shared link like /blog/a-post?utm_source=… can still hydrate the
// prerendered markup — forcing a fresh render there would blank the content on
// exactly the shared/crawled links prerendering exists to serve.
const queryAffectsRender =
  norm(window.location.pathname) === "/blog" && window.location.search !== "";

// Hydrate only when the served markup truly matches this URL: it was prerendered
// for this exact route (not the SPA fallback homepage), the legacy-hash shim
// didn't rewrite the URL to a different route, and the query string, if any,
// doesn't change this route's initial render.
// firstElementChild (not hasChildNodes) so stray whitespace inside #root in
// index.html doesn't count as prerendered markup.
if (
  container.firstElementChild !== null &&
  markupMatchesRoute &&
  !window.__SPA_PATH_REWRITTEN__ &&
  !queryAffectsRender
) {
  hydrateRoot(container, app);
} else {
  container.innerHTML = ""; // discard stale/mismatched markup before re-rendering
  createRoot(container).render(app);
}
