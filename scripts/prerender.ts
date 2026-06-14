// Run with: npx tsx scripts/prerender.ts
// (after `vite build` and `vite build --ssr src/entry-server.tsx --outDir dist-ssr`)
//
// Renders every route (/, /blog, /blog/<slug>) to static HTML via the SSR
// bundle and writes dist/<route>/index.html with page-specific Open Graph +
// Twitter tags injected into <head>. GitHub Pages serves these as real 200
// responses, so crawlers (LinkedIn, Slack, iMessage, etc.) that don't run
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

const shell = emptyRoot(fs.readFileSync(shellPath, "utf-8"));

function escapeAttr(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildMetaTags(slug: string, post: BlogPostMeta): string {
  const url = `${SITE_URL}/blog/${slug}`;
  // Prefer ogImage (PNG/JPG) over thumbnail — LinkedIn/Slack/iMessage don't render SVG cards.
  const imageSrc = post.ogImage ?? post.thumbnail;
  const image = imageSrc
    ? `${SITE_URL}/${imageSrc.replace(/^\//, "")}`
    : undefined;
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
  if (image) {
    tags.push(`<meta property="og:image" content="${image}" />`);
    tags.push(`<meta name="twitter:image" content="${image}" />`);
  }
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
  return stripHomepageMeta(shellHtml).replace(
    "</head>",
    `${metaBlock}\n  </head>`,
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
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
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
  const outFile =
    route === "/"
      ? path.join(distDir, "index.html")
      : path.join(distDir, route.slice(1), "index.html");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, pageHtml);
  console.log(`✅ prerendered ${route}`);
}
