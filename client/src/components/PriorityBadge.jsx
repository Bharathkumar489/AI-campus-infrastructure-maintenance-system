import React from 'react';

export function PriorityBadge({ priorityLevel, score }) {
  const level = (priorityLevel || 'LOW').toUpperCase();

  if (level === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-700 border border-rose-500/20 backdrop-blur-xs shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
        <span>Critical</span>
        {score !== undefined && <span className="text-[10px] font-mono opacity-80">({score})</span>}
      </span>
    );
  }

  if (level === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-800 border border-amber-500/20 backdrop-blur-xs shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>High Priority</span>
        {score !== undefined && <span className="text-[10px] font-mono opacity-80">({score})</span>}
      </span>
    );
  }

  if (level === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20 backdrop-blur-xs shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        <span>Medium</span>
        {score !== undefined && <span className="text-[10px] font-mono opacity-80">({score})</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-500/10 text-slate-600 border border-slate-500/20 backdrop-blur-xs shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      <span>Routine</span>
      {score !== undefined && <span className="text-[10px] font-mono opacity-80">({score})</span>}
    </span>
  );
}

export default PriorityBadge;
