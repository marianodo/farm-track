import React from 'react';

interface TooltipVariationProps {
  value: number;
  showSign?: boolean;
}

/**
 * A component that displays a variation percentage with a tooltip explaining what it means
 */
export default function TooltipVariation({ value, showSign = true }: TooltipVariationProps) {
  const arrow = value >= 0 ? '↑' : '↓';
  const sign = showSign && value > 0 ? '+' : '';
  const color = value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-500';
  const absValue = Math.abs(value);

  return (
    <span 
      className={`${color} cursor-help relative group`}
      title="Variación respecto al reporte anterior"
    >
      ({arrow} {sign}{absValue}%)
      <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 w-60 bg-gray-800 text-white text-xs rounded py-1 px-2 mb-1 z-50">
        Variación de salud respecto al reporte anterior ({value > 0 ? 'mejora' : 'disminución'})
      </span>
    </span>
  );
}
