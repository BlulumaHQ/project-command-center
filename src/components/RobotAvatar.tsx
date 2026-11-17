import type { ReactNode } from "react";

const robots: Record<string, { bg: string; art: ReactNode }> = {
  atlas: {
    bg: "#E8EDF9",
    art: (
      <>
        <polygon points="-26,-30 -20,-52 -10,-34 0,-58 10,-34 20,-52 26,-30" fill="#F5B70A" />
        <rect x="-44" y="-12" width="8" height="22" rx="3" fill="#F5B70A" />
        <rect x="36" y="-12" width="8" height="22" rx="3" fill="#F5B70A" />
        <rect x="-38" y="-32" width="76" height="66" rx="14" fill="#1E3A8A" />
        <rect x="-28" y="-14" width="56" height="22" rx="11" fill="#0B1530" />
        <circle cx="-12" cy="-3" r="5" fill="#F5B70A" />
        <circle cx="12" cy="-3" r="5" fill="#F5B70A" />
        <rect x="-12" y="16" width="24" height="5" rx="2.5" fill="#F5B70A" />
        <polygon points="0,-28 2.5,-23 8,-23 3.5,-20 5,-15 0,-18 -5,-15 -3.5,-20 -8,-23 -2.5,-23" fill="#F5B70A" />
      </>
    ),
  },
  memo: {
    bg: "#E0F7F4",
    art: (
      <>
        <line x1="0" y1="-36" x2="0" y2="-50" stroke="#0F766E" strokeWidth="3" />
        <circle cx="0" cy="-53" r="6" fill="#FDE68A" />
        <circle cx="0" cy="0" r="38" fill="#14B8A6" />
        <rect x="-26" y="-18" width="52" height="34" rx="12" fill="#F0FDFA" />
        <path d="M-17,-2 Q-11,-10 -5,-2" fill="none" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" />
        <path d="M5,-2 Q11,-10 17,-2" fill="none" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" />
        <path d="M-6,8 Q0,13 6,8" fill="none" stroke="#0F766E" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="-30" cy="14" r="4" fill="#FDA4AF" />
        <circle cx="30" cy="14" r="4" fill="#FDA4AF" />
      </>
    ),
  },
  rocket: {
    bg: "#FFEEDF",
    art: (
      <>
        <polygon points="-30,8 -46,30 -30,30" fill="#C2410C" />
        <polygon points="30,8 46,30 30,30" fill="#C2410C" />
        <path d="M-30,34 L-30,-6 Q0,-62 30,-6 L30,34 Z" fill="#F97316" />
        <circle cx="0" cy="2" r="17" fill="#FFF7ED" />
        <circle cx="0" cy="2" r="12" fill="#38BDF8" />
        <circle cx="-4" cy="-2" r="3.5" fill="#FFFFFF" />
        <rect x="-18" y="24" width="36" height="5" rx="2.5" fill="#C2410C" />
        <polygon points="-10,36 -5,48 0,36 5,48 10,36" fill="#FACC15" />
      </>
    ),
  },
  checky: {
    bg: "#E3F8EA",
    art: (
      <>
        <rect x="-36" y="-34" width="72" height="68" rx="10" fill="#22C55E" />
        <path d="M-8,-24 L-2,-18 L9,-29" fill="none" stroke="#F0FDF4" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="-14" cy="0" r="7" fill="#052E16" />
        <circle cx="-12" cy="-2" r="2" fill="#FFFFFF" />
        <circle cx="14" cy="0" r="13" fill="#DCFCE7" stroke="#15803D" strokeWidth="4" />
        <circle cx="14" cy="0" r="5" fill="#052E16" />
        <line x1="23" y1="10" x2="36" y2="26" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
        <rect x="-14" y="18" width="20" height="5" rx="2.5" fill="#052E16" />
      </>
    ),
  },
  pixel: {
    bg: "#EFEAFE",
    art: (
      <>
        <line x1="18" y1="-34" x2="30" y2="-52" stroke="#A16207" strokeWidth="4" strokeLinecap="round" />
        <path d="M28,-50 Q38,-62 34,-48 Z" fill="#F472B6" />
        <rect x="-36" y="-34" width="72" height="68" rx="6" fill="#8B5CF6" />
        {[[-24, -14, 1], [-16, -14, 1], [-24, -6, 1], [-16, -6, 0], [8, -14, 1], [16, -14, 1], [8, -6, 0], [16, -6, 1]].map(([x, y, light]) => (
          <rect key={`${x},${y}`} x={x} y={y} width="8" height="8" fill={light ? "#F5F3FF" : "#2E1065"} />
        ))}
        <rect x="-12" y="16" width="8" height="6" fill="#F5F3FF" />
        <rect x="-4" y="20" width="8" height="6" fill="#F5F3FF" />
        <rect x="4" y="16" width="8" height="6" fill="#F5F3FF" />
        <circle cx="-26" cy="-26" r="3" fill="#FACC15" />
        <circle cx="-18" cy="-26" r="3" fill="#22D3EE" />
        <circle cx="-10" cy="-26" r="3" fill="#F472B6" />
      </>
    ),
  },
  guido: {
    bg: "#E4EEFE",
    art: (
      <>
        <path d="M-30,-34 L0,-42 L0,-30 L-30,-24 Z" fill="#DBEAFE" />
        <path d="M30,-34 L0,-42 L0,-30 L30,-24 Z" fill="#BFDBFE" />
        <rect x="-34" y="-28" width="68" height="62" rx="12" fill="#3B82F6" />
        <polygon points="20,-28 28,-28 28,-12 24,-16 20,-12" fill="#EF4444" />
        <circle cx="-13" cy="0" r="10" fill="#EFF6FF" />
        <circle cx="13" cy="0" r="10" fill="#EFF6FF" />
        <line x1="-3" y1="0" x2="3" y2="0" stroke="#1E3A8A" strokeWidth="2.5" />
        <rect x="-16" y="-3" width="6" height="6" rx="1" fill="#1E3A8A" />
        <rect x="10" y="-3" width="6" height="6" rx="1" fill="#1E3A8A" />
        <rect x="-14" y="18" width="8" height="6" rx="1" fill="#FACC15" />
        <rect x="-4" y="18" width="8" height="6" rx="1" fill="#F472B6" />
        <rect x="6" y="18" width="8" height="6" rx="1" fill="#22C55E" />
      </>
    ),
  },
  scout: {
    bg: "#FEF6DC",
    art: (
      <>
        <path d="M-6,-34 L0,-50 L6,-34 Z" fill="#B45309" />
        <rect x="-36" y="-34" width="72" height="66" rx="18" fill="#D97706" />
        <rect x="-30" y="-12" width="24" height="22" rx="6" fill="#451A03" />
        <rect x="6" y="-12" width="24" height="22" rx="6" fill="#451A03" />
        <rect x="-6" y="-6" width="12" height="8" fill="#451A03" />
        <circle cx="-18" cy="-1" r="7" fill="#67E8F9" />
        <circle cx="18" cy="-1" r="7" fill="#67E8F9" />
        <circle cx="-20" cy="-3" r="2.2" fill="#FFFFFF" />
        <circle cx="16" cy="-3" r="2.2" fill="#FFFFFF" />
        <path d="M-8,20 Q0,25 8,20" fill="none" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  },
  mia: {
    bg: "#FDE7F1",
    art: (
      <>
        <circle cx="0" cy="2" r="34" fill="#EC4899" />
        <path d="M-38,4 Q-38,-44 0,-44 Q38,-44 38,4" fill="none" stroke="#831843" strokeWidth="5" />
        <rect x="-44" y="-8" width="12" height="22" rx="5" fill="#831843" />
        <rect x="32" y="-8" width="12" height="22" rx="5" fill="#831843" />
        <path d="M38,12 Q36,30 14,26" fill="none" stroke="#831843" strokeWidth="3" />
        <circle cx="12" cy="26" r="4" fill="#831843" />
        <ellipse cx="-12" cy="-2" rx="6" ry="8" fill="#FFFFFF" />
        <ellipse cx="12" cy="-2" rx="6" ry="8" fill="#FFFFFF" />
        <circle cx="-11" cy="0" r="3.5" fill="#500724" />
        <circle cx="13" cy="0" r="3.5" fill="#500724" />
        <line x1="-17" y1="-11" x2="-20" y2="-15" stroke="#500724" strokeWidth="2" strokeLinecap="round" />
        <line x1="17" y1="-11" x2="20" y2="-15" stroke="#500724" strokeWidth="2" strokeLinecap="round" />
        <path d="M-6,16 Q0,21 6,16" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  },
};

/** Generic fallback so a new agent added in Supabase still gets a face. */
const fallback = {
  bg: "#EEF0F3",
  art: (
    <>
      <line x1="0" y1="-34" x2="0" y2="-48" stroke="#475569" strokeWidth="3" />
      <circle cx="0" cy="-51" r="5" fill="#94A3B8" />
      <rect x="-34" y="-32" width="68" height="64" rx="14" fill="#64748B" />
      <circle cx="-12" cy="-4" r="6" fill="#F8FAFC" />
      <circle cx="12" cy="-4" r="6" fill="#F8FAFC" />
      <rect x="-12" y="14" width="24" height="5" rx="2.5" fill="#F8FAFC" />
    </>
  ),
};

export function RobotAvatar({ id, size = 64, className }: { id: string; size?: number; className?: string }) {
  const r = robots[id] ?? fallback;
  return (
    <svg viewBox="-60 -64 120 120" width={size} height={size} className={className} role="img" aria-label={id}>
      <rect x="-60" y="-64" width="120" height="120" rx="28" fill={r.bg} />
      <g transform="translate(0,2) scale(0.92)">{r.art}</g>
    </svg>
  );
}
