import React from 'react';
import { Product } from '../types';

type FlagKind = 'new' | 'lastUnits' | 'bestSeller';

interface FlagDefinition {
  emoji: string;
  lines: string[];
  bg: string;
  shadow: string;
  text: string;
}

const FLAGS: Record<FlagKind, FlagDefinition> = {
  new: {
    emoji: '✨',
    lines: ['NOVO'],
    bg: '#948add',
    shadow: '#6a5aad',
    text: '#FFFFFF'
  },
  bestSeller: {
    emoji: '',
    lines: ['MAIS VENDIDO'],
    bg: '#f23a7e',
    shadow: '#c12060',
    text: '#FFFFFF'
  },
  lastUnits: {
    emoji: '💖',
    lines: ['ÚLTIMAS', 'UNIDADES'],
    bg: '#e8d3a6',
    shadow: '#c4a870',
    text: '#1a1a1a'
  }
};

const SIZE_PRESETS = {
  sm: { width: 78 },
  md: { width: 104 },
  lg: { width: 132 }
};

type FlagSize = keyof typeof SIZE_PRESETS;

interface FlagBadgeProps {
  kind: FlagKind;
  size?: FlagSize;
}

const VB_W = 220;
const VB_H = 210;

const HOLE_PATH        = 'M 160 70 A 8 8 0 1 0 176 70 A 8 8 0 1 0 160 70 Z';
const HOLE_PATH_SHADOW = 'M 160 74 A 8 8 0 1 0 176 74 A 8 8 0 1 0 160 74 Z';

const BODY_PATH =
  'M 18 52 L 150 52 L 188 84 L 188 162 Q 188 175 176 175 L 18 175 Q 6 175 6 162 L 6 64 Q 6 52 18 52 Z';
const SHADOW_PATH =
  'M 18 56 L 150 56 L 188 88 L 188 166 Q 188 179 176 179 L 18 179 Q 6 179 6 166 L 6 68 Q 6 56 18 56 Z';

const RING_PATH =
  'M 154 70 A 14 14 0 1 0 182 70 A 14 14 0 1 0 154 70 Z ' + HOLE_PATH;

// Body vertical center (unrotated coords)
const BODY_CY = (52 + 175) / 2; // 113.5
const ICON_W  = 32;
const ICON_H  = 32;
const CX      = 94; // horizontal center of content

// Layout: icon (32) + gap (8) + text (18px ~ 13 cap) = 53  →  total ~58 with baseline offset
const singleLayout = () => {
  const total = ICON_H + 8 + 18;
  const top   = BODY_CY - total / 2;
  return { iconY: top, textY: top + ICON_H + 8 + 14 };
};

// Layout: icon (32) + gap (6) + line(18) + gap(5) + line(18) total ~79
const twoLineLayout = () => {
  const total = ICON_H + 6 + 18 + 5 + 18;
  const top   = BODY_CY - total / 2;
  return {
    iconY:  top,
    line1Y: top + ICON_H + 6 + 14,
    line2Y: top + ICON_H + 6 + 18 + 5 + 14,
  };
};

