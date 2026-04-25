import type { SVGProps } from 'react';

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  ...p,
});

export const Cloud = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M17.5 19a4.5 4.5 0 0 0 .9-8.9A6 6 0 0 0 6.6 9.5 4 4 0 0 0 7 19h10.5z"/></svg>;
export const Home = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>;
export const Layers = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
export const Calendar = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
export const Check = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M20 6 9 17l-5-5"/></svg>;
export const Plus = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 5v14M5 12h14"/></svg>;
export const Trash = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
export const Edit = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>;
export const Settings = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
export const Brain = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M9 3a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5 3 3 0 0 0 1 5 3 3 0 0 0 4 4 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"/><path d="M15 3a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5 3 3 0 0 1-1 5 3 3 0 0 1-4 4 3 3 0 0 1-3-3"/></svg>;
export const Target = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
export const Trophy = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 4h3v3a3 3 0 0 1-3 3M7 4H4v3a3 3 0 0 0 3 3"/></svg>;
export const Play = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M6 4l14 8-14 8V4z"/></svg>;
export const Pause = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
export const Reset = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>;
export const ChevronRight = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M9 6l6 6-6 6"/></svg>;
export const ChevronDown = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M6 9l6 6 6-6"/></svg>;
export const ChevronLeft = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M15 6l-6 6 6 6"/></svg>;
export const X = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M18 6 6 18M6 6l12 12"/></svg>;
export const Download = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>;
export const Upload = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>;
export const Sparkle = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>;
export const Flag = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M4 22V4a1 1 0 0 1 1-1h11l-2 4 2 4H5"/></svg>;
