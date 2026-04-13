import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeShiki from "@shikijs/rehype";
import { bundledLanguages } from "shiki";
import { remarkReadingTime } from "./src/utils/remarkReadingTime";
import phoenixGrammar from "./src/languages/phoenix.tmLanguage.json";

const phoenixLang = {
  ...phoenixGrammar,
  aliases: ["phoenix"],
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mdx({
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [
        remarkGfm,
        remarkFrontmatter,
        remarkMdxFrontmatter,
        remarkReadingTime,
      ],
      rehypePlugins: [
        [
          rehypeShiki,
          {
            themes: { light: "github-light", dark: "github-dark" },
            langs: [...Object.keys(bundledLanguages), phoenixLang],
            transformers: [
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                pre(this: any, node: { properties: Record<string, unknown> }) {
                  // @shikijs/rehype strips the language class — preserve it as a data attribute
                  node.properties["data-language"] = this.options.lang;
                },
              },
            ],
          },
        ],
      ],
    }),
    react(),
    tailwindcss(),
  ],
});
