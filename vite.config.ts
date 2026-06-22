import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkSmartypants from "remark-smartypants";
import { bundledLanguages } from "shiki";
import { defineConfig } from "vite";
import phoenixGrammar from "./src/languages/phoenix.tmLanguage.json";
import { remarkReadingTime } from "./src/utils/remarkReadingTime";

const phoenixLang = {
  ...phoenixGrammar,
  aliases: ["phoenix"],
};

// https://vite.dev/config/
export default defineConfig({
  // react-helmet-async is CJS-only; bundle it into the SSR build so Node's ESM
  // loader doesn't choke on its named exports during prerendering.
  ssr: { noExternal: ["react-helmet-async"] },
  plugins: [
    mdx({
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [
        remarkGfm,
        remarkSmartypants,
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
                pre(
                  this: { options: { lang: string } },
                  node: { properties: Record<string, unknown> },
                ) {
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
