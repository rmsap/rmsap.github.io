/// <reference types="vite/client" />

declare module "*.tmLanguage.json" {
  const value: Record<string, unknown>;
  export default value;
}

// Set by public/spa-redirect.js when it rewrites a legacy HashRouter URL to its
// BrowserRouter path; src/main.tsx skips hydration in that case (the served
// markup is the homepage but the rewritten URL is a different route).
interface Window {
  __SPA_PATH_REWRITTEN__?: boolean;
  // Set by scripts/prerender.ts in each prerendered page: the route the markup
  // was rendered for. main.tsx hydrates only when it matches the current path —
  // Cloudflare's SPA fallback (not_found_handling: single-page-application)
  // serves the homepage markup ("/") for unmatched paths, so a mismatch means
  // the markup is the fallback and we must client-render instead of hydrating.
  __PRERENDERED_PATH__?: string;
}
