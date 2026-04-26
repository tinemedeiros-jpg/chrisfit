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
    lines: ['Novo'],
    bg: '#948add',
    shadow: '#6a5aad',
    text: '#FFFFFF'
  },
  bestSeller: {
    emoji: '🔥',
    lines: ['Mais vendido'],
    bg: '#f23a7e',
    shadow: '#c12060',
    text: '#FFFFFF'
  },
  lastUnits: {
    emoji: '💖',
    lines: ['Últimas', 'unidades'],
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

// viewBox fixo; tudo escala via width no container.
const VB_W = 220;
const VB_H = 210;

// Subpath circular para o furo (evenodd): cx=168 cy=70 r=8
const HOLE_PATH = 'M 160 70 A 8 8 0 1 0 176 70 A 8 8 0 1 0 160 70 Z';
// Mesmo furo deslocado +4 em y para a camada de sombra
const HOLE_PATH_SHADOW = 'M 160 74 A 8 8 0 1 0 176 74 A 8 8 0 1 0 160 74 Z';

// Corpo — pentágono chanfrado, mais alto pra caber duas linhas de texto
const BODY_PATH =
  'M 18 52 L 150 52 L 188 84 L 188 162 Q 188 175 176 175 L 18 175 Q 6 175 6 162 L 6 64 Q 6 52 18 52 Z';
// Camada de espessura (shadow), deslocada 4px abaixo
const SHADOW_PATH =
  'M 18 56 L 150 56 L 188 88 L 188 166 Q 188 179 176 179 L 18 179 Q 6 179 6 166 L 6 68 Q 6 56 18 56 Z';

// Anel do ilhós como donut (r=14 fora, r=8 dentro)
const RING_PATH =
  'M 154 70 A 14 14 0 1 0 182 70 A 14 14 0 1 0 154 70 Z ' + HOLE_PATH;

const FlagBadge: React.FC<FlagBadgeProps> = ({ kind, size = 'md' }) => {
  const def = FLAGS[kind];
  const s = SIZE_PRESETS[size];
  const twoLines = def.lines.length === 2;

  const uid = React.useId();
  const shadowId = `tag-shadow-${uid}`;

  // Posicionamento vertical do bloco emoji + texto
  const emojiY = twoLines ? 88 : 97;
  const line1Y = twoLines ? 114 : 128;
  const line2Y = 134;

  return (
    <div
      className="pointer-events-none select-none"
      style={{ width: s.width }}
      aria-label={`${def.emoji} ${def.lines.join(' ')}`}
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

            {/* Camada de espessura com furo */}
            <path
              d={`${SHADOW_PATH} ${HOLE_PATH_SHADOW}`}
              fillRule="evenodd"
              fill={def.shadow}
            />

            {/* Corpo com furo transparente */}
            <path
              d={`${BODY_PATH} ${HOLE_PATH}`}
              fillRule="evenodd"
              fill={def.bg}
              filter={`url(#${shadowId})`}
            />

            {/* Anel do ilhós: donut cinza escuro 50% opaco */}
            <path
              d={RING_PATH}
              fillRule="evenodd"
              fill="#4B5563"
              opacity="0.5"
            />

            {/* Barbante (por cima do ilhós) */}
            <path
              d="M 168 70 C 184 52, 196 44, 204 42"
              stroke="#0E0E0E"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />

            {/* Pontinha do barbante — buraquinho de papel */}
            <circle cx="204" cy="42" r="7" fill="#4B5563" opacity="0.5" />
            <circle cx="204" cy="42" r="4" fill="#0E0E0E" />

            {/* Emoji */}
            <text
              x="94"
              y={emojiY}
              textAnchor="middle"
              fontSize="30"
              fill={def.text}
            >
              {def.emoji}
            </text>

            {/* Linha 1 do label */}
            <text
              x="94"
              y={line1Y}
              textAnchor="middle"
              fontFamily="'Inter', system-ui, sans-serif"
              fontWeight="700"
              fontSize="15"
              fill={def.text}
              letterSpacing="0.4"
            >
              {def.lines[0]}
            </text>

            {/* Linha 2 do label (só para lastUnits) */}
            {twoLines && (
              <text
                x="94"
                y={line2Y}
                textAnchor="middle"
                fontFamily="'Inter', system-ui, sans-serif"
                fontWeight="700"
                fontSize="15"
                fill={def.text}
                letterSpacing="0.4"
              >
                {def.lines[1]}
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
