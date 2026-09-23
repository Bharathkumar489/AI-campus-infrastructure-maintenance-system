import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wrench, 
  Check, 
  UserCheck, 
  Star, 
  Briefcase, 
  AlertCircle,
  Phone
} from 'lucide-react';
import { api } from '../../services/api';
import { Modal } from '../../components/Modal';

export function TechnicianAssignModal({ requestId, onClose, onSuccess }) {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadRecommendation();
  }, [requestId]);

  const loadRecommendation = async () => {
    setLoading(true);
    try {
      const data = await api.recommendTechnicians(requestId);
      setRecommendation(data);
      if (data.recommended_technician) {
        setSelectedTechId(data.recommended_technician.technician_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTechId) {
      alert('Please select a technician');
      return;
    }
    setAssigning(true);
    try {
      await api.assignTechnician(requestId, selectedTechId, remarks);
      alert('Technician assigned successfully!');
      if (onSuccess) onSuccess();
    } catch (err) {
      alert('Assignment failed: ' + err.message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Smart Technician Assignment & Dispatch">
      <div className="space-y-6">
        
        {/* Header telemetry */}
        {recommendation && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase text-[10px] block">Problem Category:</span>
              <span className="text-sm font-black text-blue-900">{recommendation.problem_category}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase text-[10px] block">Required Technical Skill:</span>
              <span className="text-sm font-black text-indigo-900">{recommendation.required_skill}</span>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Section 29 Match Engine
              </span>
            </div>
          </div>
        )}

        {/* Technician Candidates List */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Ranked Eligible Technicians (Sorted by Match Score & Lowest Workload)
          </h4>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Evaluating technician database...</div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {recommendation?.candidates?.map(tech => {
                const isSelected = selectedTechId === tech.technician_id;
                const isTopMatch = recommendation.recommended_technician?.technician_id === tech.technician_id;

                return (
                  <div
                    key={tech.technician_id}
                    onClick={() => setSelectedTechId(tech.technician_id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tech.name.split(' ').map(n => n[0]).join('')}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-slate-900">{tech.name}</h5>
                          {isTopMatch && (
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> AI Top Pick
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {tech.skill} • {tech.contact} • ★ {tech.rating}
                        </p>
                        <p className="text-[11px] text-blue-700 mt-1 font-medium italic">
                          {tech.match_reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tech.availability === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {tech.availability}
                        </span>
                        <span className="text-xs font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                          {tech.workload} active task(s)
                        </span>
                      </div>
                      <div className="text-xs font-mono font-black text-slate-800">
                        Score: <span className="text-blue-600">{tech.match_score}</span>/100
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dispatch Remarks */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Assignment Dispatch Remarks (Sent to Technician)
          </label>
          <input
            type="text"
            placeholder="e.g. High priority laboratory unit, inspect refrigerant pressure and blower motor..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={assigning || !selectedTechId}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            {assigning ? 'Dispatching...' : 'Confirm Assignment & Notify Technician'}
          </button>
        </div>

      </div>
    </Modal>
  );
}
