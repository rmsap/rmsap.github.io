import type { ComponentPropsWithoutRef } from "react";
import { Callout, InlineCode, ShikiCodeBlock } from "./MdxPrimitives";

export const mdxComponents = {
  pre: ShikiCodeBlock,
  code: InlineCode,
  Callout,
  h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className="text-3xl font-bold mt-8 mb-4 text-gray-100 scroll-mt-24"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="text-2xl font-semibold mt-8 mb-3 text-gray-100 scroll-mt-24"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="text-xl font-semibold mt-6 mb-2 text-gray-100 scroll-mt-24"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: ComponentPropsWithoutRef<"h4">) => (
    <h4
      className="text-lg font-semibold mt-4 mb-2 text-gray-100 scroll-mt-24"
      {...props}
    >
      {children}
    </h4>
  ),
  ul: ({ children, ...props }: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="list-disc list-inside pl-6 my-4 space-y-1"
      style={{ listStyleType: "disc" }}
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="list-decimal list-inside pl-6 my-4 space-y-1"
      style={{ listStyleType: "decimal" }}
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: ComponentPropsWithoutRef<"li">) => (
    <li className="pl-1" {...props}>
      {children}
    </li>
  ),
};
