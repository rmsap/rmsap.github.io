// Run with: npx tsx scripts/prerenderBlog.ts (after `vite build`)
//
// Emits dist/blog/<slug>/index.html for each MDX post, with the post's
// Open Graph + Twitter tags injected into <head>. GitHub Pages serves these
// as real 200 responses, so crawlers (LinkedIn, Slack, iMessage, etc.) that
// don't run JavaScript see the right metadata. The React app still hydrates
// over the page for human visitors, so the SPA behaviour is unchanged.

import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = "https://rmsap.github.io";
const SITE_NAME = "Ryan Saperstein";

const distDir = path.resolve(__dirname, "../dist");
const postsDir = path.resolve(__dirname, "../src/posts");
const shellPath = path.join(distDir, "index.html");

if (!fs.existsSync(shellPath)) {
  console.error(
    `❌ ${shellPath} not found — run \`vite build\` before prerender.`,
  );
  process.exit(1);
}

const shell = fs.readFileSync(shellPath, "utf-8");

function escapeAttr(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

interface Frontmatter {
  title: string;
  date: string;
  description: string;
  tags?: string[];
  thumbnail?: string;
  ogImage?: string;
}

function buildMetaTags(slug: string, fm: Frontmatter): string {
  const url = `${SITE_URL}/blog/${slug}`;
  // Prefer ogImage (PNG/JPG) over thumbnail — LinkedIn/Slack/iMessage don't render SVG cards.
  const imageSrc = fm.ogImage ?? fm.thumbnail;
  const image = imageSrc
    ? `${SITE_URL}/${imageSrc.replace(/^\//, "")}`
    : undefined;
  const tags: string[] = [
    `<title>${escapeAttr(fm.title)} — ${SITE_NAME}</title>`,
    `<meta name="description" content="${escapeAttr(fm.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${escapeAttr(fm.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(fm.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="article:published_time" content="${escapeAttr(fm.date)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(fm.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(fm.description)}" />`,
  ];
  if (image) {
    tags.push(`<meta property="og:image" content="${image}" />`);
    tags.push(`<meta name="twitter:image" content="${image}" />`);
  }
  for (const tag of fm.tags ?? []) {
    tags.push(`<meta property="article:tag" content="${escapeAttr(tag)}" />`);
  }
  return tags.map((t) => `    ${t}`).join("\n");
}

// Replace the placeholder <title> from the shell with the post-specific head,
// so we don't leave a duplicate generic title sitting above the OG tags.
function injectHead(shellHtml: string, metaBlock: string): string {
  const withoutTitle = shellHtml.replace(/\n?\s*<title>[^<]*<\/title>/i, "");
  return withoutTitle.replace("</head>", `${metaBlock}\n  </head>`);
}

const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));

let count = 0;
for (const file of files) {
  const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
  const { data } = matter(raw);
  const fm = data as Frontmatter;
  const slug = file.replace(/\.mdx$/, "");

  const metaBlock = buildMetaTags(slug, fm);
  const html = injectHead(shell, metaBlock);

  const outDir = path.join(distDir, "blog", slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  count += 1;
}

console.log(`✅ Prerendered ${count} blog post page(s) into dist/blog/<slug>/`);
