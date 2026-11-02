// Flat fashion-illustration portraits for the cast. Each has a signature colour and look.
import type { CharacterId, Mood } from '../engine/types';

export const CAST_COLOUR: Record<CharacterId, string> = {
  margaux: '#7a2433',
  theo: '#c58a1a',
  idris: '#2c3e63',
  ferriter: '#5f7a5a',
  aoife: '#1f6f6b',
  niamh: '#5a3f63',
  narrator: '#8a837a',
  news: '#8a837a',
};

function Face({ mood, skin, cheek }: { mood: Mood; skin: string; cheek?: string }) {
  const mouth =
    mood === 'happy' ? 'M53 79 Q60 86 67 79' : mood === 'worried' ? 'M54 82 Q60 78 66 82' : 'M54 80 Q60 83 66 80';
  const brows = mood === 'worried' ? ['M45 58 L53 61', 'M75 58 L67 61'] : ['M45 60 Q49 57 53 60', 'M67 60 Q71 57 75 60'];
  return (
    <>
      <ellipse cx="60" cy="66" rx="17" ry="21" fill={skin} />
      {cheek && (
        <>
          <circle cx="49" cy="74" r="3.5" fill={cheek} opacity=".35" />
          <circle cx="71" cy="74" r="3.5" fill={cheek} opacity=".35" />
        </>
      )}
      <circle cx="53" cy="66" r="1.8" fill="#1b1918" />
      <circle cx="67" cy="66" r="1.8" fill="#1b1918" />
      {brows.map((d) => (
        <path key={d} d={d} stroke="#1b1918" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      ))}
      <path d={mouth} stroke="#1b1918" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  );
}

function Margaux({ mood }: { mood: Mood }) {
  return (
    <>
      <path d="M22 120 Q24 96 60 94 Q96 96 98 120 Z" fill="#f1e9dc" />
      <rect x="52" y="82" width="16" height="16" rx="3" fill="#f1e9dc" />
      <path d="M50 92 Q60 99 70 92 L70 100 Q60 104 50 100 Z" fill="#e5dccc" />
      {/* sleek black bob */}
      <path d="M35 84 Q32 36 60 36 Q88 36 85 84 Q79 89 73 84 L73 70 L47 70 L47 84 Q41 89 35 84 Z" fill="#171514" />
      <Face mood={mood} skin="#f0d2bd" cheek="#c9706f" />
      <path d="M41 62 Q42 41 60 40 Q79 41 79 62 Q72 50 57 52 Q47 54 41 62 Z" fill="#171514" />
      {/* round glasses */}
      <circle cx="53" cy="66" r="6" fill="none" stroke="#1b1918" strokeWidth="1.3" />
      <circle cx="67" cy="66" r="6" fill="none" stroke="#1b1918" strokeWidth="1.3" />
      <path d="M59 66 L61 66" stroke="#1b1918" strokeWidth="1.3" />
      {/* oxblood lips */}
      <path d={mood === 'happy' ? 'M54 79 Q60 85 66 79 Q60 81 54 79 Z' : 'M54 80 Q60 83 66 80 Q60 82 54 80 Z'} fill="#7a2433" />
    </>
  );
}

function Theo({ mood }: { mood: Mood }) {
  return (
    <>
      {/* loud patterned shirt */}
      <path d="M22 120 Q24 96 60 94 Q96 96 98 120 Z" fill="#e3a72f" />
      {[30, 44, 58, 72, 86].map((x) => (
        <circle key={x} cx={x} cy={110} r="3" fill="#7a2433" opacity=".7" />
      ))}
      {[37, 51, 65, 79].map((x) => (
        <circle key={x} cx={x} cy={102} r="2.4" fill="#2c3e63" opacity=".6" />
      ))}
      <rect x="53" y="82" width="14" height="14" rx="3" fill="#c98e63" />
      {/* tape measure */}
      <path d="M40 98 Q50 104 56 120 M80 98 Q70 104 64 120" stroke="#f3e7b8" strokeWidth="4" fill="none" />
      <Face mood={mood} skin="#c98e63" cheek="#9c4a3a" />
      {/* curls */}
      {[
        [44, 50],
        [52, 44],
        [61, 42],
        [70, 44],
        [77, 51],
        [42, 59],
        [79, 60],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="7" fill="#3b2418" />
      ))}
      {/* moustache */}
      <path d="M51 76 Q56 72 60 75 Q64 72 69 76 Q64 78 60 76.5 Q56 78 51 76 Z" fill="#3b2418" />
    </>
  );
}

function Idris({ mood }: { mood: Mood }) {
  return (
    <>
      {/* navy suit, white shirt, pocket square */}
      <path d="M22 120 Q24 96 60 94 Q96 96 98 120 Z" fill="#22314f" />
      <path d="M52 95 L60 112 L68 95 Z" fill="#f4f1ea" />
      <path d="M58 98 L60 112 L62 98 Z" fill="#7a2433" />
      <path d="M80 106 l6 -3 l1 5 Z" fill="#c58a1a" />
      <rect x="53" y="82" width="14" height="13" rx="3" fill="#a87556" />
      <Face mood={mood} skin="#a87556" />
      {/* silver swept-back hair */}
      <path d="M42 62 Q40 42 60 41 Q80 42 78 62 Q76 50 60 49 Q46 50 42 62 Z" fill="#c9c6c0" />
      {/* beard */}
      <path d="M44 72 Q46 90 60 92 Q74 90 76 72 Q72 84 60 85 Q48 84 44 72 Z" fill="#b9b5ae" />
      <path d="M52 77 Q60 74 68 77" stroke="#b9b5ae" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  );
}

