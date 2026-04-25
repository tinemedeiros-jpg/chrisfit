import React from 'react';
import { Sparkles, Flame, Heart } from 'lucide-react';
import { Product } from '../types';

type FlagKind = 'new' | 'lastUnits' | 'bestSeller';

interface FlagDefinition {
  label: string;
  bg: string;
  fold: string;
  text: string;
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number; fill?: string }>;
}

const FLAGS: Record<FlagKind, FlagDefinition> = {
  new: {
    label: 'Novo',
    bg: '#A8266F',
    fold: '#7A1A50',
    text: '#FFFFFF',
    Icon: Sparkles
  },
  bestSeller: {
    label: 'Mais vendido',
    bg: '#D63757',
    fold: '#A82036',
    text: '#FFFFFF',
    Icon: Flame
  },
  lastUnits: {
    label: 'Últimas unidades',
    bg: '#F2C53E',
    fold: '#C9A21F',
    text: '#3A2A00',
    Icon: Heart
  }
};

const SIZE_PRESETS = {
  sm: {
    width: 56,
    strapWidth: 12,
    strapHeight: 14,
    paddingX: 5,
    paddingY: 7,
    notch: 18,
    iconSize: 10,
    fontSize: 7,
    gap: 3
  },
  md: {
    width: 74,
    strapWidth: 16,
    strapHeight: 20,
    paddingX: 7,
    paddingY: 9,
    notch: 24,
    iconSize: 12,
    fontSize: 8.5,
    gap: 4
  },
  lg: {
    width: 92,
    strapWidth: 20,
    strapHeight: 26,
    paddingX: 9,
    paddingY: 11,
    notch: 30,
    iconSize: 14,
    fontSize: 10,
    gap: 5
  }
};

type FlagSize = keyof typeof SIZE_PRESETS;

interface FlagBadgeProps {
  kind: FlagKind;
  size?: FlagSize;
}

const FlagBadge: React.FC<FlagBadgeProps> = ({ kind, size = 'md' }) => {
  const def = FLAGS[kind];
  const s = SIZE_PRESETS[size];
  const { Icon } = def;

  return (
    <div
      className="relative pointer-events-none select-none"
      style={{
        width: s.width,
        filter:
          'drop-shadow(0 4px 4px rgba(0,0,0,0.32)) drop-shadow(0 10px 14px rgba(0,0,0,0.22))'
      }}
      aria-label={def.label}
    >
      {/* Tirinha/strap fino sobre o card, com topo arredondado */}
      <div
        className="absolute left-1/2"
        style={{
          width: s.strapWidth,
          height: s.strapHeight,
          top: -s.strapHeight,
          transform: 'translateX(-50%)',
          backgroundColor: def.fold,
          borderTopLeftRadius: s.strapWidth / 2,
          borderTopRightRadius: s.strapWidth / 2,
          boxShadow:
            'inset 0 -2px 3px rgba(0,0,0,0.18), inset 0 2px 0 rgba(255,255,255,0.12)'
        }}
      />

      {/* Corpo do marcador em forma de pingente, com V-notch profundo embaixo */}
      <div
        className="relative"
        style={{
          backgroundColor: def.bg,
          paddingTop: s.paddingY,
          paddingBottom: s.paddingY + s.notch,
          paddingLeft: s.paddingX,
          paddingRight: s.paddingX,
          clipPath: `polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - ${s.notch}px), 0 100%)`
        }}
      >
        {/* Sombrinha sutil no topo, simulando o vinco onde a tirinha encosta */}
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{
            height: 6,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.28), rgba(0,0,0,0))'
          }}
        />
        <div
          className="flex flex-col items-center justify-center"
          style={{ gap: s.gap, color: def.text }}
        >
          <Icon size={s.iconSize} strokeWidth={2.2} fill={def.text} className="opacity-95" />
          <span
            className="text-center leading-tight font-bold uppercase"
            style={{
              fontSize: s.fontSize,
              letterSpacing: '0.04em',
              color: def.text
            }}
          >
            {def.label}
          </span>
        </div>
      </div>
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
  const s = SIZE_PRESETS[size];
  // Encaixe: o próximo marcador sobe pra que sua tirinha fique dentro do
  // V-notch do anterior, formando um cascateado de pingentes.
  const overlap =
    gap !== undefined
      ? -gap
      : -(s.notch + s.strapHeight - Math.round(s.strapHeight / 2));

  return (
    <div
      className={`flex flex-col items-center pointer-events-none ${className ?? ''}`}
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
