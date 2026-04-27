import type { Root } from "mdast";
import { visit } from "unist-util-visit";

const PROSE_WPM = 200;
const CODE_WPM = 50;
const SECONDS_PER_IMAGE = 12;

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function remarkReadingTime() {
  return (tree: Root, file: { data: Record<string, unknown> }) => {
    let proseWords = 0;
    let codeWords = 0;
    let images = 0;
    visit(tree, (node) => {
      if (
        node.type === "text" &&
        "value" in node &&
        typeof node.value === "string"
      ) {
        proseWords += countWords(node.value);
      } else if (
        (node.type === "code" || node.type === "inlineCode") &&
        "value" in node &&
        typeof node.value === "string"
      ) {
        codeWords += countWords(node.value);
      } else if (node.type === "image") {
        images += 1;
      }
    });
    const totalSeconds =
      (proseWords / PROSE_WPM) * 60 +
      (codeWords / CODE_WPM) * 60 +
      images * SECONDS_PER_IMAGE;
    const minutes = Math.max(1, Math.round(totalSeconds / 60));

    // Attach to file data so remark-mdx-frontmatter / vfile can expose it
    file.data.readingTime = minutes;

    // Inject as a named export into the MDX module.
    // "mdxjsEsm" is an MDX-specific node type not present in base mdast typings.

    tree.children.unshift({
      type: "mdxjsEsm",
      value: `export const readingTime = ${minutes};`,
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExportNamedDeclaration",
              specifiers: [],
              attributes: [],
              declaration: {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: { type: "Identifier", name: "readingTime" },
                    init: { type: "Literal", value: minutes },
                  },
                ],
              },
            },
          ],
        },
      },
    } as unknown as import("mdast").RootContent);
  };
}
