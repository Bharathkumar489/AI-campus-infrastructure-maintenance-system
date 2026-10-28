import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  UserPlus, 
  Eye, 
  Building2, 
  Clock, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { RiskBadge } from '../../components/RiskBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { TechnicianAssignModal } from './TechnicianAssignModal';

export function RequestQueue({ onSelectRequest, initialFilter = {} }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  // Assignment Modal
  const [assigningRequestId, setAssigningRequestId] = useState(null);

  useEffect(() => {
    loadRequests();
  }, [statusFilter, categoryFilter, priorityFilter, riskFilter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getRequests({
        status: statusFilter,
        category: categoryFilter,
        priority_level: priorityFilter,
        risk_level: riskFilter
      });
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = requests.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      (r.asset_code && r.asset_code.toLowerCase().includes(q)) ||
      (r.requester_name && r.requester_name.toLowerCase().includes(q)) ||
      r.request_id.toLowerCase().includes(q)
    );
  });

  const handleQuickStatusChange = async (requestId, newStatus) => {
    try {
      await api.updateRequestStatus(requestId, newStatus, `Updated by Admin`);
      loadRequests();
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Maintenance Request Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Triage, inspect AI predictions, calculate priorities, and dispatch technicians.
          </p>
        </div>
        <button
          onClick={loadRequests}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 transition shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="flex items-center gap-2 flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search request ID, asset, room, requester..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-slate-800"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">All Risk Bands</option>
            <option value="HIGH">High Risk (70-100%)</option>
            <option value="MEDIUM">Medium Risk (40-69%)</option>
            <option value="LOW">Low Risk (0-39%)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">All Categories</option>
            <option value="HVAC">HVAC</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Civil">Civil</option>
            <option value="Furniture">Furniture</option>
            <option value="Security/CCTV">Security/CCTV</option>
          </select>

        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading queue...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No maintenance requests match current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Complaint Title / Asset</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">AI Failure Risk</th>
                  <th className="py-3.5 px-4">Priority Score</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Tech</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map(req => (
                  <tr key={req.request_id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {req.request_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {req.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {req.asset_code ? (
                          <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded mr-1">
                            {req.asset_code}
                          </span>
                        ) : null}
                        <span>by {req.requester_name || 'Requester'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {req.location}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge riskLevel={req.risk_level} probability={req.failure_probability} />
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priorityLevel={req.priority_level} score={req.priority_score} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      {req.technician_name ? (
                        <div className="font-bold text-slate-800">{req.technician_name}</div>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => onSelectRequest(req.request_id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                      <button
                        onClick={() => setAssigningRequestId(req.request_id)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1 shadow-sm"
                        title="Assign Technician"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Technician Assignment Modal */}
      {assigningRequestId && (
        <TechnicianAssignModal
          requestId={assigningRequestId}
          onClose={() => setAssigningRequestId(null)}
          onSuccess={() => {
            setAssigningRequestId(null);
            loadRequests();
          }}
        />
      )}

    </div>
  );
}
