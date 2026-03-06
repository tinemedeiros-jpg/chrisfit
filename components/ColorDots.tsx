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
      {colors.slice(0, 6).map((color) => (
        <button
          key={color}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelectColor?.(color);
          }}
          disabled={disabledSet.has(normalizeColor(color))}
          className={`h-3 w-3 rounded-full border shadow transition-all ${
            normalizedSelected === normalizeColor(color)
              ? 'border-white ring-2 ring-white/80 scale-110'
              : 'border-white/70'
          } ${
            isInteractive
              ? 'cursor-pointer hover:scale-110'
              : 'cursor-default'
          } ${disabledSet.has(normalizeColor(color)) ? 'opacity-30 cursor-not-allowed' : ''}`}
          style={{ backgroundColor: color }}
          title={color}
          aria-label={`Selecionar cor ${color}`}
          aria-pressed={normalizedSelected === normalizeColor(color)}
        />
      ))}
    </div>
  );
};

export default ColorDots;
