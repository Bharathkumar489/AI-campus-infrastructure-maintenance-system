import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Wrench, 
  Phone, 
  Mail, 
  Star, 
  CheckCircle, 
  Clock, 
  Briefcase,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

export function TechnicianManagement() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    setLoading(true);
    try {
      const data = await api.getTechnicians();
      setTechnicians(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (techId, newStatus) => {
    try {
      await api.updateTechnicianAvailability(techId, newStatus);
      setTechnicians(prev => prev.map(t => t.technician_id === techId ? { ...t, availability: newStatus } : t));
    } catch (err) {
      alert('Failed to update availability: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Maintenance Personnel Roster</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage field technicians, trade specializations, on-duty availability, and live dispatch workload.
          </p>
        </div>
        <button
          onClick={loadTechnicians}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Roster
        </button>
      </div>

      {/* Technicians Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading technician staff...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map(t => (
            <div
              key={t.technician_id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      ID: {t.technician_id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{t.rating || 4.8}</span>
                </div>
              </div>

              {/* Specializations */}
              <div className="space-y-1 text-xs">
                <div className="text-slate-500">
                  Primary Trade: <strong className="text-slate-800">{t.skill}</strong>
                </div>
                {t.secondary_skills && (
                  <div className="text-slate-500">
                    Cross-Skills: <span className="text-slate-700">{t.secondary_skills}</span>
                  </div>
                )}
                <div className="text-slate-500 flex items-center gap-1.5 pt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {t.contact}
                </div>
              </div>

              {/* Status & Workload Box */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active Tasks
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {t.workload} {t.workload === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                {/* Availability State Toggle */}
                <div className="flex items-center gap-1">
                  <select
                    value={t.availability}
                    onChange={(e) => handleStatusChange(t.technician_id, e.target.value)}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer ${
                      t.availability === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                      t.availability === 'Busy' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                      'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
