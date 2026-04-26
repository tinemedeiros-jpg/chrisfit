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
    lines: ['MAIS', 'VENDIDO'],
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
              <svg x={iconX} y={iconY} width={ICON_W} height={ICON_H} viewBox="0 0 512 512">
                <path fill="#FFB446" d="M97.103,353.103C97.103,440.86,168.244,512,256,512l0,0c87.756,0,158.897-71.14,158.897-158.897 c0-88.276-44.138-158.897-14.524-220.69c0,0-47.27,8.828-73.752,79.448c0,0-88.276-88.276-51.394-211.862 c0,0-89.847,35.31-80.451,150.069c8.058,98.406-9.396,114.759-9.396,114.759c0-79.448-62.115-114.759-62.115-114.759 C141.241,247.172,97.103,273.655,97.103,353.103z" />
                <path fill="#FFDC64" d="M370.696,390.734c0,66.093-51.033,122.516-117.114,121.241 c-62.188-1.198-108.457-48.514-103.512-110.321c2.207-27.586,23.172-72.276,57.379-117.517l22.805,13.793 C229.517,242.023,256,167.724,256,167.724C273.396,246.007,370.696,266.298,370.696,390.734z" />
                <path fill="#FFFFFF" d="M211.862,335.448c-8.828,52.966-26.483,72.249-26.483,105.931C185.379,476.69,216.998,512,256,512 l0,0c39.284,0,70.729-32.097,70.62-71.381c-0.295-105.508-61.792-158.136-61.792-158.136c8.828,52.966-17.655,79.448-17.655,79.448 C236.141,345.385,211.862,335.448,211.862,335.448z" />
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
