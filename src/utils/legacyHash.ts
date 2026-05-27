// Converts a legacy HashRouter URL fragment into the equivalent BrowserRouter
// target. The app used HashRouter before commit 69163b1, so links printed on
// already-distributed résumés look like `rmsap.github.io/#/blog/slug`.
//
// Legacy routes always start with `#/`; live section anchors are `#projects`
// (no slash) and must be left alone. `/blog` and `/blog/:slug` are real routes
// (return a path); anything else maps to the homepage with a native `#section`
// anchor, which Header already scrolls to.
//
// NOTE: this mirrors the pre-React rewrite in public/spa-redirect.js — keep the
// two in sync. The script handles the initial page load (no flash of the
// homepage); this handles in-app `hashchange`s, which the script can't see.
export function legacyHashToPath(hash: string): string | null {
  if (hash.indexOf("#/") !== 0) return null;
  const rest = hash.slice(2); // everything after the leading "#/"
  if (/^blog(\/|\?|$)/.test(rest)) return "/" + rest;
  return rest ? "/#" + rest : "/";
}