const FlagBadge: React.FC<FlagBadgeProps> = ({ kind, size = 'md' }) => {
  const def     = FLAGS[kind];
  const s       = SIZE_PRESETS[size];
  const twoLine = def.lines.length === 2;

  // useId() includes colons which are invalid in SVG IDs
  const uid      = React.useId().replace(/:/g, '');
  const shadowId = `sh${uid}`;

  const iconX = CX - ICON_W / 2;

  const sl = twoLine ? null      : singleLayout();
  const tl = twoLine ? twoLineLayout() : null;

  const iconY  = twoLine ? tl!.iconY  : sl!.iconY;
  const textY  = twoLine ? 0          : sl!.textY;
  const line1Y = twoLine ? tl!.line1Y : 0;
  const line2Y = twoLine ? tl!.line2Y : 0;

  // Emoji baseline ≈ icon top + 82% of height (visual centre for most emojis)
  const emojiBaseY = Math.round(iconY + ICON_H * 0.82);

  return (
    <div
      className="pointer-events-none select-none"
      style={{ width: s.width }}
      aria-label={def.lines.join(' ')}
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>

        <g transform="translate(0, 5)">
          <g transform={`rotate(-28 ${VB_W / 2} ${VB_H / 2})`}>

            {/* Espessura 3D */}
            <path d={`${SHADOW_PATH} ${HOLE_PATH_SHADOW}`} fillRule="evenodd" fill={def.shadow} />

            {/* Corpo com furo transparente */}
            <path
              d={`${BODY_PATH} ${HOLE_PATH}`}
              fillRule="evenodd"
              fill={def.bg}
              filter={`url(#${shadowId})`}
            />

            {/* Ilhós donut */}
            <path d={RING_PATH} fillRule="evenodd" fill="#4B5563" opacity="0.5" />

            {/* Barbante (por cima do ilhós) */}
            <path
              d="M 168 70 C 184 52, 196 44, 204 42"
              stroke="#0E0E0E" strokeWidth="4" fill="none" strokeLinecap="round"
            />
            <circle cx="204" cy="42" r="7" fill="#4B5563" opacity="0.5" />
            <circle cx="204" cy="42" r="4" fill="#0E0E0E" />

            {/* ── Ícone ── */}
            {kind === 'bestSeller' ? (
              // SVG do fogo com gradientes em namespace próprio (nested svg)
              <svg x={iconX} y={iconY} width={ICON_W} height={ICON_H} viewBox="0 0 128 128">
                <defs>
                  <radialGradient
                    id={`${uid}f1`} cx="56.143" cy="84.309" r="87.465"
                    gradientTransform="matrix(1 0 0 1.0168 0 -1.414)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset=".39" stopColor="#ffd600" />
                    <stop offset=".69" stopColor="#ff9800" />
                    <stop offset="1"   stopColor="#f44336" />
                  </radialGradient>
                  <linearGradient
                    id={`${uid}f2`} gradientUnits="userSpaceOnUse"
                    x1="66.376" y1="55.177" x2="67.864" y2="7.921"
                  >
                    <stop offset=".165" stopColor="#ffeb3b" />
                    <stop offset="1"    stopColor="#ffd600" />
                  </linearGradient>
                  <radialGradient
                    id={`${uid}f3`} cx="64.554" cy="119.112" r="100.435"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset=".119" stopColor="#ff6d00" />
                    <stop offset=".485" stopColor="#f44336" />
                    <stop offset=".814" stopColor="#b71c1c" />
                  </radialGradient>
                  <linearGradient
                    id={`${uid}f4`} gradientUnits="userSpaceOnUse"
                    x1="44.847" y1="96.121" x2="59.731" y2="141.33"
                  >
                    <stop offset=".076" stopColor="#ffeb3b" />
                    <stop offset="1"    stopColor="#ffd600" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient
                    id={`${uid}f5`} gradientUnits="userSpaceOnUse"
                    x1="94.721" y1="46.472" x2="120.608" y2="61.142"
                  >
                    <stop offset="0" stopColor="#ffd600" />
                    <stop offset="1" stopColor="#ffd600" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient
                    id={`${uid}f6`} gradientUnits="userSpaceOnUse"
                    x1="87.653" y1="65.354" x2="94.908" y2="140.331"
                  >
                    <stop offset=".187" stopColor="#ffeb3b" />
                    <stop offset=".934" stopColor="#ffd600" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path fill={`url(#${uid}f1)`} d="M99.66 51.02C97 35.69 90.52 30.95 84.8 26.77c-3.93-2.87-7.33-5.35-9.04-10.79c-1.83-5.8 2.8-11.84 2.85-11.9c.13-.16.14-.39.03-.57a.485.485 0 0 0-.52-.23c-.39.07-.89.14-1.48.21c-6.1.81-22.29 2.94-26.55 24.65c-.56 2.86-2.29 5.18-4.1 5.51c-1.16.21-2.25-.43-3.13-1.86c-3.5-5.68 3.85-15.25 3.93-15.35c.13-.16.14-.39.03-.57a.498.498 0 0 0-.52-.23c-.21.04-20.7 4.31-29.02 25.26c-2.53 6.37-9.62 28.64 5.28 47.76c14.94 19.17 24.01 20.48 24.21 20.59c.07.05 58.05-20.89 52.89-58.23z" />
                <path fill={`url(#${uid}f2)`} opacity=".8" d="M70.75 36.89c-3.97-7.72-10.41-23.91 6.55-32.76C64.55 6.42 55.18 15.49 55.94 30.8c.49 9.98 6.1 18.88 8.71 28.52c3.51 13.03.86 21.17-.67 27.32c21.76-14.28 11.86-39.87 6.77-49.75z" />
                <path fill={`url(#${uid}f3)`} d="M87.31 41.09c-16.65 0-22.76 17.01-22.76 17.01s-4.38-17.01-22.8-17.01c-12.6 0-26.96 9.98-21.65 32.68c5.31 22.69 44.49 50.97 44.49 50.97s39.05-28.27 44.36-50.96c5.31-22.71-8.03-32.69-21.64-32.69z" />
                <path fill="#ff7043" d="M28.85 53.14c2.85-3.56 7.94-6.49 12.25-3.11c2.33 1.83 1.31 5.59-.77 7.17c-3.04 2.31-5.69 3.7-7.53 7.32c-1.11 2.18-1.78 4.55-2.12 6.98c-.13.96-1.39 1.19-1.86.35c-3.22-5.7-4.13-13.52.03-18.71z" />
                <path fill="#ff7043" d="M74.53 60.61c-1.34 0-2.28-1.29-1.79-2.54c.91-2.29 2.07-4.52 3.48-6.49c2.08-2.92 6.04-4.62 8.55-2.85c2.57 1.81 2.24 5.43.43 7.17c-3.88 3.75-8.75 4.71-10.67 4.71z" />
                <path fill={`url(#${uid}f4)`} d="M62.56 123.22c-12.1-1.61-17.8-4.96-21.99-13.7c-2.14-4.47-2.15-12.11-2.23-16.84c-.09-5.24-1.67-9.77-1.67-9.77c3.16.56 8.89 6.11 11.53 16.37c4.59 17.81 14.36 23.94 14.36 23.94z" />
                <path fill={`url(#${uid}f5)`} d="M104.82 82.91s9.09-5.25 11.34-17.89c1.47-8.25-.28-16.49-8.19-24.58c-2.81-2.88-12-9.89-8.47-21.97c0 0-8.64 7.33-5.71 20.55c3.3 14.89 17.35 20 11.03 43.89z" />
                <path fill={`url(#${uid}f6)`} d="M97.88 66c2.43.86 12.27 16.19 3.12 32.29c-8.14 14.32-24.05 16.54-24.05 16.54s12.56-12.58 17.47-24.52C98.86 79.54 97.88 66 97.88 66z" />
              </svg>
            ) : (
              <text
                x={CX}
                y={emojiBaseY}
                textAnchor="middle"
                fontSize="26"
                fill={def.text}
              >
                {def.emoji}
              </text>
            )}

            {/* ── Texto(s) ── */}
            {twoLine ? (
              <>
                <text
                  x={CX} y={line1Y}
                  textAnchor="middle"
                  fontFamily="'Inter', system-ui, sans-serif"
                  fontWeight="800" fontSize="18"
                  fill={def.text} letterSpacing="0.5"
                >
                  {def.lines[0]}
                </text>
                <text
                  x={CX} y={line2Y}
                  textAnchor="middle"
                  fontFamily="'Inter', system-ui, sans-serif"
                  fontWeight="800" fontSize="18"
                  fill={def.text} letterSpacing="0.5"
                >
                  {def.lines[1]}
                </text>
              </>
            ) : (
              <text
                x={CX} y={textY}
                textAnchor="middle"
                fontFamily="'Inter', system-ui, sans-serif"
                fontWeight="800" fontSize="18"
                fill={def.text} letterSpacing="0.5"
              >
                {def.lines[0]}
              </text>
            )}

          </g>
        </g>
      </svg>
    </div>
  );
};

interface ProductFlagsProps {
  product: Product;
  size?: FlagSize;
  className?: string;
  gap?: number;
}

const ORDER: FlagKind[] = ['bestSeller', 'new', 'lastUnits'];

const KIND_BY_KEY: Record<FlagKind, keyof Product> = {
  new: 'isNew',
  lastUnits: 'isLastUnits',
  bestSeller: 'isBestSeller'
};

export const hasAnyFlag = (product: Product) =>
  ORDER.some((kind) => Boolean(product[KIND_BY_KEY[kind]]));

export const ProductFlags: React.FC<ProductFlagsProps> = ({
  product,
  size = 'md',
  className,
  gap
}) => {
  const active = ORDER.filter((kind) => Boolean(product[KIND_BY_KEY[kind]]));
  if (active.length === 0) return null;

  const overlap = gap !== undefined ? -gap : -Math.round(SIZE_PRESETS[size].width * 0.18);

  return (
    <div className={`flex flex-col items-end pointer-events-none ${className ?? ''}`}>
      {active.map((kind, idx) => (
        <div key={kind} style={idx > 0 ? { marginTop: overlap } : undefined}>
          <FlagBadge kind={kind} size={size} />
        </div>
      ))}
    </div>
  );
};

export default FlagBadge;
