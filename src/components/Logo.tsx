import { useId } from "react";

/**
 * Lung shapes shared by the logo and the home page animation (64 × 64 grid).
 * As seen by the viewer: the left lobe is the diseased one, the right lobe the healthy one.
 * Original artwork, not any organisation's logo.
 */
export const LUNG = {
  left: "M27 22C27 17 22 15 19 20C14 28 10 38 10 46C10 51 14 53 19 52C24 51 27 48 27 43Z",
  right: "M37 22C37 17 42 15 45 20C50 28 54 38 54 46C54 51 50 53 45 52C40 51 37 48 37 43Z",
  trachea: "M32 9V24",
  bronchi: "M32 24C32 28 29 29 27 30M32 24C32 28 35 29 37 30",
} as const;

const BRAND_GOLD = "#e9b44c";
/** Upward arrow along the trachea in the brand mark. */
const ARROW = { shaft: "M32 26V12", head: "M27 15.5L32 9.5L37 15.5" } as const;

export const LUNG_COLORS = {
  healthy: "#f6a5b6",
  healthyLight: "#fdd3dc",
  sick: "#8b7b88",
  damage: "#3a2733",
  tumour: "#2a1622",
} as const;

/**
 * Pikakaista mark: two healthy lungs with a gold arrow rising through the trachea, for
 * "faster forward". The diseased-lung imagery stays in the home page story, where it is
 * explained; a brand mark seen by smokers in an invitation should not shame or frighten.
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b2545" />
          <stop offset="1" stopColor="#1d5fa7" />
        </linearGradient>
        <linearGradient id={`${id}-healthy`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LUNG_COLORS.healthyLight} />
          <stop offset="1" stopColor={LUNG_COLORS.healthy} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${id}-bg)`} />
      <path d={LUNG.left} fill={`url(#${id}-healthy)`} />
      <path d={LUNG.right} fill={`url(#${id}-healthy)`} />
      <path d={LUNG.bronchi} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d={ARROW.shaft} stroke={BRAND_GOLD} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d={ARROW.head} stroke={BRAND_GOLD} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-tight">
        <span className="block text-lg font-extrabold tracking-tight text-brand-navy">Pikakaista</span>
        <span className="block text-xs font-medium tracking-wide text-slate-600">Keuhkosyöpä · nopeammin hoitoon</span>
      </span>
    </span>
  );
}
