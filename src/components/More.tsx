/**
 * Collapsible details for first-time viewers: the page shows the main point, and the
 * reasoning, assumptions and sources stay one click away.
 */
export function More({ label = "Lisätiedot ja lähteet", children, className = "" }: { label?: string; children: React.ReactNode; className?: string }) {
  return (
    <details className={`group text-sm ${className}`}>
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="transition group-open:rotate-90">›</span>
        {label}
      </summary>
      <div className="mt-2 space-y-2 text-slate-600">{children}</div>
    </details>
  );
}
