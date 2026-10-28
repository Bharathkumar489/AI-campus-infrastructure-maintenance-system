import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  Building2, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle,
  Plus
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { RiskBadge } from '../../components/RiskBadge';
import { PriorityBadge } from '../../components/PriorityBadge';

export function MyRequests({ onSelectRequest, onNewRequest }) {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadMyRequests();
  }, [currentUser]);

  const loadMyRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getRequests({
        user_id: currentUser?.user_id,
        role: 'requester'
      });
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = requests.filter(r => {
    if (filterStatus === 'ACTIVE' && ['COMPLETED', 'VERIFIED', 'CLOSED'].includes(r.status)) return false;
    if (filterStatus === 'CLOSED' && !['COMPLETED', 'VERIFIED', 'CLOSED'].includes(r.status)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.asset_code && r.asset_code.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">My Requests</h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Track status of your submitted campus maintenance complaints and verify completed repairs.
          </p>
        </div>
        <button
          onClick={onNewRequest}
          className="apple-pill flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-full hover:bg-slate-800 transition shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Complaint
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="apple-card bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-80 bg-slate-50/80 border border-slate-200/80 rounded-full px-3.5 py-2 text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by title, room, asset code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100/70 p-1 rounded-full">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`apple-pill px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setFilterStatus('ACTIVE')}
            className={`apple-pill px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${filterStatus === 'ACTIVE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Active ({requests.filter(r => !['COMPLETED', 'VERIFIED', 'CLOSED'].includes(r.status)).length})
          </button>
          <button
            onClick={() => setFilterStatus('CLOSED')}
            className={`apple-pill px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${filterStatus === 'CLOSED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Resolved ({requests.filter(r => ['COMPLETED', 'VERIFIED', 'CLOSED'].includes(r.status)).length})
          </button>
          <button
            onClick={loadMyRequests}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-white transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading requests...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No requests found</h3>
          <p className="text-xs text-slate-400 mt-1">Submit a complaint when campus infrastructure needs repair.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(req => (
            <div
              key={req.request_id}
              onClick={() => onSelectRequest(req.request_id)}
              className="apple-card apple-card-hover bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                    {req.request_id}
                  </span>
                  <StatusBadge status={req.status} />
                  <PriorityBadge priorityLevel={req.priority_level} score={req.priority_score} />
                  <RiskBadge riskLevel={req.risk_level} probability={req.failure_probability} />
                </div>

                <h3 className="text-base font-semibold text-slate-900 pt-0.5">{req.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1 font-normal">{req.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" /> {req.location}
                  </span>
                  {req.asset_code && (
                    <span className="font-mono bg-slate-100/80 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                      Asset: {req.asset_code}
                    </span>
                  )}
                  <span>Submitted: {new Date(req.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                {req.status === 'COMPLETED' && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready for Verification
                  </span>
                )}
                <div className="apple-pill p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
