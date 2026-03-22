import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { codeToHtml } from "shiki";

export function ShikiCodeBlock({
  children,
  ...props
}: ComponentPropsWithoutRef<"pre">) {
  const ref = useRef<HTMLDivElement>(null);
  const codeEl = (
    children as React.ReactElement<{ children?: string; className?: string }>
  )?.props;
  const code = codeEl?.children ?? "";
  const lang = (codeEl?.className ?? "").replace("language-", "") || "text";

  useEffect(() => {
    let cancelled = false;
    void codeToHtml(code, { lang, theme: "github-dark" }).then((html) => {
      if (!cancelled && ref.current) ref.current.innerHTML = html;
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  // Fallback while shiki loads
  return (
    <div ref={ref}>
      <pre
        className="bg-gray-800 rounded p-4 overflow-x-auto text-sm my-4"
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
