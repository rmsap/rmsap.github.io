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
})(window.location);
