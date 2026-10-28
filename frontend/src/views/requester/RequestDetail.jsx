import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Building2, 
  Wrench, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  Star, 
  Send,
  Package
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { RiskBadge } from '../../components/RiskBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { AILogo } from '../../components/AILogo';
import { getEquipmentRequirements } from '../../services/equipmentRequirements';

const LIFECYCLE_STEPS = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER REVIEW', label: 'Under Review' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'VERIFIED', label: 'Verified' },
  { key: 'CLOSED', label: 'Closed' }
];

export function RequestDetail({ requestId, onBack, onStatusUpdated }) {
  const { currentUser } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    setLoading(true);
    try {
      const data = await api.getRequest(requestId);
      setRequest(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await api.submitFeedback(requestId, currentUser.user_id, rating, comments);
      setFeedbackSuccess(true);
      await loadRequest();
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      alert('Failed to submit feedback: ' + err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <AILogo size="md" variant="icon" />
        <span className="text-xs font-semibold">Loading CampusCare AI maintenance telemetry & equipment profile...</span>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-slate-600">Ticket not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer">
          Go Back
        </button>
      </div>
    );
  }

  const currentStepIndex = LIFECYCLE_STEPS.findIndex(s => s.key === request.status);
  const isCompleted = ['COMPLETED', 'VERIFIED', 'CLOSED'].includes(request.status);
  const isClosed = ['VERIFIED', 'CLOSED'].includes(request.status);

  // Dynamically resolve defect-specific requirements and replacement parts
  const reqData = request.ai_equipment_requirements || getEquipmentRequirements(request);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-fade-in">
      
      {/* Back button & Title Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-full border border-slate-200/80 transition shadow-xs hover:border-slate-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <AILogo size="xs" variant="badge" theme="dark" />
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Created: {new Date(request.created_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Main Ticket Banner */}
      <div className="apple-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                {request.request_id}
              </span>
              <StatusBadge status={request.status} />
              <PriorityBadge priorityLevel={request.priority_level} score={request.priority_score} />
              <RiskBadge riskLevel={request.risk_level} probability={request.failure_probability} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">{request.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Building2 className="w-4 h-4 text-blue-600" /> {request.location}
              </span>
              {request.asset_code && (
                <span className="font-mono bg-slate-100/80 text-slate-800 px-2.5 py-1 rounded-md font-medium border border-slate-200/70">
                  Target Asset: {request.asset_code} ({request.asset_name || 'Campus Infrastructure'})
                </span>
              )}
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-slate-200/70">
                Category: {request.category}
              </span>
            </div>
          </div>
        </div>

        {/* Maintenance Lifecycle Stepper */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Maintenance Progress Lifecycle
          </h3>
          <div className="relative flex items-center justify-between w-full">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0"></div>
            
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md' :
                    isPast ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}>
                    {isPast && !isCurrent ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-[11px] font-semibold mt-2 text-center whitespace-nowrap ${
                    isCurrent ? 'text-blue-600 font-bold' : isPast ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description & Technician / Assignment Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Complaint Description</h4>
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {request.description}
              </div>
            </div>

            {request.image_url && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Uploaded Issue Photo</h4>
                <div className="rounded-2xl overflow-hidden border border-slate-200/80 max-h-64 bg-slate-100">
                  <img src={request.image_url} alt="Issue evidence" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Assigned Technician Card (if assigned) */}
            {request.technician_name ? (
              <div className="apple-card bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-xs">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{request.technician_name}</h4>
                    <p className="text-xs text-slate-500">{request.technician_skill} Specialist • {request.technician_contact}</p>
                  </div>
                </div>
                {request.technician_remarks && (
                  <div className="mt-3 p-3 bg-white rounded-xl text-xs text-slate-700 border border-slate-200/80">
                    <strong>Technician Remarks:</strong> {request.technician_remarks}
                  </div>
                )}
                {request.evidence_image_url && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Repair Completion Evidence:
                    </span>
                    <img src={request.evidence_image_url} alt="Repair proof" className="rounded-xl max-h-48 object-cover border border-slate-200" />
                  </div>
                )}
              </div>
            ) : (
              <div className="apple-card bg-slate-50/60 border border-slate-200/70 rounded-2xl p-5 text-xs text-slate-500 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Assignment Status
                </span>
                <p className="leading-relaxed">
                  This work order is queued for technician dispatch based on priority score and operational risk band.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Apple-Grade Defect-Specific Requirements & Work Specs */}
        {reqData && (
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Defect-Specific Maintenance Specifications</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mt-1">
                  Required Parts, Tools & Service Protocols
                </h3>
                <p className="text-xs text-slate-500">
                  AI-analyzed technical requirements customized specifically for: <strong className="text-slate-700">{reqData.equipment_profile.target_component}</strong>
                </p>
              </div>
              <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full self-start sm:self-auto font-medium">
                Est. Duration: <strong className="text-slate-900">{reqData.work_requirements.estimated_duration}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {/* Left Card: Required Replacement Parts & Materials */}
              <div className="apple-card bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Replacement Parts & Materials
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Tailored to Defect
                  </span>
                </div>

                <div className="space-y-2">
                  {reqData.work_requirements.replacement_parts.map((part, idx) => (
                    <div key={idx} className="apple-card bg-white p-3 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="leading-tight">
                        <span className="font-semibold text-slate-900 text-xs block">{part.part_name}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">{part.spec}</span>
                      </div>
                      <span className="font-mono text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/70 px-2.5 py-1 rounded-full shrink-0">
                        {part.qty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Card: Diagnostic Tools & SOP */}
              <div className="space-y-4">
                <div className="apple-card bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-indigo-600" />
                      Required Diagnostic Tools
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {reqData.work_requirements.crew_allocation}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {reqData.work_requirements.required_tools.map((tool, idx) => (
                      <div key={idx} className="apple-card bg-white p-2.5 rounded-xl border border-slate-200/70 text-xs shadow-2xs">
                        <div className="font-semibold text-slate-900 text-[11px] mb-0.5">{tool.name}</div>
                        <div className="text-[10px] text-slate-500 leading-tight">{tool.purpose}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety Protocol Card */}
                <div className="apple-card bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Mandatory Safety Procedure
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {reqData.safety_protocols.hazard_class}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {reqData.safety_protocols.isolation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification & Feedback Box (When Completed or Closed) */}
        {isCompleted && (
          <div className="pt-6 border-t border-slate-200">
            {isClosed || request.feedback_rating ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
                <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-900">Repair Verified & Closed</h3>
                <div className="flex items-center justify-center gap-1 text-amber-500 py-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < (request.feedback_rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                {request.feedback_comments && (
                  <p className="text-xs text-emerald-800 italic">"{request.feedback_comments}"</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Verify Repair & Submit Feedback (Required to close ticket)
                </div>
                <p className="text-xs text-amber-800">
                  The technician has completed the maintenance task. Please verify that the infrastructure issue is resolved and rate your service experience.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Service Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 ml-2">{rating} of 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Comments / Verification Notes
                  </label>
                  <textarea
                    rows="3"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="e.g. AC cooling perfectly now, work done cleanly, room restored..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingFeedback ? 'Verifying...' : 'Verify Repair & Close Ticket'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>

    </div>
  );
}

export default RequestDetail;