function Ferriter({ mood }: { mood: Mood }) {
  return (
    <>
      {/* sage cardigan, pearls */}
      <path d="M22 120 Q24 96 60 94 Q96 96 98 120 Z" fill="#7d9776" />
      <path d="M50 94 L60 120 L70 94 Q60 98 50 94 Z" fill="#efe7da" />
      {[48, 52, 56, 60, 64, 68, 72].map((x, i) => (
        <circle key={x} cx={x} cy={93 + Math.abs(3 - i) * -0.8 + 3} r="1.9" fill="#fbf8f2" stroke="#d8cfbf" strokeWidth=".5" />
      ))}
      <rect x="53" y="82" width="14" height="12" rx="3" fill="#f2d9c8" />
      <Face mood={mood} skin="#f2d9c8" cheek="#d98a8a" />
      {/* white hair in a bun */}
      <circle cx="60" cy="36" r="9" fill="#ece8e1" />
      <path d="M42 66 Q40 44 60 44 Q80 44 78 66 Q76 54 60 53 Q44 54 42 66 Z" fill="#ece8e1" />
      {/* glasses on a chain */}
      <rect x="47" y="62" width="11" height="8" rx="3" fill="none" stroke="#5f7a5a" strokeWidth="1.3" />
      <rect x="62" y="62" width="11" height="8" rx="3" fill="none" stroke="#5f7a5a" strokeWidth="1.3" />
      <path d="M47 67 Q42 84 50 94 M73 67 Q78 84 70 94" stroke="#c58a1a" strokeWidth=".8" fill="none" />
    </>
  );
}

function Aoife({ mood }: { mood: Mood }) {
  return (
    <>
      {/* teal blazer, lanyard */}
      <path d="M22 120 Q24 96 60 94 Q96 96 98 120 Z" fill="#1f6f6b" />
      <path d="M50 95 L60 108 L70 95 Z" fill="#f4f1ea" />
      <path d="M52 96 L58 120 M68 96 L62 120" stroke="#f3e7b8" strokeWidth="2" />
      <rect x="55" y="112" width="10" height="8" rx="1" fill="#f4f1ea" />
      <rect x="53" y="82" width="14" height="13" rx="3" fill="#f5dccb" />
      {/* red ponytail behind */}
      <path d="M76 52 Q96 60 88 92 Q84 74 76 66 Z" fill="#b5462b" />
      <Face mood={mood} skin="#f5dccb" cheek="#e08b77" />
      {/* freckles */}
      {[
        [48, 72],
        [51, 74],
        [69, 74],
        [72, 72],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r=".9" fill="#b5462b" opacity=".6" />
      ))}
      <path d="M42 64 Q40 42 60 42 Q80 42 78 62 Q70 50 56 54 Q48 56 42 64 Z" fill="#b5462b" />
    </>
  );
}

function Niamh({ mood }: { mood: Mood }) {
  return (
    <>
      {/* plum blazer over a striped shirt, pen in the pocket */}
      <path d="M22 120 Q24 96 60 94 Q96 96 98 120 Z" fill="#5a3f63" />
      <path d="M51 95 L60 114 L69 95 Z" fill="#eef0f2" />
      {[99, 104, 109].map((y) => (
        <path key={y} d={`M54 ${y} L66 ${y}`} stroke="#9bb0c4" strokeWidth="1.4" />
      ))}
      <rect x="78" y="100" width="2.6" height="12" rx="1" fill="#c58a1a" />
      <rect x="53" y="82" width="14" height="13" rx="3" fill="#8d5b44" />
      <Face mood={mood} skin="#8d5b44" />
      {/* short natural curls */}
      <path d="M40 66 Q36 40 60 38 Q84 40 80 66 Q78 52 68 50 Q60 46 52 50 Q42 52 40 66 Z" fill="#1d1412" />
      {[
        [44, 50],
        [50, 43],
        [58, 40],
        [66, 41],
        [74, 46],
        [78, 54],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="6" fill="#1d1412" />
      ))}
      {/* rectangular reading glasses */}
      <rect x="46" y="62" width="12" height="8" rx="1.5" fill="none" stroke="#1b1918" strokeWidth="1.3" />
      <rect x="62" y="62" width="12" height="8" rx="1.5" fill="none" stroke="#1b1918" strokeWidth="1.3" />
      <path d="M58 66 L62 66" stroke="#1b1918" strokeWidth="1.3" />
    </>
  );
}

const DRAW: Partial<Record<CharacterId, (p: { mood: Mood }) => JSX.Element>> = {
  margaux: Margaux,
  theo: Theo,
  idris: Idris,
  ferriter: Ferriter,
  aoife: Aoife,
  niamh: Niamh,
};

export function Portrait({ who, mood = 'neutral', size = 72 }: { who: CharacterId; mood?: Mood; size?: number }) {
  const Draw = DRAW[who];
  const colour = CAST_COLOUR[who];
  return (
    <svg className="portrait" width={size} height={size} viewBox="0 0 120 120" aria-hidden>
      <defs>
        <clipPath id={`clip-${who}`}>
          <circle cx="60" cy="60" r="58" />
        </clipPath>
      </defs>
      <circle cx="60" cy="60" r="58" fill="#f4eee5" />
      <circle cx="60" cy="60" r="58" fill={colour} opacity=".16" />
      <g clipPath={`url(#clip-${who})`}>{Draw ? <Draw mood={mood} /> : null}</g>
      <circle cx="60" cy="60" r="58" fill="none" stroke={colour} strokeWidth="2.5" />
    </svg>
  );
}
