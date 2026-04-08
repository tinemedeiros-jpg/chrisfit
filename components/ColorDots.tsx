import React from 'react';

interface ColorDotsProps {
  colors?: string[];
  className?: string;
  selectedColor?: string | null;
  onSelectColor?: (color: string) => void;
  disabledColors?: string[];
  absolute?: boolean;
}

const normalizeColor = (color: string) => color.trim().toLowerCase();

const ColorDots: React.FC<ColorDotsProps> = ({
  colors = [],
  className = '',
  selectedColor,
  onSelectColor,
  disabledColors = [],
  absolute = true
}) => {
  if (!colors.length) return null;

  const normalizedSelected = selectedColor ? normalizeColor(selectedColor) : null;
  const disabledSet = new Set(disabledColors.map(normalizeColor));
  const isInteractive = Boolean(onSelectColor);
  const positionClass = absolute ? 'absolute bottom-3 right-3' : '';

  return (
    <div className={`${positionClass} z-20 flex items-center gap-1.5 ${className}`}>
      {colors.slice(0, 6).map((color) => {
        const isDisabled = disabledSet.has(normalizeColor(color));
        return (
          <button
            key={color}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelectColor?.(color);
            }}
            disabled={isDisabled}
            className={`relative h-3 w-3 rounded-full border shadow transition-all group/dot ${
              normalizedSelected === normalizeColor(color)
                ? 'border-white ring-2 ring-white/80 scale-110'
                : 'border-white/70'
            } ${
              isInteractive && !isDisabled
                ? 'cursor-pointer hover:scale-110'
                : isDisabled
                ? 'cursor-not-allowed'
                : 'cursor-default'
            }`}
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`Selecionar cor ${color}`}
            aria-pressed={normalizedSelected === normalizeColor(color)}
          >
            {isDisabled && (
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-red-500 border border-white opacity-0 group-hover/dot:opacity-100 transition-opacity" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ColorDots;
