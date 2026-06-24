// Run with: npx tsx scripts/prerender.ts
// (after `vite build` and `vite build --ssr src/entry-server.tsx --outDir dist-ssr`)
//
// Renders every route (/, /blog, /blog/<slug>) to static HTML via the SSR
// bundle and writes dist/<route>/index.html with page-specific Open Graph +
// Twitter tags injected into <head>. The static host (Cloudflare Pages) serves
// these as real 200 responses, so crawlers (LinkedIn, Slack, iMessage, etc.) that don't run
// JavaScript see the right metadata AND the full page content. The React app
// hydrates over the markup for human visitors (see src/main.tsx), so the SPA
// behaviour is unchanged.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  SITE_URL,
  SITE_NAME,
  BLOG_TITLE,
  BLOG_DESCRIPTION,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  ogImageUrl,
} from "../src/constants/site";
import type { BlogPostMeta } from "../src/types/blog";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const distDir = path.resolve(__dirname, "../dist");
const shellPath = path.join(distDir, "index.html");
const ssrEntryPath = path.resolve(__dirname, "../dist-ssr/entry-server.js");

if (!fs.existsSync(shellPath)) {
  console.error(
    `❌ ${shellPath} not found — run \`vite build\` before prerender.`,
  );
  process.exit(1);
}
if (!fs.existsSync(ssrEntryPath)) {
  console.error(
    `❌ ${ssrEntryPath} not found — run \`vite build --ssr src/entry-server.tsx --outDir dist-ssr\` before prerender.`,
  );
  process.exit(1);
}

const { render, getStaticPaths, getAllPosts } = (await import(
  ssrEntryPath
)) as {
  render: (url: string) => Promise<string>;
  getStaticPaths: () => string[];
  getAllPosts: () => BlogPostMeta[];
};

const ROOT_OPEN = '<div id="root">';
const ROOT_EMPTY = '<div id="root"></div>';

// Reset #root to empty when reading the shell. The "/" pass below overwrites
// dist/index.html with rendered homepage markup, so re-running this script
// against an already-prerendered dist would otherwise nest every page inside
// stale homepage content. A fresh `vite build` shell already has an empty
// #root; only the re-run case needs stripping. #root's own closing tag is
// found by tracking <div> nesting depth, so markup after #root in the
// document can't be mistaken for it.
function emptyRoot(html: string): string {
  if (html.includes(ROOT_EMPTY)) return html;
  const i = html.indexOf(ROOT_OPEN);
  if (i === -1) throw new Error("Could not find #root in shell");
  const divTag = /<div\b|<\/div>/g;
  divTag.lastIndex = i + ROOT_OPEN.length;
  let depth = 1;
  let m: RegExpExecArray | null;
  while ((m = divTag.exec(html))) {
    depth += m[0] === "</div>" ? -1 : 1;
    if (depth === 0)
      return html.slice(0, i + ROOT_OPEN.length) + html.slice(m.index);
  }
  throw new Error("Could not find #root's closing </div> in shell");
}

const shell = stripPrerenderMarker(
  emptyRoot(fs.readFileSync(shellPath, "utf-8")),
);

