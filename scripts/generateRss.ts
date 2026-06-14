// Run with: npx tsx scripts/generateRss.ts

import { Feed } from "feed";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import {
  SITE_URL,
  SITE_NAME,
  BLOG_TITLE,
  BLOG_DESCRIPTION,
} from "../src/constants/site";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AUTHOR = { name: SITE_NAME, link: SITE_URL };

const feed = new Feed({
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  id: SITE_URL,
  link: `${SITE_URL}/blog`,
  language: "en",
  copyright: `© ${new Date().getFullYear()} ${SITE_NAME}`,
  author: AUTHOR,
});

// Frontmatter is parsed with gray-matter here instead of reusing
// src/utils/blogLoader.ts: this script runs before `vite build`, so the
// loader's import.meta.glob over compiled MDX isn't available yet (the
// prerenderer, which runs after the SSR build, does reuse the loader).
const postsDir = path.resolve(__dirname, "../src/posts");
const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));

const posts = files
  .map((file) => {
    const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
    const { data } = matter(raw);
    const slug = file.replace(".mdx", "");
    return { slug, ...data } as {
      slug: string;
      title: string;
      date: string;
      description: string;
      tags?: string[];
    };
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

posts.forEach((p) => {
  const postUrl = `${SITE_URL}/blog/${p.slug}`;
  feed.addItem({
    title: p.title,
    id: postUrl,
    link: postUrl,
    description: p.description,
    date: new Date(p.date),
    author: [AUTHOR],
    category: (p.tags ?? []).map((t) => ({ name: t })),
  });
});

const outDir = path.resolve(__dirname, "../public");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "rss.xml"), feed.rss2());
fs.writeFileSync(path.join(outDir, "feed.json"), feed.json1());
console.log("✅ RSS feed generated");
