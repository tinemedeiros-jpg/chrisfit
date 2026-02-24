import React from 'react';

interface ColorDotsProps {
  colors?: string[];
  className?: string;
}

const ColorDots: React.FC<ColorDotsProps> = ({ colors = [], className = '' }) => {
  if (!colors.length) return null;

  return (
    <div className={`absolute bottom-3 right-3 z-20 flex items-center gap-1.5 ${className}`}>
      {colors.slice(0, 6).map((color) => (
        <span
          key={color}
          className="h-3 w-3 rounded-full border border-white/70 shadow"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
};

export default ColorDots;
