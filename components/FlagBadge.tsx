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
    width: 64,
    foldWidth: 22,
    foldHeight: 8,
    paddingX: 8,
    paddingY: 6,
    notch: 8,
    iconSize: 10,
    fontSize: 8,
    gap: 4
  },
  md: {
    width: 86,
    foldWidth: 28,
    foldHeight: 10,
    paddingX: 10,
    paddingY: 8,
    notch: 10,
    iconSize: 12,
    fontSize: 9,
    gap: 5
  },
  lg: {
    width: 104,
    foldWidth: 34,
    foldHeight: 12,
    paddingX: 12,
    paddingY: 9,
    notch: 12,
    iconSize: 14,
    fontSize: 10,
    gap: 6
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
      {/* Voltinha: small darker tab acting as the fold-back coming from behind the card */}
      <div
        className="absolute left-1/2"
        style={{
          width: s.foldWidth,
          height: s.foldHeight,
          top: -Math.round(s.foldHeight * 0.6),
          transform: 'translateX(-50%) skewX(-6deg)',
          backgroundColor: def.fold,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.18)'
        }}
      />

      {/* Main flag body with festa-junina V-notch at the bottom */}
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
        {/* Subtle inner shadow at top to suggest the curl/fold */}
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{
            height: Math.round(s.foldHeight * 0.9),
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0))'
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
  // Negative overlap so the next badge's top tab tucks INTO the previous V-notch.
  // We pull the next badge up by the notch depth plus a small bias so the tab
  // sits visibly inside the chevron cut-out, like nested bookmarks.
  const overlap = gap !== undefined ? -gap : -(s.notch + Math.round(s.foldHeight * 0.4));

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
