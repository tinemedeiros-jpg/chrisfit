import React from 'react';
import { Product } from '../types';

type FlagKind = 'new' | 'lastUnits' | 'bestSeller';

interface FlagDefinition {
  label: string;
  bg: string;
  shadow: string;
  text: string;
}

const FLAGS: Record<FlagKind, FlagDefinition> = {
  new: {
    label: 'NOVIDADE',
    bg: '#A862F0',
    shadow: '#7B3CC4',
    text: '#0E0E0E'
  },
  bestSeller: {
    label: '+VENDIDOS',
    bg: '#ED2A66',
    shadow: '#B81747',
    text: '#0E0E0E'
  },
  lastUnits: {
    label: 'ACABANDO',
    bg: '#F5BE1B',
    shadow: '#C49510',
    text: '#0E0E0E'
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

// Geometria fixa em coordenadas do viewBox (220 x 200). O rótulo gira -28°
// dentro do SVG; o componente externo só escala via `width`. Assim os
// proporções (furo, barbante, espessura) ficam idênticas em qualquer tamanho.
const VB_W = 220;
const VB_H = 200;

const FlagBadge: React.FC<FlagBadgeProps> = ({ kind, size = 'md' }) => {
  const def = FLAGS[kind];
  const s = SIZE_PRESETS[size];

  const uid = React.useId();
  const shadowId = `tag-shadow-${uid}`;

  return (
    <div
      className="pointer-events-none select-none"
      style={{ width: s.width }}
      aria-label={def.label}
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <filter
            id={shadowId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="3"
              floodColor="#000"
              floodOpacity="0.35"
            />
          </filter>
        </defs>

        {/* Conjunto inteiro (etiqueta + barbante) inclinado */}
        <g transform={`rotate(-28 ${VB_W / 2} ${VB_H / 2})`}>
          {/* Camada de espessura inferior (cor mais escura, aparece como
              tira na base). Idêntica ao corpo, deslocada +4px em y. */}
          <path
            d="M 24 56
               L 150 56
               L 188 88
               L 188 150
               Q 188 162 176 162
               L 24 162
               Q 12 162 12 150
               L 12 68
               Q 12 56 24 56 Z"
            fill={def.shadow}
          />
          {/* Corpo da etiqueta — pentágono com canto superior direito chanfrado */}
          <path
            d="M 24 52
               L 150 52
               L 188 84
               L 188 146
               Q 188 158 176 158
               L 24 158
               Q 12 158 12 146
               L 12 64
               Q 12 52 24 52 Z"
            fill={def.bg}
            filter={`url(#${shadowId})`}
          />

          {/* Anel cinza do furo (ilhós) */}
          <circle cx="168" cy="70" r="14" fill="#9CA3AF" />
          {/* Furo */}
          <circle cx="168" cy="70" r="8" fill="#FFFFFF" />

          {/* Barbante: arco preto saindo do furo pra cima/direita */}
          <path
            d="M 168 70 C 196 38, 215 26, 224 22"
            stroke="#0E0E0E"
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Pontinha (nozinho) do barbante */}
          <circle cx="224" cy="22" r="5" fill="#0E0E0E" />

          {/* Texto seguindo a inclinação da etiqueta */}
          <text
            x="96"
            y="118"
            textAnchor="middle"
            fontFamily="'Inter', system-ui, sans-serif"
            fontWeight="900"
            fontSize="26"
            fill={def.text}
            letterSpacing="1"
          >
            {def.label}
          </text>
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

  // Etiquetas inclinadas se sobrepõem mal — empilho com leve overlap vertical
  // (o barbante de uma fica atrás da próxima).
  const overlap = gap !== undefined ? -gap : -Math.round(SIZE_PRESETS[size].width * 0.18);

  return (
    <div
      className={`flex flex-col items-end pointer-events-none ${className ?? ''}`}
    >
      {active.map((kind, idx) => (
        <div key={kind} style={idx > 0 ? { marginTop: overlap } : undefined}>
          <FlagBadge kind={kind} size={size} />
        </div>
      ))}
    </div>
  );
};

export default FlagBadge;
