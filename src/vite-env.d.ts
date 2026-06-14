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
}
