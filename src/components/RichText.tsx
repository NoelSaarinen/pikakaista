// Renders the brief: paragraphs separated by blank lines, **bold**, and [source] tags.

import { Fragment } from "react";

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[a-z0-9-]+(?:, ?[a-z0-9-]+)*\])/gi);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^\[[a-z0-9-]+(?:, ?[a-z0-9-]+)*\]$/i.test(part)) {
      return (
        <span key={i} className="ml-0.5 rounded bg-sky-100 px-1 text-xs font-medium text-sky-800">
          {part.slice(1, -1)}
        </span>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-3 leading-relaxed">
      {text
        .split(/\n\s*\n|\n/)
        .filter((p) => p.trim())
        .map((p, i) => (
          <p key={i}>{renderInline(p.replace(/^#+\s*/, ""))}</p>
        ))}
    </div>
  );
}
