"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Pages in the clinician area. Only reachable through "Lääkäri" (see app/(laakari)/layout.tsx). */
export const CLINICIAN_LINKS = [
  { href: "/clinician", label: "Pikakaistan lista" },
  { href: "/screening", label: "Seulontalista" },
  { href: "/pathway", label: "Seuranta" },
  { href: "/search", label: "Potilashaku" },
] as const;

const MAIN_LINKS = [
  { href: "/county", label: "Päättäjä" },
  { href: "/survey", label: "Kysely" },
  { href: "/clinician", label: "Lääkäri", area: CLINICIAN_LINKS.map((l) => l.href) as string[] },
  { href: "/evidence", label: "Tutkimus" },
];

const isActive = (path: string, href: string, area?: string[]) =>
  (area ?? [href]).some((h) => path === h || path.startsWith(`${h}/`));

export function MainNav() {
  const path = usePathname();
  return (
    <div className="flex flex-wrap items-center gap-1">
      {MAIN_LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={isActive(path, l.href, l.area) ? "page" : undefined}
          className={`rounded-full px-3.5 py-1.5 font-semibold transition-colors ${
            isActive(path, l.href, l.area) ? "bg-brand-navy text-white shadow-sm" : "text-slate-600 hover:bg-sky-50 hover:text-brand-navy"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export function ClinicianNav() {
  const path = usePathname();
  return (
    <nav aria-label="Lääkärin työtila" className="flex flex-wrap gap-1 border-b border-slate-200">
      {CLINICIAN_LINKS.map((l) => {
        const active = isActive(path, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              active ? "border-sky-700 text-sky-800" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