function escapeAttr(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildMetaTags(slug: string, post: BlogPostMeta): string {
  const url = `${SITE_URL}/blog/${slug}`;
  // Every post has an auto-generated card (or an `ogImage` override), so the
  // image URL is always set — see ogImageUrl.
  const image = ogImageUrl(post);
  const tags: string[] = [
    `<title>${escapeAttr(post.title)} — ${SITE_NAME}</title>`,
    `<meta name="description" content="${escapeAttr(post.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${escapeAttr(post.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(post.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="article:published_time" content="${escapeAttr(post.date)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(post.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(post.description)}" />`,
  ];
  tags.push(`<meta property="og:image" content="${image}" />`);
  // Only the auto-generated card has known dimensions. An `ogImage` override can
  // be any size, so don't assert 1200x630 for it — wrong width/height tags can
  // mislead scrapers that crop/lay out from them.
  if (!post.ogImage) {
    tags.push(`<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />`);
    tags.push(
      `<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />`,
    );
  }
  tags.push(`<meta name="twitter:image" content="${image}" />`);
  for (const tag of post.tags) {
    tags.push(`<meta property="article:tag" content="${escapeAttr(tag)}" />`);
  }
  return tags.map((t) => `    ${t}`).join("\n");
}

// Strip the homepage's static <title>, description, canonical, and OG/Twitter/article
// tags from the shell before injecting page-specific ones — otherwise crawlers see
// duplicate (and conflicting, since most pick the first occurrence) metadata.
// Runs against the built (Vite-minified) shell, where each tag is a single line;
// the regexes also tolerate the multi-line form in the index.html source since
// [^>]* spans newlines.
function stripHomepageMeta(html: string): string {
  return html
    .replace(/\n?\s*<title>[^<]*<\/title>/i, "")
    .replace(/\n?\s*<meta\s+name="description"[^>]*\/?>/gi, "")
    .replace(/\n?\s*<link\s+rel="canonical"[^>]*\/?>/gi, "")
    .replace(/\n?\s*<meta\s+property="og:[^"]+"[^>]*\/?>/gi, "")
    .replace(/\n?\s*<meta\s+name="twitter:[^"]+"[^>]*\/?>/gi, "")
    .replace(/\n?\s*<meta\s+property="article:[^"]+"[^>]*\/?>/gi, "");
}

function injectHead(shellHtml: string, metaBlock: string): string {
  // Function replacer: metaBlock is built from post titles/descriptions, which
  // can contain a literal `$&`/`$\`` that a string replacement would read as a
  // replacement-pattern token (mirrors liftPreloadsToHead's guard).
  return stripHomepageMeta(shellHtml).replace(
    "</head>",
    () => `${metaBlock}\n  </head>`,
  );
}

// Stamp the page with the route it was prerendered for. The client (src/main.tsx)
// hydrates only when this matches the current path; Cloudflare's SPA fallback
// serves the homepage markup ("/") for unmatched paths, so the mismatch tells the
// client to render fresh instead of hydrating homepage markup onto a 404 route.
// A classic inline script so it runs before the deferred app module sets up React.
function injectPrerenderMarker(html: string, route: string): string {
  return html.replace(
    "</head>",
    `    <script>window.__PRERENDERED_PATH__ = ${JSON.stringify(route)};</script>\n  </head>`,
  );
}

// Remove a previously-injected marker so re-running prerender against an already
// prerendered dist/index.html (read back as the shell) doesn't stack duplicates.
function stripPrerenderMarker(html: string): string {
  return html.replace(
    /\n?\s*<script>window\.__PRERENDERED_PATH__[^<]*<\/script>/g,
    "",
  );
}

function buildIndexMetaTags(): string {
  const url = `${SITE_URL}/blog`;
  // The blog index has no card of its own, so reuse the homepage's OG image —
  // stripHomepageMeta removed it, and twitter:card=summary_large_image needs an
  // image or the preview renders blank on LinkedIn/Slack/iMessage.
  const image = `${SITE_URL}/og.png`;
  return [
    `<title>${BLOG_TITLE} — ${SITE_NAME}</title>`,
    `<meta name="description" content="${BLOG_DESCRIPTION}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${BLOG_TITLE}" />`,
    `<meta property="og:description" content="${BLOG_DESCRIPTION}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${BLOG_TITLE}" />`,
    `<meta name="twitter:description" content="${BLOG_DESCRIPTION}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ]
    .map((t) => `    ${t}`)
    .join("\n");
}

// React 19 emits "hoistable" elements rendered anywhere in the tree (the
// Helmet titles/metas/canonical, image preloads) as a contiguous block at the
// very start of the prelude. The <head> already carries curated equivalents
// for title/meta/canonical, so drop those duplicates from that leading block —
// and only there; the body itself is never touched. Hydration tolerates this:
// React skips unrecognized nodes when matching root-level siblings and
// re-acquires title/meta hoistables from the document head.
//
// Preload links in that block are deliberately kept (they have no <head>
// equivalent); liftPreloadsToHead, running later on the assembled page, lifts
// them into <head>. Both passes assume React emits hoistables as one leading
// run — keep that assumption in sync if you touch either.
const HOISTED_TAG = /^(?:<title>[^]*?<\/title>|<(?:meta|link)\b[^>]*?>)/;

function stripHoistedHeadDuplicates(appHtml: string): string {
  let kept = "";
  let rest = appHtml;
  let m: RegExpExecArray | null;
  while ((m = HOISTED_TAG.exec(rest))) {
    const tag = m[0];
    rest = rest.slice(tag.length);
    const isDuplicate =
      tag.startsWith("<title") ||
      tag.startsWith("<meta") ||
      tag.includes('rel="canonical"');
    if (!isDuplicate) kept += tag;
  }
  return kept + rest;
}

function injectBody(html: string, appHtml: string): string {
  const i = html.indexOf(ROOT_OPEN);
  if (i === -1) throw new Error("Could not find #root in shell");
  return (
    html.slice(0, i + ROOT_OPEN.length) +
    appHtml +
    html.slice(i + ROOT_OPEN.length)
  );
}

// Counterpart to stripHoistedHeadDuplicates (which preserves these preloads in
// the body); both walk the same leading run of React hoistables.
//
// React hoists resource links (e.g. an Image's priority preload via
// ReactDOM.preload) to the very start of its rendered output, which injectBody
// then drops just inside <body> after #root. A preload there is still found by
// the scanner, but the canonical — and most reliably credited (Lighthouse's
// "discoverable in initial document") — spot is <head>, ahead of the body.
// Lift those leading preloads into the head; the body then starts directly with
// app markup, which also hydrates cleanly since React re-acquires these
// resources from the head on the client. We walk the whole contiguous run of
// leading <link> hoistables and lift only the preloads, leaving any other link
// (modulepreload, preconnect, …) in place — so a change to React's hoist
// ordering can't strand a preload behind a non-preload link and silently leave
// it in the body.
const LEADING_LINK = /^\s*<link\b[^>]*>/;

function liftPreloadsToHead(html: string): string {
  const i = html.indexOf(ROOT_OPEN);
  if (i === -1) return html;
  const bodyStart = i + ROOT_OPEN.length;
  let rest = html.slice(bodyStart);
  const preloads: string[] = [];
  let keptInBody = "";
  let m: RegExpExecArray | null;
  while ((m = LEADING_LINK.exec(rest))) {
    const tag = m[0];
    rest = rest.slice(tag.length);
    // Leading \s anchors this to an attribute boundary (always ` rel=…` in a
    // tag) so it can't match the literal inside some other attribute's value.
    if (/\srel="preload"/.test(tag)) preloads.push(tag.trim());
    else keptInBody += tag;
  }
  if (preloads.length === 0) return html;
  const moved = preloads.map((l) => `    ${l}`).join("\n");
  // Function replacer: a literal `$` in an image path (e.g. `$&`) must not be
  // read as a replacement-pattern token.
  return (
    html.slice(0, bodyStart).replace("</head>", () => `${moved}\n  </head>`) +
    keptInBody +
    rest
  );
}

// liftPreloadsToHead assumes React emits image preloads as one contiguous run
// of <link> hoistables at the start of the body (just inside #root). If React
// ever reorders hoistables so a preload trails a non-link node, it would be
// stranded in the body — discoverable late and uncredited as an LCP preload,
// but with no error. Assert the body carries no preload so that regression
// fails the build instead of silently shipping a slow page. (App markup never
// renders a rel="preload" link itself, so any match is a stranded hoistable.)
function assertPreloadsLifted(route: string, html: string): void {
  const i = html.indexOf(ROOT_OPEN);
  if (i === -1) return;
  const body = html.slice(i + ROOT_OPEN.length);
  if (/<link\b[^>]*\srel="preload"/.test(body)) {
    throw new Error(
      `Rendered HTML for ${route} has a preload stranded in the body — React's hoistable ordering may have changed; update liftPreloadsToHead.`,
    );
  }
}

