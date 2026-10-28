import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Flame, 
  Users, 
  BarChart3, 
  ChevronRight, 
  ArrowUpRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { RiskBadge } from '../../components/RiskBadge';
import { PriorityBadge } from '../../components/PriorityBadge';

export function AdminDashboard({ onNavigate, onSelectRequest, onSelectAsset }) {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [highRiskAssets, setHighRiskAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [sum, ch, high] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getAnalyticsCharts(),
        api.getHighRiskAssets()
      ]);
      setSummary(sum);
      setCharts(ch);
      setHighRiskAssets(high);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading maintenance operations telemetry...</div>;
  }

  const kpis = summary?.kpis || {};

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" /> Operational Intelligence Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Facilities Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time monitoring of campus assets, AI failure risk bands, priority queues, and technician workload.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboard}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
          <button
            onClick={() => onNavigate('request_queue')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-sm transition cursor-pointer"
          >
            Request Queue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (Section 39) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Tickets</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.total_requests || 0}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Campus demand</span>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Action</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{kpis.pending_requests || 0}</div>
          <span className="text-[10px] text-amber-700/80 mt-1 block">Needs review/dispatch</span>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <Wrench className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">{kpis.in_progress_requests || 0}</div>
          <span className="text-[10px] text-purple-700/80 mt-1 block">Active on-site repairs</span>
        </div>

        {/* Critical Priority */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-300 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical Priority</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{kpis.critical_priority_requests || 0}</div>
          <span className="text-[10px] text-rose-700/80 mt-1 block">&lt;2h target SLA</span>
        </div>

        {/* High-Risk Assets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-300 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">High-Risk Assets</span>
            <Sparkles className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{kpis.high_risk_assets || 0}</div>
          <span className="text-[10px] text-rose-700/80 mt-1 block">AI Failure Prob &gt;70%</span>
        </div>

        {/* Completed & Verified */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{kpis.completed_requests || 0}</div>
          <span className="text-[10px] text-emerald-700/80 mt-1 block">{kpis.first_time_resolution_rate}% 1st-time fix</span>
        </div>

      </div>

      {/* High-Risk Assets Alert Card (Section 25 - Predictive Failure Watchlist) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Predictive Maintenance Watchlist</h3>
              <p className="text-xs text-slate-500">
                Assets flagged by CampusCare AI predictive telemetry with high probability of failure within 30 days.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('asset_management')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Manage All Assets <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Asset Code</th>
                <th className="py-3 px-4">Equipment Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Age / Days Since Service</th>
                <th className="py-3 px-4">Past Failures</th>
                <th className="py-3 px-4">30-Day Failure Risk</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {highRiskAssets.slice(0, 5).map(asset => (
                <tr key={asset.asset_id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{asset.asset_code}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{asset.asset_name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{asset.building} • {asset.location}</td>
                  <td className="py-3.5 px-4">{asset.age_years} yrs • {asset.days_since_maintenance}d ago</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">
                      {asset.previous_failures} failures
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge riskLevel={asset.prediction?.risk_level} probability={asset.prediction?.failure_probability} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectAsset(asset.asset_id)}
                      className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Inspect History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" /> Maintenance Demand by Category
          </h3>
          <p className="text-xs text-slate-400 mb-6">Distribution of open and completed complaints across systems</p>
          
          <div className="space-y-3">
            {charts?.by_category?.map((cat, idx) => {
              const total = kpis.total_requests || 1;
              const pct = Math.round((cat.count / total) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat.name}</span>
                    <span className="font-mono text-slate-500">{cat.count} tickets ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(12, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technician Workload Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" /> Technician Workload & Availability
            </h3>
            <button
              onClick={() => onNavigate('technicians')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Staff Roster
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-6">Active repair allocations and technician availability states</p>

          <div className="space-y-3">
            {charts?.technician_workload?.map((tech, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shadow-sm">
                    {tech.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{tech.name}</h4>
                    <p className="text-[11px] text-slate-500">{tech.skill} • ★ {tech.rating}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tech.availability === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {tech.availability}
                  </span>
                  <span className="text-xs font-mono font-bold bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700">
                    {tech.workload} task(s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
