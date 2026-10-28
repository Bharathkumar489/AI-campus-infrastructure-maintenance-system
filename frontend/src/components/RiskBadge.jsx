import React from 'react';

export function RiskBadge({ riskLevel, probability }) {
  const level = (riskLevel || 'LOW').toUpperCase();
  const pct = probability !== undefined ? Math.round(probability * 100) : null;

  if (level === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-700 border border-rose-500/20 backdrop-blur-xs shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        <span>High Risk</span>
        {pct !== null && <span className="text-[10px] font-mono opacity-80">({pct}%)</span>}
      </span>
    );
  }

  if (level === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-800 border border-amber-500/20 backdrop-blur-xs shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>Elevated</span>
        {pct !== null && <span className="text-[10px] font-mono opacity-80">({pct}%)</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 backdrop-blur-xs shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      <span>Normal</span>
      {pct !== null && <span className="text-[10px] font-mono opacity-80">({pct}%)</span>}
    </span>
  );
}

export default RiskBadge;
