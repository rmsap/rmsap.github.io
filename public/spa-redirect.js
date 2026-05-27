// Single-Page Apps for GitHub Pages
// https://github.com/rafgraph/spa-github-pages
// Decodes the redirect written by 404.html back into a real path before React mounts.
// Must stay encoding-compatible with public/404.html; edit them together.
(function (l) {
  // No-op when not coming from the 404.html redirect — direct loads of index.html
  // (e.g. landing on `/` or `/#projects`) have no `?/...` query and should be left alone.
  if (l.search[1] === "/") {
    var decoded = l.search
      .slice(1)
      .split("&")
      .map(function (s) {
        return s.replace(/~and~/g, "&");
      })
      .join("?");
    window.history.replaceState(
      null,
      "",
      l.pathname.slice(0, -1) + decoded + l.hash,
    );
  }

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
    window.history.replaceState(null, "", target);
  }
})(window.location);
