import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-5 font-display text-2xl font-bold tracking-tight text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-6 font-display text-xl font-bold tracking-tight text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-4 text-base font-semibold text-foreground first:mt-0">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-foreground/90">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1.5 pl-5 last:mb-0 text-foreground/90">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1.5 pl-5 last:mb-0 text-foreground/90">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-4 border-border" />,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-accent pl-3 text-muted-foreground">{children}</blockquote>
  ),
  code: ({ className, children }) => {
    const block = Boolean(className);
    if (block) {
      return (
        <pre className="my-3 overflow-x-auto rounded-[12px] bg-secondary p-3 text-xs leading-relaxed text-foreground">
          <code>{children}</code>
        </pre>
      );
    }
    return (
      <code className="rounded-md bg-secondary px-1.5 py-0.5 text-[0.85em] text-foreground">{children}</code>
    );
  },
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-[12px] border border-border">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-secondary/80">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
  tr: ({ children }) => <tr className="align-top">{children}</tr>,
  th: ({ children }) => (
    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="px-3 py-2.5 text-muted-foreground first:font-medium first:text-foreground">{children}</td>,
};

export function CoachMessage({ text }: { text: string }) {
  return (
    <div className="coach-md text-[15px]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
