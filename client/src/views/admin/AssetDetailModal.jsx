import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  Sparkles, 
  Plus,
  Zap
} from 'lucide-react';
import { api } from '../../services/api';
import { Modal } from '../../components/Modal';
import { RiskBadge } from '../../components/RiskBadge';

export function AssetDetailModal({ assetId, onClose, onReportIssue }) {
  const [assetData, setAssetData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAsset();
  }, [assetId]);

  const loadAsset = async () => {
    setLoading(true);
    try {
      const data = await api.getAsset(assetId);
      setAssetData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!assetId) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title="Campus Infrastructure Asset Details" maxWidth="max-w-4xl">
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading asset telemetry and maintenance history...</div>
      ) : !assetData ? (
        <div className="p-12 text-center text-slate-400">Asset record not found</div>
      ) : (
        <div className="space-y-6">
          
          {/* Header Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md">
                    {assetData.asset_code}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    {assetData.asset_type}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    assetData.criticality === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {assetData.criticality} Criticality
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-2">{assetData.asset_name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> {assetData.building} • {assetData.location}
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <RiskBadge 
                  riskLevel={assetData.prediction?.risk_level} 
                  probability={assetData.prediction?.failure_probability} 
                />
                <span className="text-[11px] text-slate-500">
                  Status: <strong className="text-slate-800">{assetData.status}</strong>
                </span>
              </div>
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Asset Age</span>
                <span className="text-sm font-bold text-slate-800">{assetData.age_years} years</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Installed {assetData.installation_date}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Maintenance</span>
                <span className="text-sm font-bold text-slate-800">{assetData.days_since_maintenance}d ago</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{assetData.last_maintenance}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Duty Cycle</span>
                <span className="text-sm font-bold text-slate-800">{assetData.usage_hours_day} hrs/day</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Operational wear rate</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Failure History</span>
                <span className="text-sm font-bold text-slate-800">{assetData.previous_failures} failures</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Over asset lifecycle</span>
              </div>
            </div>
          </div>

          {/* AI Explainable Risk Diagnostics (Section 24-25) */}
          {assetData.prediction && (
            <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-800/60">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-200">
                    CampusCare AI Failure Risk Forecast
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {assetData.prediction.failure_percentage}% Probability
                </span>
              </div>

              <p className="text-xs text-indigo-100">
                <strong>Recommended Action:</strong> {assetData.prediction.suggested_action}
              </p>

              {assetData.prediction.feature_signals?.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                    Telemetry Indicators Impacting Risk:
                  </span>
                  {assetData.prediction.feature_signals.map((sig, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-white/10 px-3 py-1.5 rounded-lg">
                      <span className="font-semibold text-slate-200">{sig.feature}: {sig.value}</span>
                      <span className="text-[11px] text-amber-300 font-mono">{sig.contribution}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Historical Maintenance Records (Section 17 & Table 6) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-600" /> Asset Maintenance History ({assetData.history?.length || 0} events)
              </h4>
            </div>

            {assetData.history?.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                No past repair records on file for this asset.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {assetData.history?.map((h) => (
                  <div key={h.history_id} className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1 hover:border-slate-300 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{h.event_type}</span>
                      <span className="text-[10px] text-slate-400">{new Date(h.event_date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600">{h.remarks}</p>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                      {h.technician_name && <span>Tech: <strong className="text-slate-700">{h.technician_name}</strong></span>}
                      {h.parts_replaced && <span>Parts: <span className="font-mono text-slate-700">{h.parts_replaced}</span></span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onReportIssue) onReportIssue(assetData.asset_code);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Report Issue for this Asset
            </button>
          </div>

        </div>
      )}
    </Modal>
  );
}
