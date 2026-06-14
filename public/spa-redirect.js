// Migrate legacy HashRouter URLs into BrowserRouter paths before React mounts.
// This is purely client-side — the `#hash` never reaches the server — so it's
// host-independent and runs the same on any host.
//
// Until the move to Cloudflare this file also decoded the spa-github-pages
// 404.html redirect (https://github.com/rafgraph/spa-github-pages). Cloudflare
// serves index.html for unmatched paths natively (see wrangler.jsonc
// `not_found_handling`), so that half — and public/404.html — were removed.
(function (l) {
  // Migrate legacy HashRouter URLs (the app used HashRouter before commit 69163b1).
  // Links printed on already-distributed résumés look like `rmsap.github.io/#/blog/slug`.
  // Those load index.html at `/`, so BrowserRouter sees path `/` and shows the homepage
  // instead of the deep link. Rewrite the hash to the real URL before React mounts.
  // Legacy routes always start with `#/`; live section anchors are `#projects` (no slash),
  // so they're left untouched. Done via replaceState (no reload) so the URL bar ends clean.
  if (l.hash.indexOf("#/") === 0) {
    var rest = l.hash.slice(2); // everything after the leading "#/"
    // `/blog` and `/blog/:slug` are real BrowserRouter routes -> use a path.
    // Anything else (a section like `projects`, or the bare home hash) maps to the
    // homepage with a native `#section` anchor, which Header already scrolls to.
    var target = /^blog(\/|\?|$)/.test(rest)
      ? "/" + rest
      : rest
        ? "/#" + rest
        : "/";
    // Same as above: served homepage markup no longer matches the URL.
    window.__SPA_PATH_REWRITTEN__ = true;
    window.history.replaceState(null, "", target);
  }
})(window.location);
