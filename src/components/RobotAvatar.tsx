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
  bolt: {
    bg: "#FEF9C3",
    art: (
      <>
        <polygon points="-4,-62 -16,-38 -6,-38 -12,-26 8,-46 -2,-46 6,-62" fill="#FACC15" stroke="#A16207" strokeWidth="2" strokeLinejoin="round" />
        <rect x="-44" y="-6" width="8" height="20" rx="3" fill="#A16207" />
        <rect x="36" y="-6" width="8" height="20" rx="3" fill="#A16207" />
        <rect x="-38" y="-30" width="76" height="64" rx="12" fill="#EAB308" />
        <rect x="-28" y="-14" width="56" height="20" rx="10" fill="#422006" />
        <rect x="-19" y="-8" width="12" height="8" rx="2" fill="#FDE047" />
        <rect x="7" y="-8" width="12" height="8" rx="2" fill="#FDE047" />
        <path d="M-12,18 L-4,14 L4,22 L12,16" fill="none" stroke="#422006" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="-30" y="26" width="60" height="5" rx="2.5" fill="#A16207" />
      </>
    ),
  },
  compass: {
    bg: "#E0E7FF",
    art: (
      <>
        <line x1="0" y1="-34" x2="0" y2="-48" stroke="#3730A3" strokeWidth="3" />
        <circle cx="0" cy="-51" r="5" fill="#F472B6" />
        <circle cx="0" cy="0" r="38" fill="#4F46E5" />
        <circle cx="0" cy="0" r="27" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="3" />
        <text x="0" y="-15" textAnchor="middle" fontSize="9" fontWeight="800" fill="#3730A3">N</text>
        <polygon points="0,-12 6,0 0,4 -6,0" fill="#EF4444" />
        <polygon points="0,16 6,0 0,-4 -6,0" fill="#312E81" />
        <circle cx="0" cy="2" r="3" fill="#FACC15" />
        <circle cx="-15" cy="-4" r="3.5" fill="#1E1B4B" />
        <circle cx="15" cy="-4" r="3.5" fill="#1E1B4B" />
        <path d="M-9,20 Q0,25 9,20" fill="none" stroke="#3730A3" strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  },
  // ── Bluluma 董事會 (original robots, not likenesses) ──
  hormozi: {
    bg: "#FFEEDF",
    art: (
      <>
        <rect x="-36" y="-30" width="72" height="64" rx="12" fill="#EA580C" />
        <path d="M-38,-26 Q-38,-52 0,-52 Q38,-52 38,-26 Z" fill="#1F2937" />
        <rect x="-4" y="-50" width="8" height="5" rx="2" fill="#F97316" />
        <path d="M-38,-27 L54,-27 Q56,-20 38,-20 L-38,-20 Z" fill="#111827" />
        <rect x="-28" y="-12" width="56" height="18" rx="9" fill="#431407" />
        <rect x="-20" y="-7" width="12" height="7" rx="3" fill="#FED7AA" />
        <rect x="8" y="-7" width="12" height="7" rx="3" fill="#FED7AA" />
        <path d="M-22,12 Q0,30 22,12 L22,20 Q0,36 -22,20 Z" fill="#7C2D12" />
        <text x="0" y="24" textAnchor="middle" fontSize="11" fontWeight="800" fill="#FDBA74">$</text>
      </>
    ),
  },
  naval: {
    bg: "#DDF6F2",
    art: (
      <>
        <ellipse cx="0" cy="-48" rx="20" ry="5" fill="none" stroke="#FACC15" strokeWidth="3" />
        <circle cx="0" cy="0" r="38" fill="#0D9488" />
        <rect x="-26" y="-16" width="52" height="32" rx="14" fill="#F0FDFA" />
        <path d="M-17,-2 Q-11,4 -5,-2" fill="none" stroke="#134E4A" strokeWidth="3" strokeLinecap="round" />
        <path d="M5,-2 Q11,4 17,-2" fill="none" stroke="#134E4A" strokeWidth="3" strokeLinecap="round" />
        <path d="M-5,9 Q0,12 5,9" fill="none" stroke="#134E4A" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="0" cy="-27" r="3" fill="#5EEAD4" />
      </>
    ),
  },
  codie: {
    bg: "#FDE7F1",
    art: (
      <>
        <path d="M24,-30 Q48,-30 44,4 Q40,-14 26,-18 Z" fill="#9D174D" />
        <rect x="-34" y="-34" width="68" height="66" rx="20" fill="#DB2777" />
        <rect x="-30" y="-10" width="26" height="14" rx="5" fill="#1F2937" />
        <rect x="4" y="-10" width="26" height="14" rx="5" fill="#1F2937" />
        <rect x="-4" y="-6" width="8" height="3" fill="#1F2937" />
        <rect x="-26" y="-8" width="6" height="3" rx="1.5" fill="#F9A8D4" />
        <rect x="8" y="-8" width="6" height="3" rx="1.5" fill="#F9A8D4" />
        <path d="M-10,16 Q0,23 10,16" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <rect x="-50" y="12" width="20" height="15" rx="3" fill="#78350F" />
        <rect x="-44" y="8" width="8" height="5" rx="1.5" fill="none" stroke="#78350F" strokeWidth="2" />
      </>
    ),
  },
  chrisdo: {
    bg: "#E7E8FD",
    art: (
      <>
        <line x1="30" y1="-36" x2="44" y2="-56" stroke="#F5F5F4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="45" cy="-58" r="2.5" fill="#A5B4FC" />
        <path d="M-36,34 L-36,-6 Q-36,-40 0,-40 Q36,-40 36,-6 L36,34 Z" fill="#4338CA" />
        <circle cx="-14" cy="0" r="12" fill="#EEF2FF" stroke="#111827" strokeWidth="3.5" />
        <circle cx="14" cy="0" r="12" fill="#EEF2FF" stroke="#111827" strokeWidth="3.5" />
        <line x1="-2" y1="0" x2="2" y2="0" stroke="#111827" strokeWidth="3" />
        <circle cx="-14" cy="1" r="4" fill="#1E1B4B" />
        <circle cx="14" cy="1" r="4" fill="#1E1B4B" />
        <path d="M-8,22 L8,22" stroke="#C7D2FE" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  paula: {
    bg: "#FEF6D2",
    art: (
      <>
        <line x1="-22" y1="-34" x2="-34" y2="-56" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
        <path d="M-36,-54 Q-46,-66 -38,-50 Z" fill="#DC2626" />
        <rect x="-36" y="-34" width="72" height="68" rx="8" fill="#CA8A04" />
        <text x="16" y="-12" textAnchor="middle" fontSize="20" fontWeight="900" fill="#FEF9C3" fontFamily="Georgia, serif">Aa</text>
        <circle cx="-14" cy="2" r="8" fill="#FFFFFF" />
        <circle cx="14" cy="6" r="8" fill="#FFFFFF" />
        <circle cx="-13" cy="3" r="4" fill="#422006" />
        <circle cx="15" cy="7" r="4" fill="#422006" />
        <path d="M-12,20 Q0,30 12,20" fill="none" stroke="#422006" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  munger: {
    bg: "#E8ECF1",
    art: (
      <>
        <rect x="-36" y="-32" width="72" height="66" rx="16" fill="#475569" />
        <rect x="-30" y="-40" width="60" height="10" rx="5" fill="#CBD5E1" />
        <circle cx="-14" cy="-2" r="11" fill="#F1F5F9" stroke="#0F172A" strokeWidth="4" />
        <circle cx="14" cy="-2" r="11" fill="#F1F5F9" stroke="#0F172A" strokeWidth="4" />
        <line x1="-3" y1="-2" x2="3" y2="-2" stroke="#0F172A" strokeWidth="3" />
        <circle cx="-14" cy="-1" r="3.5" fill="#0F172A" />
        <circle cx="14" cy="-1" r="3.5" fill="#0F172A" />
        <path d="M-10,20 L10,20" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
        <rect x="30" y="8" width="20" height="24" rx="2" fill="#B91C1C" />
        <rect x="33" y="8" width="3" height="24" fill="#7F1D1D" />
        <path d="M38,16 l6,0 m-6,5 l6,0" stroke="#FECACA" strokeWidth="1.5" />
      </>
    ),
  },
  guest: {
    bg: "#EFE7FD",
    art: (
      <>
        <rect x="-36" y="-30" width="72" height="64" rx="18" fill="#7C3AED" />
        <rect x="-22" y="-62" width="44" height="30" rx="4" fill="#1E1B4B" />
        <rect x="-34" y="-36" width="68" height="7" rx="3.5" fill="#1E1B4B" />
        <rect x="-22" y="-42" width="44" height="5" fill="#F5B70A" />
        <rect x="-28" y="-14" width="56" height="22" rx="11" fill="#2E1065" />
        <text x="0" y="5" textAnchor="middle" fontSize="20" fontWeight="900" fill="#FDE68A">? ?</text>
        <path d="M-8,20 Q0,25 8,20" fill="none" stroke="#DDD6FE" strokeWidth="3" strokeLinecap="round" />
        <circle cx="-31" cy="12" r="3" fill="#C4B5FD" />
        <circle cx="31" cy="12" r="3" fill="#C4B5FD" />
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

/** Raw head artwork (centred on 0,0, roughly ±50 units) for use inside other SVG scenes. */
export function robotArt(id: string): ReactNode {
  return (robots[id] ?? fallback).art;
}
