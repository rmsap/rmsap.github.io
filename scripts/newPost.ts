#!/usr/bin/env node

// ============================================================
// Blog Post Scaffolding Script
// Usage: npm run new-post
// ============================================================

import { createInterface } from "readline/promises";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.resolve(__dirname, "../src/posts");

const rl = createInterface({ input: process.stdin, output: process.stdout });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function today() {
  return new Date().toISOString().split("T")[0];
}

async function main() {
  console.log("\n📝 New Blog Post\n");

  const title = await rl.question("Title: ");
  if (!title.trim()) {
    console.error("Title is required.");
    process.exit(1);
  }

  const description = await rl.question("Description (short summary): ");

  const tagsRaw = await rl.question(
    "Tags (comma-separated, e.g. react,firebase): ",
  );
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const dateInput = await rl.question(`Date (${today()}): `);
  const date = dateInput.trim() || today();

  const slug = slugify(title);
  const filename = `${slug}.mdx`;
  const filepath = path.join(POSTS_DIR, filename);

  if (existsSync(filepath)) {
    const overwrite = await rl.question(
      `\n⚠️  ${filename} already exists. Overwrite? (y/N): `,
    );
    if (overwrite.toLowerCase() !== "y") {
      console.log("Cancelled.");
      process.exit(0);
    }
  }

  const tagsFormatted =
    tags.length > 0 ? `[${tags.map((t) => `"${t}"`).join(", ")}]` : "[]";

  const content = `---
title: "${title}"
date: "${date}"
description: "${description}"
tags: ${tagsFormatted}
---

Start writing here...
`;

  // Ensure posts directory exists
  if (!existsSync(POSTS_DIR)) {
    mkdirSync(POSTS_DIR, { recursive: true });
  }

  writeFileSync(filepath, content, "utf-8");

  console.log(`\n✅ Created: src/posts/${filename}`);
  console.log(`   Edit:    src/posts/${filename}`);
  console.log(`   URL:     /#/blog/${slug}\n`);

  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
