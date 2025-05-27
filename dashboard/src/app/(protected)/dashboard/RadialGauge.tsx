import React from "react";

interface RadialGaugeProps {
  value: number; // percentage (0-100)
  size?: number;
}

function getGaugeColor(percent: number): string {
  if (isNaN(percent)) return '#bbb';
  // Red (0%) to Yellow (50%) to Green (100%)
  // 0%: #ef4444, 50%: #facc15, 100%: #22c55e
  if (percent <= 50) {
    // Interpolate red to yellow
    const ratio = percent / 50;
    const r = Math.round(239 + (250 - 239) * ratio); // 239 to 250
    const g = Math.round(68 + (204 - 68) * ratio);   // 68 to 204
    const b = Math.round(68 + (21 - 68) * ratio);    // 68 to 21
    return `rgb(${r},${g},${b})`;
  } else {
    // Interpolate yellow to green
    const ratio = (percent - 50) / 50;
    const r = Math.round(250 + (34 - 250) * ratio);  // 250 to 34
    const g = Math.round(204 + (197 - 204) * ratio); // 204 to 197
    const b = Math.round(21 + (94 - 21) * ratio);    // 21 to 94
    return `rgb(${r},${g},${b})`;
  }
}

const RadialGauge: React.FC<RadialGaugeProps> = ({ value, size = 140 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - (isNaN(value) ? 0 : value / 100));

  return (
    <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <filter id="gauge-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#bbb" floodOpacity="0.5" />
        </filter>
      </defs>
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#eee"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getGaugeColor(value)}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        filter="url(#gauge-shadow)"
        style={{ transition: "stroke-dashoffset 0.6s" }}
      />
      {/* Center percent or placeholder */}
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={isNaN(value) ? size * 0.16 : size * 0.28}
        fill="#222"
        fontWeight="bold"
      >
        {isNaN(value) ? "Sin datos" : `${value}`}
      </text>
    </svg>
  );
};

export default RadialGauge;
