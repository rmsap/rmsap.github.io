import { useState, type ComponentPropsWithoutRef } from "react";

const langNames: Record<string, string> = {
  phoenix: "Phoenix",
  typescript: "TypeScript",
  javascript: "JavaScript",
  tsx: "TSX",
  jsx: "JSX",
  python: "Python",
  rust: "Rust",
  go: "Go",
  bash: "Bash",
  shell: "Shell",
  sh: "Shell",
  zsh: "Shell",
  json: "JSON",
  yaml: "YAML",
  html: "HTML",
  css: "CSS",
  sql: "SQL",
  graphql: "GraphQL",
  markdown: "Markdown",
  md: "Markdown",
  text: "Text",
};

function getLang(children: React.ReactNode, dataLanguage?: string): string {
  // Try the data-language attribute set by our transformer
  if (dataLanguage) return dataLanguage.toLowerCase();

  // Fall back to the <code> child's className (e.g. "language-TypeScript")
  const codeEl = children as React.ReactElement<{ className?: string }>;
  const codeClass = codeEl?.props?.className ?? "";
  const codeMatch = codeClass.match(/language-(\S+)/);
  if (codeMatch) return codeMatch[1].toLowerCase();

  return "";
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    const props = (node as React.ReactElement).props as {
      children?: React.ReactNode;
    };
    return extractText(props.children);
  }
  return "";
}

export function ShikiCodeBlock({
  children,
  className,
  "data-language": dataLanguage,
  ...props
}: ComponentPropsWithoutRef<"pre"> & { "data-language"?: string }) {
  const [copied, setCopied] = useState(false);
  const lang = getLang(children, dataLanguage);
  const displayName = langNames[lang] ?? lang;

  const handleCopy = () => {
    const text = extractText(children);
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="my-4 rounded-lg border border-gray-700 overflow-hidden">
      {displayName && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 border-b border-gray-700 text-xs text-gray-400">
          <span className="font-medium">{displayName}</span>
          <button
            onClick={handleCopy}
            className="hover:text-gray-200 transition-colors cursor-pointer"
            aria-label="Copy code"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
      <pre
        className={`p-4 overflow-x-auto text-sm !rounded-none !mt-0 !mb-0 ${className ?? ""}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}

export function InlineCode(props: ComponentPropsWithoutRef<"code">) {
  const isBlock =
    typeof props.className === "string" &&
    props.className.includes("language-");
  if (isBlock) return <code {...props} />;
  return (
    <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm" {...props} />
  );
}

export function Callout({
  children,
  type = "info",
}: {
  children: React.ReactNode;
  type?: "info" | "warn" | "tip";
}) {
  const styles = {
    info: "border-blue-500 bg-blue-500/10",
    warn: "border-yellow-500 bg-yellow-500/10",
    tip: "border-green-500 bg-green-500/10",
  };
  return (
    <div className={`border-l-4 rounded p-4 my-4 ${styles[type]}`}>
      {children}
    </div>
  );
}
