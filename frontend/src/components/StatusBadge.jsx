import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Wrench, 
  UserCheck, 
  ShieldCheck, 
  XCircle 
} from 'lucide-react';

export function StatusBadge({ status }) {
  const map = {
    'SUBMITTED': { bg: 'bg-blue-500/10 text-blue-700 border-blue-500/20', dot: 'bg-blue-500', icon: Clock, label: 'Submitted' },
    'UNDER REVIEW': { bg: 'bg-amber-500/10 text-amber-700 border-amber-500/20', dot: 'bg-amber-500', icon: AlertCircle, label: 'Under Review' },
    'ASSIGNED': { bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20', dot: 'bg-indigo-500', icon: UserCheck, label: 'Assigned' },
    'ACCEPTED': { bg: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20', dot: 'bg-cyan-500', icon: UserCheck, label: 'Accepted' },
    'IN PROGRESS': { bg: 'bg-purple-500/10 text-purple-700 border-purple-500/20', dot: 'bg-purple-500 animate-pulse', icon: Wrench, label: 'In Progress' },
    'COMPLETED': { bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', dot: 'bg-emerald-500', icon: CheckCircle, label: 'Completed' },
    'VERIFIED': { bg: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25', dot: 'bg-emerald-600', icon: ShieldCheck, label: 'Verified & Closed' },
    'CLOSED': { bg: 'bg-slate-500/10 text-slate-700 border-slate-500/20', dot: 'bg-slate-400', icon: ShieldCheck, label: 'Closed' },
    'REJECTED': { bg: 'bg-rose-500/10 text-rose-700 border-rose-500/20', dot: 'bg-rose-500', icon: XCircle, label: 'Rejected' }
  };

  const key = (status || '').toUpperCase();
  const current = map[key] || { bg: 'bg-slate-500/10 text-slate-700 border-slate-500/20', dot: 'bg-slate-400', icon: Clock, label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-xs shadow-2xs ${current.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      {current.label}
    </span>
  );
}

export default StatusBadge;
