/** Pikakaista mark: two lung lobes and a forward lane. Original design, not any organisation's logo. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="pk-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b2545" />
          <stop offset="1" stopColor="#1d5fa7" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#pk-bg)" />
      <path d="M14.5 8.5c-3.6.6-6.5 5.3-6.5 10.2 0 3.1 1.5 4.8 3.6 4.8 1.8 0 2.9-1.3 2.9-3.4V8.5z" fill="#ffffff" />
      <path d="M17.5 8.5c3.6.6 6.5 5.3 6.5 10.2 0 3.1-1.5 4.8-3.6 4.8-1.8 0-2.9-1.3-2.9-3.4V8.5z" fill="#ffffff" opacity="0.85" />
      <path d="M12 16.5h7.2l-2.4-2.4M19.2 16.5l-2.4 2.4" stroke="#e9b44c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className="leading-tight">
        <span className="block text-base font-extrabold tracking-tight text-brand-navy">Pikakaista</span>
        <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">Keuhkosyöpä · nopeammin hoitoon</span>
      </span>
    </span>
  );
}
