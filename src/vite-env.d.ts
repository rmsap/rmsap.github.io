/// <reference types="vite/client" />

declare module "*.tmLanguage.json" {
  const value: Record<string, unknown>;
  export default value;
}

// Set by public/spa-redirect.js when it rewrites the URL after a 404 redirect;
// src/main.tsx skips hydration in that case (the served markup is the homepage).
interface Window {
  __SPA_PATH_REWRITTEN__?: boolean;
}
