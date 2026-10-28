import React, { useState } from 'react';
import { Star, Award, ShieldCheck, ThumbsUp, CheckCircle, Trophy, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ReputationPill({ className = "" }) {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Derive points based on user role or stored points
  const points = currentUser?.reputation_points || 175;

  const getBadgeInfo = (pts) => {
    if (pts >= 300) return { label: 'Campus Legend', color: 'text-amber-500 bg-amber-50 border-amber-300', next: 'Max Level', remaining: 0 };
    if (pts >= 200) return { label: 'Campus Hero', color: 'text-purple-600 bg-purple-50 border-purple-300', next: 'Campus Legend', remaining: 300 - pts };
    if (pts >= 100) return { label: 'Campus Guardian', color: 'text-blue-600 bg-blue-50 border-blue-300', next: 'Campus Hero', remaining: 200 - pts };
    return { label: 'Active Citizen', color: 'text-emerald-600 bg-emerald-50 border-emerald-300', next: 'Campus Guardian', remaining: 100 - pts };
  };

  const badge = getBadgeInfo(points);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition shadow-xs cursor-pointer border ${badge.color} ${className}`}
        title="View Your Campus Reputation & Civic Points"
      >
        <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
        <span className="font-mono">{points}</span>
        <span className="text-[10px] uppercase font-extrabold tracking-wider hidden sm:inline">PTS</span>
        <span className="text-[10px] opacity-80 border-l border-current/30 pl-1.5 ml-0.5 hidden md:inline">
          {badge.label}
        </span>
      </button>

      {/* Gamification / Reputation Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 text-slate-800 animate-in zoom-in-95">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Campus Reputation Score</h3>
                  <p className="text-[11px] text-slate-500">Department of Computer Science & Business Systems</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Rank Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Your Rank</span>
                <div className="text-lg font-black text-blue-900 flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>{badge.label}</span>
                </div>
                <div className="text-xs text-blue-700 mt-0.5">
                  {currentUser?.name || 'Student / Campus Reporter'}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Points</span>
                <span className="text-2xl font-black text-blue-900 font-mono">{points}</span>
                <span className="text-xs font-bold text-blue-700 block">PTS</span>
              </div>
            </div>

            {/* Progress to next tier */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">Progress to {badge.next}</span>
                <span className="font-bold text-blue-600">{badge.remaining > 0 ? `${badge.remaining} PTS to go` : 'Max Tier Reached!'}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (points % 100))}%` }}
                ></div>
              </div>
            </div>

            {/* How to earn points (Matching CivicPulse reference) */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                How You Earn Campus Points:
              </span>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Report verified infrastructure defect</span>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">+20 PTS</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <ThumbsUp className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Upvote existing room complaint (Avoid Duplicates)</span>
                </div>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">+5 PTS</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Star className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Verify repair completion & rate technician</span>
                </div>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">+15 PTS</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Close & Keep Earning
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
