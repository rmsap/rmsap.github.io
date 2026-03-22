import { visit } from "unist-util-visit";
import type { Root } from "mdast";

const WORDS_PER_MINUTE = 225;

export function remarkReadingTime() {
  return (tree: Root, file: { data: Record<string, unknown> }) => {
    let text = "";
    visit(tree, (node) => {
      if ("value" in node && typeof node.value === "string") {
        text += node.value + " ";
      }
    });
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));

    // Attach to file data so remark-mdx-frontmatter / vfile can expose it
    file.data.readingTime = minutes;

    // Inject as a named export into the MDX module.
    // "mdxjsEsm" is an MDX-specific node type not present in base mdast typings.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
