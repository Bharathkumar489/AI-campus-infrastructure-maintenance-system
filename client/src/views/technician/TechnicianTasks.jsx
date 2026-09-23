import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  CheckCircle, 
  Clock, 
  Building2, 
  Camera, 
  Upload, 
  AlertTriangle, 
  Send,
  RefreshCw,
  Eye
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Modal } from '../../components/Modal';

export function TechnicianTasks({ onSelectRequest }) {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Completion Evidence Modal state
  const [completingTask, setCompletingTask] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [currentUser]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getRequests({
        user_id: currentUser?.user_id,
        role: 'technician'
      });
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (assignmentId, action) => {
    try {
      await api.assignmentAction(assignmentId, action);
      loadTasks();
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    if (!completingTask) return;
    setSubmittingEvidence(true);
    try {
      const formData = new FormData();
      formData.append('remarks', remarks);
      formData.append('parts_replaced', partsReplaced);
      if (evidenceFile) {
        formData.append('evidence', evidenceFile);
      }

      await api.submitCompletionEvidence(completingTask.request_id, formData);
      alert('Repair completed and evidence submitted for requester verification!');
      setCompletingTask(null);
      setRemarks('');
      setPartsReplaced('');
      setEvidenceFile(null);
      setEvidencePreview(null);
      loadTasks();
    } catch (err) {
      alert('Failed to submit evidence: ' + err.message);
    } finally {
      setSubmittingEvidence(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4" /> Technician Operations Workbench
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Assigned Work Orders — {currentUser?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept dispatches, initiate on-site repairs, and submit completion proof.
          </p>
        </div>

        <button
          onClick={loadTasks}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
        </button>
      </div>

      {/* Task Cards List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading assigned orders...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">All Work Orders Cleared!</h3>
          <p className="text-xs text-slate-500">No active maintenance tasks are currently queued for your specialization.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => {
            const isAssigned = task.status === 'ASSIGNED';
            const isAccepted = task.status === 'ACCEPTED';
            const isInProgress = task.status === 'IN PROGRESS';
            const isDone = ['COMPLETED', 'VERIFIED', 'CLOSED'].includes(task.status);

            return (
              <div
                key={task.request_id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {task.request_id}
                      </span>
                      <StatusBadge status={task.status} />
                      <PriorityBadge priorityLevel={task.priority_level} score={task.priority_score} />
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Category: {task.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 pt-1">{task.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" /> {task.location}
                      </span>
                      {task.asset_code && (
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                          Asset Code: {task.asset_code}
                        </span>
                      )}
                      <span>Reported by: <strong>{task.requester_name || 'Requester'}</strong></span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    {isAssigned && (
                      <button
                        onClick={() => handleAction(task.assignment_id, 'accept')}
                        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                      >
                        Accept Work Order
                      </button>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => handleAction(task.assignment_id, 'start')}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                      >
                        Begin Work (On-Site)
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => setCompletingTask(task)}
                        className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Complete & Submit Evidence
                      </button>
                    )}

                    {isDone && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Work Finished
                      </span>
                    )}

                    <button
                      onClick={() => onSelectRequest(task.request_id)}
                      className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold"
                    >
                      View Ticket Details
                    </button>
                  </div>
                </div>

                {/* Dispatch Remarks */}
                {task.technician_remarks && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                    <strong className="text-slate-700">Supervisor Remarks:</strong> {task.technician_remarks}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Evidence Modal */}
      {completingTask && (
        <Modal isOpen={true} onClose={() => setCompletingTask(null)} title="Submit Repair Completion Evidence">
          <form onSubmit={handleEvidenceSubmit} className="space-y-4">
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs">
              <span className="font-bold text-blue-900 block">Ticket: {completingTask.title}</span>
              <span className="text-blue-700">{completingTask.location} • Asset: {completingTask.asset_code || 'N/A'}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Technician Repair Remarks *
              </label>
              <textarea
                rows="3"
                required
                placeholder="Describe actions taken: parts serviced, system tested, nominal operating levels verified..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Parts or Consumables Replaced
              </label>
              <input
                type="text"
                placeholder="e.g. Capacitor 45uF, 1.2kg R32 Refrigerant, Flare brass nut..."
                value={partsReplaced}
                onChange={(e) => setPartsReplaced(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Upload Proof / Verification Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setEvidenceFile(file);
                    setEvidencePreview(URL.createObjectURL(file));
                  }
                }}
                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {evidencePreview && (
                <div className="mt-2 w-32 h-24 rounded-xl overflow-hidden border">
                  <img src={evidencePreview} alt="Evidence" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCompletingTask(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingEvidence}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-sm transition"
              >
                <CheckCircle className="w-4 h-4" />
                {submittingEvidence ? 'Submitting...' : 'Complete Task'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