// React escapes text content (escapeTextForBrowser) — match it so marker
// strings containing &, quotes, etc. can be found in the rendered markup.
function escapeText(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Guard against silently shipping a broken page: a route that renders the
// NotFound component, an empty Suspense fallback, or otherwise loses its
// content would still exit 0 without this.
function assertRendered(route: string, appHtml: string, marker: string): void {
  if (!appHtml.includes(escapeText(marker))) {
    throw new Error(
      `Rendered HTML for ${route} is missing expected content ${JSON.stringify(marker)} — refusing to write a broken page.`,
    );
  }
}

const postsBySlug = new Map(getAllPosts().map((p) => [p.slug, p]));

for (const route of getStaticPaths()) {
  const appHtml = stripHoistedHeadDuplicates(await render(route));
  let pageHtml: string;
  if (route === "/") {
    // Homepage keeps its static index.html meta; only the body is rendered.
    // Marker is Hero copy unique to the home route — SITE_NAME would also match
    // the Header/Footer that wrap every route (including a NotFound fallback),
    // so it wouldn't catch a broken homepage render.
    assertRendered(route, appHtml, "youth sports leagues");
    pageHtml = injectBody(shell, appHtml);
  } else if (route === "/blog") {
    assertRendered(route, appHtml, BLOG_TITLE);
    pageHtml = injectBody(injectHead(shell, buildIndexMetaTags()), appHtml);
  } else {
    const slug = route.replace("/blog/", "");
    const post = postsBySlug.get(slug);
    if (!post) throw new Error(`No post metadata for route ${route}`);
    assertRendered(route, appHtml, post.title);
    pageHtml = injectBody(
      injectHead(shell, buildMetaTags(slug, post)),
      appHtml,
    );
  }
  pageHtml = liftPreloadsToHead(pageHtml);
  assertPreloadsLifted(route, pageHtml);
  pageHtml = injectPrerenderMarker(pageHtml, route);
  const outFile =
    route === "/"
      ? path.join(distDir, "index.html")
      : path.join(distDir, route.slice(1), "index.html");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, pageHtml);
  console.log(`✅ prerendered ${route}`);
}

// Emit sitemap.xml covering every prerendered route (blog posts carry <lastmod>).
const sitemapXml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  getStaticPaths()
    .map((route) => {
      const loc = route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;
      const slug = route.startsWith("/blog/")
        ? route.replace("/blog/", "")
        : null;
      const lastmod = slug ? postsBySlug.get(slug)?.date : undefined;
      return `  <url>\n    <loc>${loc}</loc>${
        lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""
      }\n  </url>`;
    })
    .join("\n") +
  "\n</urlset>\n";
fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemapXml);
console.log("✅ sitemap.xml");
