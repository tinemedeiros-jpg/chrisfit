import React from 'react';

interface PriceTextProps {
  value: number;
  integerClassName?: string;
  decimalsClassName?: string;
  className?: string;
}

export const formatPriceParts = (value: number) => {
  const [integerPart, decimalPart = '00'] = value
    .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split(',');

  return { integerPart, decimalPart };
};

const PriceText: React.FC<PriceTextProps> = ({
  value,
  integerClassName,
  decimalsClassName,
  className
}) => {
  const { integerPart, decimalPart } = formatPriceParts(value);

  return (
    <span className={`inline-flex items-start ${className ?? ''}`.trim()}>
      <span className={integerClassName}>{integerPart}</span>
      <span className={`leading-none ${decimalsClassName ?? ''}`.trim()}>,{decimalPart}</span>
    </span>
  );
};

export default PriceText;
