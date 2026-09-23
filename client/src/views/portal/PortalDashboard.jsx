import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Printer, 
  Star, 
  ChevronDown, 
  LogOut, 
  Phone, 
  Briefcase, 
  Info, 
  Wrench, 
  Bell, 
  Shield, 
  FileText, 
  Bot, 
  PlusCircle, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter,
  Sparkles,
  ExternalLink,
  ChevronRight,
  User,
  Sliders,
  MapPin,
  ThumbsUp,
  Clock,
  ArrowRight,
  AlertCircle,
  Building2,
  CheckCircle,
  Camera,
  Upload,
  Send,
  RefreshCw,
  Eye,
  Award,
  Trash2
} from 'lucide-react';
import { VitLogo } from '../../components/VitLogo';
import { AILogo } from '../../components/AILogo';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TechnicianAssignModal } from '../admin/TechnicianAssignModal';
import { CampusMapView } from '../map/CampusMapView';
import { ReputationPill } from '../../components/ReputationPill';
import { Modal } from '../../components/Modal';
import { AssetManagement } from '../admin/AssetManagement';
import { TechnicianManagement } from '../admin/TechnicianManagement';
import { AnalyticsReports } from '../analytics/AnalyticsReports';

const ANNOUNCEMENTS = [
  "HVAC preventive inspection scheduled for Technology Tower this Friday.",
  "Campus maintenance response team is active today across all Academic Blocks.",
  "Submit photos with your complaints for faster AI computer-vision defect triage.",
  "CampusCare AI telemetry updated: 10 campus critical assets under predictive watch."
];

export function PortalDashboard({ 
  onGoHome, 
  onOpenAIAssistant, 
  onNewRequest, 
  onOpenAnalytics, 
  onSelectRequest,
  onOpenAssets,
  onOpenTechs
}) {
  const { currentUser, switchRole, logout } = useAuth();
  
  // Navigation & Drawer States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quickLinksOpen, setQuickLinksOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Initial menu tab based on role
  const [activeMenuTab, setActiveMenuTab] = useState(() => {
    if (currentUser?.role === 'admin') return 'admin_requests';
    if (currentUser?.role === 'technician') return 'tech_tasks';
    return 'my_requests';
  });
  
  // Data States
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modals & Action Targets
  const [triageRequestId, setTriageRequestId] = useState(null);
  const [verifyingRequest, setVerifyingRequest] = useState(null);
  const [completingTechTask, setCompletingTechTask] = useState(null);
  const [activeInfoModal, setActiveInfoModal] = useState(null);
  
  // Verification Modal Form
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Technician Completion Modal Form
  const [techRemarks, setTechRemarks] = useState('');
  const [techParts, setTechParts] = useState('');
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  // Synchronize active tab if role switches
  useEffect(() => {
    if (currentUser?.role === 'admin' && ['my_requests', 'tech_tasks'].includes(activeMenuTab)) {
      setActiveMenuTab('admin_requests');
    } else if (currentUser?.role === 'technician' && ['my_requests', 'admin_requests'].includes(activeMenuTab)) {
      setActiveMenuTab('tech_tasks');
    } else if (currentUser?.role === 'requester' && ['admin_requests', 'tech_tasks', 'admin_assets', 'admin_techs', 'admin_analytics'].includes(activeMenuTab)) {
      setActiveMenuTab('my_requests');
    }
  }, [currentUser?.role]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getRequests();
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load requests in Portal:', err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics computation
  const totalIssues = requests.length;
  const activeNow = requests.filter(r => ['SUBMITTED', 'submitted', 'IN PROGRESS', 'in_progress', 'ASSIGNED', 'assigned'].includes(r.status)).length;
  const urgentCount = requests.filter(r => r.priority_level === 'CRITICAL' || r.priority === 'CRITICAL').length;
  const resolvedCount = requests.filter(r => ['RESOLVED', 'resolved', 'CLOSED', 'closed', 'COMPLETED', 'completed', 'VERIFIED', 'verified'].includes(r.status)).length;

  // Filtered requests for Requesters (My Requests)
  const myRequests = requests.filter(r => r.user_id === currentUser?.user_id);

  // Filtered requests for Technicians
  const techAssignedTasks = requests.filter(r => {
    return (
      r.technician_name?.toLowerCase().includes('rajesh') ||
      r.technician_id === 'T01' ||
      r.user_id === currentUser?.user_id ||
      (r.status && ['ASSIGNED', 'IN PROGRESS'].includes(r.status.toUpperCase()))
    );
  });

  // Filtered public feed or admin list
  const filteredRequests = requests.filter(req => {
    const statusNormalized = (req.status || '').toUpperCase();
    const matchesStatus = filterStatus === 'all' 
      ? true 
      : filterStatus === 'active'
        ? ['SUBMITTED', 'IN PROGRESS', 'ASSIGNED', 'ACCEPTED'].includes(statusNormalized)
        : statusNormalized === filterStatus.toUpperCase();
    
    const matchesBuilding = buildingFilter === 'all'
      ? true
      : (req.location || '').toLowerCase().includes(buildingFilter.toLowerCase()) || (req.building || '').toLowerCase().includes(buildingFilter.toLowerCase());

    const matchesCategory = categoryFilter === 'all'
      ? true
      : (req.category || '').toLowerCase() === categoryFilter.toLowerCase();

    const textMatch = !searchQuery.trim() || 
      (req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       req.asset_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       req.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       req.request_id?.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesBuilding && matchesCategory && textMatch;
  });

  // Handler: Upvote ticket (for Students/Faculty)
  const handleUpvote = async (requestId, e) => {
    e && e.stopPropagation();
    try {
      const res = await api.upvoteRequest(requestId, currentUser?.user_id);
      alert(res.message || 'Upvote recorded! Section 26 priority score elevated.');
      loadRequests();
    } catch (err) {
      alert('Upvote failed: ' + err.message);
    }
  };

  // Handler: Delete / Withdraw Complaint
  const handleDeleteRequest = async (requestId, e) => {
    e && e.stopPropagation();
    if (!window.confirm(`Are you sure you want to withdraw/delete maintenance complaint ${requestId}? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteRequest(requestId, currentUser?.user_id, currentUser?.role);
      alert(`Complaint ${requestId} was successfully withdrawn and removed.`);
      loadRequests();
    } catch (err) {
      alert('Failed to delete complaint: ' + err.message);
    }
  };

  // Handler: Admin Status Override
  const handleAdminStatusChange = async (requestId, newStatus) => {
    try {
      await api.updateRequestStatus(requestId, newStatus, `Status overridden by Administrator (${currentUser?.name})`);
      alert(`Ticket ${requestId} status updated to ${newStatus}`);
      loadRequests();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Handler: Technician Start Work
  const handleTechStartWork = async (requestId) => {
    try {
      await api.updateRequestStatus(requestId, 'IN PROGRESS', `Technician ${currentUser?.name} initiated on-site repair.`);
      alert('Repair started! Ticket moved to IN PROGRESS.');
      loadRequests();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Handler: Technician Complete Work
  const handleTechCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completingTechTask) return;
    setSubmittingEvidence(true);
    try {
      const formData = new FormData();
      formData.append('remarks', techRemarks || 'Repairs completed and equipment tested operational.');
      formData.append('parts_replaced', techParts || 'None');
      await api.submitCompletionEvidence(completingTechTask.request_id, formData);
      alert('Repair completed and submitted for requester verification!');
      setCompletingTechTask(null);
      setTechRemarks('');
      setTechParts('');
      loadRequests();
    } catch (err) {
      alert('Failed to submit completion: ' + err.message);
    } finally {
      setSubmittingEvidence(false);
    }
  };

  // Handler: Requester Verification & Rating (+15 PTS)
  const handleRequesterVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyingRequest) return;
    setSubmittingFeedback(true);
    try {
      await api.submitFeedback(
        verifyingRequest.request_id,
        currentUser?.user_id,
        feedbackRating,
        feedbackComments || 'Satisfactory repair verified on-site.'
      );
      alert(`Thank you! Verification confirmed, 5-star rating recorded, and +15 Reputation PTS awarded!`);
      setVerifyingRequest(null);
      setFeedbackRating(5);
      setFeedbackComments('');
      loadRequests();
    } catch (err) {
      alert('Verification submission failed: ' + err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getRoleDisplayName = (r, userType) => {
    if (r === 'admin') return 'ADMINISTRATOR';
    if (r === 'technician') return 'FIELD TECHNICIAN';
    if (userType === 'faculty') return 'FACULTY / EMPLOYEE';
    return 'STUDENT';
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'SUBMITTED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">Submitted</span>;
      case 'IN PROGRESS':
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">In Progress</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">Completed (Needs Verification)</span>;
      case 'RESOLVED':
      case 'VERIFIED':
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Resolved & Closed</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    const p = (priority || '').toUpperCase();
    switch (p) {
      case 'CRITICAL':
        return <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">LOW</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col font-sans text-slate-800">
      
      {/* 1. Institutional VTOP Top Header Banner */}
      <header className="sticky top-0 z-50 glass-dark-nav text-white shadow-xs">
        <div className="flex items-center justify-between px-3 sm:px-6 h-14">
          
          {/* Left section: Hamburger, VIT-AP Logo, vertical bar, utilities */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded hover:bg-white/15 text-white transition cursor-pointer"
              title="Toggle VTOP Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <VitLogo className="h-8" />
            <div className="h-6 w-px bg-white/30 mx-1 hidden sm:block"></div>
            <AILogo size="sm" variant="badge" className="hidden sm:inline-flex" />

            <div className="hidden sm:flex items-center gap-2 text-blue-100">
              <button 
                onClick={onGoHome}
                title="Go to Home" 
                className="p-1 rounded hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <Home className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.print()} 
                title="Print Dashboard" 
                className="p-1 rounded hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button 
                onClick={() => alert('CampusCare Maintenance Portal added to institutional bookmarks.')}
                title="Bookmarks" 
                className="p-1 rounded hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <Star className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Links Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setQuickLinksOpen(!quickLinksOpen)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-semibold text-white transition cursor-pointer"
              >
                <span>Quick links</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {quickLinksOpen && (
                <div 
                  className="absolute left-0 mt-1 w-56 bg-white rounded shadow-lg border border-slate-200 py-1 text-xs text-slate-700 z-50 animate-in fade-in"
                  onMouseLeave={() => setQuickLinksOpen(false)}
                >
                  <button 
                    onClick={() => { setQuickLinksOpen(false); onNewRequest && onNewRequest(); }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-blue-600" /> Report Maintenance Complaint
                  </button>
                  <button 
                    onClick={() => { setQuickLinksOpen(false); onOpenAIAssistant && onOpenAIAssistant(); }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-purple-600" /> AI Diagnostic Assistant
                  </button>
                  <button 
                    onClick={() => { setQuickLinksOpen(false); setActiveMenuTab('campus_map'); }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Campus Infrastructure Map
                  </button>
                  {currentUser?.role === 'admin' && (
                    <>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button 
                        onClick={() => { setQuickLinksOpen(false); setActiveMenuTab('admin_assets'); }}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-emerald-600" /> Asset Telemetry & Health
                      </button>
                      <button 
                        onClick={() => { setQuickLinksOpen(false); setActiveMenuTab('admin_techs'); }}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5 text-amber-600" /> Technician Dispatch Roster
                      </button>
                      <button 
                        onClick={() => { setQuickLinksOpen(false); setActiveMenuTab('admin_analytics'); }}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5 text-blue-600" /> Analytics & Model Weights
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Center Title */}
          <div className="hidden lg:block text-xs font-semibold text-blue-100 tracking-wider">
            CampusCare AI • Facilities Maintenance
          </div>

          {/* Right Section: Reputation Pill & Profile */}
          <div className="flex items-center gap-3">
            <ReputationPill className="bg-white/15 text-white border-white/25 hover:bg-white/25" />

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:block leading-none pr-1">
                  <div className="text-xs font-bold text-white tracking-wide">
                    {currentUser?.login_id || 'USR101'}
                  </div>
                  <div className="text-[9px] text-blue-200 font-semibold uppercase tracking-wider">
                    {getRoleDisplayName(currentUser?.role, currentUser?.userType)}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-blue-200" />
              </button>

              {userMenuOpen && (
                <div 
                  className="absolute right-0 mt-1.5 w-64 bg-white rounded-md shadow-xl border border-slate-200 p-2 text-xs text-slate-700 z-50 animate-in fade-in"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="p-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{currentUser?.name}</div>
                    <div className="text-slate-500 text-[11px]">{currentUser?.email}</div>
                    <div className="text-[10px] text-blue-700 font-semibold mt-1">{currentUser?.department}</div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => { logout(); onGoHome(); }}
                      className="w-full text-left px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => { logout(); onGoHome(); }}
              title="Sign Out"
              className="p-1.5 rounded hover:bg-white/15 text-blue-100 hover:text-white transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Global Persona Switcher & Role Permission Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-black/[0.06] px-4 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Persona View:
          </span>
          <div className="p-1 bg-slate-100 rounded-full border border-slate-200/60 inline-flex items-center gap-1 flex-wrap">
            <button
              onClick={() => { switchRole('student'); setActiveMenuTab('my_requests'); }}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                currentUser?.role === 'requester' && (currentUser?.userType === 'student' || !currentUser?.userType)
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎓 Student</span>
              {currentUser?.role === 'requester' && (currentUser?.userType === 'student' || !currentUser?.userType) && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              )}
            </button>

            <button
              onClick={() => { switchRole('staff'); setActiveMenuTab('my_requests'); }}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                currentUser?.role === 'requester' && currentUser?.userType === 'faculty'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👨‍🏫 Faculty</span>
              {currentUser?.role === 'requester' && currentUser?.userType === 'faculty' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              )}
            </button>

            <button
              onClick={() => { switchRole('admin'); setActiveMenuTab('admin_requests'); }}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                currentUser?.role === 'admin'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🛡️ Admin</span>
              {currentUser?.role === 'admin' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              )}
            </button>

            <button
              onClick={() => { switchRole('technician'); setActiveMenuTab('tech_tasks'); }}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                currentUser?.role === 'technician'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🔧 Technician</span>
              {currentUser?.role === 'technician' && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              )}
            </button>
          </div>
        </div>

        {/* Role Permissions Scope Pill */}
        <div className="flex items-center gap-2 text-[11px] self-start md:self-auto">
          <span className="text-slate-400 font-medium">Active Scope:</span>
          {currentUser?.role === 'admin' && (
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Full Authority • Triage, Dispatch, Fleet & Weights
            </span>
          )}
          {currentUser?.role === 'technician' && (
            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Assigned Tasks Only • Start & Submit Evidence
            </span>
          )}
          {currentUser?.role === 'requester' && (
            <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              View & Report Only • Lifecycle Tracking & Upvotes
            </span>
          )}
        </div>
      </div>

      {/* 3. Main Body: Collapsible VTOP Drawer + Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Drawer Menu */}
        {sidebarOpen && (
          <aside className="w-56 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between overflow-y-auto z-20">
            <div className="py-2">
              <div className="px-4 py-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {currentUser?.role === 'admin' ? 'Admin Controls' : currentUser?.role === 'technician' ? 'Technician Tools' : 'Campus Services'}
              </div>

              <nav className="space-y-0.5 px-2">
                {/* 1. Student / Faculty Menu */}
                {currentUser?.role === 'requester' && (
                  <>
                    <button
                      onClick={() => setActiveMenuTab('my_requests')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
                        activeMenuTab === 'my_requests' 
                          ? 'bg-[#1878ee] text-white' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>My Complaints ({myRequests.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveMenuTab('campus_feed')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
                        activeMenuTab === 'campus_feed' 
                          ? 'bg-[#1878ee] text-white' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Campus Feed & Upvote</span>
                    </button>

                    <button
                      onClick={() => onNewRequest && onNewRequest()}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>New Complaint</span>
                    </button>
                  </>
                )}

                {/* 2. Technician Menu */}
                {currentUser?.role === 'technician' && (
                  <>
                    <button
                      onClick={() => setActiveMenuTab('tech_tasks')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
                        activeMenuTab === 'tech_tasks' 
                          ? 'bg-[#1878ee] text-white' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Wrench className="w-4 h-4" />
                      <span>My Work Orders ({techAssignedTasks.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveMenuTab('campus_feed')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
                        activeMenuTab === 'campus_feed' 
                          ? 'bg-[#1878ee] text-white' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Campus Issues (View)</span>
                    </button>
                  </>
                )}

                {/* 3. Administrator Menu */}
                {currentUser?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => setActiveMenuTab('admin_requests')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
                        activeMenuTab === 'admin_requests' 
                          ? 'bg-[#1878ee] text-white' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Triage & Requests ({requests.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveMenuTab('admin_assets')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
                        activeMenuTab === 'admin_assets' 
                          ? 'bg-[#1878ee] text-white' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Asset Telemetry</span>
                    </button>

                    <button
                      onClick={() => setActiveMenuTab('admin_techs')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
                        activeMenuTab === 'admin_techs' 
                          ? 'bg-[#1878ee] text-white' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Technician Roster</span>
                    </button>

                    <button
                      onClick={() => setActiveMenuTab('admin_analytics')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
                        activeMenuTab === 'admin_analytics' 
                          ? 'bg-[#1878ee] text-white' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                      <span>AI Model Weights</span>
                    </button>
                  </>
                )}

                {/* Shared Menu Items */}
                <div className="border-t border-slate-200 my-2"></div>

                <button
                  onClick={() => setActiveMenuTab('campus_map')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
                    activeMenuTab === 'campus_map' 
                      ? 'bg-[#1878ee] text-white' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Campus Infrastructure Map</span>
                </button>

                <button
                  onClick={onOpenAIAssistant}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold text-purple-700 hover:bg-purple-50 transition cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span>AI Diagnostic Assistant</span>
                </button>

                <button
                  onClick={() => setActiveInfoModal('sops')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>Maintenance SOPs</span>
                </button>
              </nav>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
              <div className="font-bold text-slate-700">VTOP 2026-2027</div>
              <div>VIT-AP University</div>
            </div>
          </aside>
        )}

        {/* Right Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Subview 1: Campus Map */}
          {activeMenuTab === 'campus_map' && (
            <CampusMapView
              onReportAtLocation={(bldgName) => {
                onNewRequest && onNewRequest();
              }}
              onSelectRequest={onSelectRequest}
            />
          )}

          {/* Subview 2: Admin Asset Telemetry */}
          {activeMenuTab === 'admin_assets' && currentUser?.role === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-slate-800">Campus Asset Fleet Telemetry</h1>
                <button
                  onClick={() => setActiveMenuTab('admin_requests')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  ← Back to Operations Desk
                </button>
              </div>
              <AssetManagement onReportIssue={onNewRequest} />
            </div>
          )}

          {/* Subview 3: Admin Technician Roster */}
          {activeMenuTab === 'admin_techs' && currentUser?.role === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-slate-800">Field Technician Fleet & Dispatch Roster</h1>
                <button
                  onClick={() => setActiveMenuTab('admin_requests')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  ← Back to Operations Desk
                </button>
              </div>
              <TechnicianManagement />
            </div>
          )}

          {/* Subview 4: Admin AI Model Weights */}
          {activeMenuTab === 'admin_analytics' && currentUser?.role === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-slate-800">AI Model Analytics & Calibration</h1>
                <button
                  onClick={() => setActiveMenuTab('admin_requests')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  ← Back to Operations Desk
                </button>
              </div>
              <AnalyticsReports />
            </div>
          )}

          {/* Main Workspace for Requests, Tasks, and Feeds */}
          {!['campus_map', 'admin_assets', 'admin_techs', 'admin_analytics'].includes(activeMenuTab) && (
            <>
              {/* Header Title Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    {currentUser?.role === 'admin' && '🛡️ Administrator Operations & Dispatch Desk'}
                    {currentUser?.role === 'technician' && `🔧 Technician Work Orders — ${currentUser?.name}`}
                    {currentUser?.role === 'requester' && (currentUser?.userType === 'faculty' ? '👨‍🏫 Faculty & Staff Maintenance Portal' : '🎓 Student Maintenance Portal')}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {currentUser?.role === 'admin' && 'Triage maintenance tickets, trigger Section 29 ML technician dispatch, and monitor risk.'}
                    {currentUser?.role === 'technician' && 'Accept assigned work orders, initiate repairs, and upload completion proof.'}
                    {currentUser?.role === 'requester' && 'Track your submitted issues, verify completed work, and upvote campus repairs.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {currentUser?.role === 'requester' && (
                    <button
                      onClick={onNewRequest}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1878ee] hover:bg-[#1264c9] text-white rounded text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Report Maintenance Complaint</span>
                    </button>
                  )}
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={onNewRequest}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1878ee] hover:bg-[#1264c9] text-white rounded text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>New Ticket</span>
                    </button>
                  )}
                  <button
                    onClick={onOpenAIAssistant}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-800 border border-purple-200 rounded text-xs font-bold hover:bg-purple-100 transition cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Assistant</span>
                  </button>
                </div>
              </div>

              {/* Announcements Banner */}
              <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Campus Bulletins</span>
                  <button 
                    onClick={() => alert(ANNOUNCEMENTS.join('\n\n'))}
                    className="text-xs text-slate-500 hover:text-blue-600 hover:underline cursor-pointer"
                  >
                    More ...
                  </button>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  {ANNOUNCEMENTS.slice(0, 2).map((note, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></div>
                      <p className="truncate">{note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two-Column Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left 2 Columns: Role-Specific Primary Interface */}
                <div className="lg:col-span-2 space-y-4">
                  
                  {/* TAB 1: STUDENT / FACULTY - MY SUBMITTED REQUESTS */}
                  {currentUser?.role === 'requester' && activeMenuTab === 'my_requests' && (
                    <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
                      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-slate-900">
                            My Submitted Complaints
                          </h2>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                            {myRequests.length} filed
                          </span>
                        </div>
                        <button
                          onClick={loadRequests}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                          title="Refresh"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {loading ? (
                        <div className="p-8 text-center text-xs text-slate-400">Loading your maintenance requests...</div>
                      ) : myRequests.length === 0 ? (
                        <div className="p-10 text-center space-y-3">
                          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                          <h3 className="text-sm font-bold text-slate-700">No Complaints Submitted Yet</h3>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Notice an equipment issue, electrical sparking, or water leak? Submit a request and track repair progress live.
                          </p>
                          <button
                            onClick={onNewRequest}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-sm"
                          >
                            Submit Maintenance Complaint
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myRequests.map((req) => {
                            const isCompleted = ['COMPLETED', 'completed', 'RESOLVED', 'resolved', 'VERIFIED', 'verified', 'CLOSED', 'closed'].includes(req.status);
                            const isVerified = ['VERIFIED', 'verified', 'CLOSED', 'closed'].includes(req.status);

                            return (
                              <div key={req.request_id} className="apple-card p-5 sm:p-6 hover:shadow-md transition-all duration-200 space-y-3.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                                      {req.asset_code || req.request_id}
                                    </span>
                                    {getStatusBadge(req.status)}
                                    {getPriorityBadge(req.priority_level || req.priority)}
                                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                                      {req.category}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    Reported: {new Date(req.created_at).toLocaleDateString()}
                                  </span>
                                </div>

                                <div>
                                  <div 
                                    className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer tracking-tight"
                                    onClick={() => onSelectRequest && onSelectRequest(req.request_id)}
                                  >
                                    {req.title}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                    {req.description}
                                  </p>
                                  <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                    <span>{req.location}</span>
                                  </div>
                                </div>

                                {/* 4-Step Lifecycle Stepper */}
                                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-150/60">
                                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center justify-between">
                                    <span>Repair Progress Lifecycle</span>
                                    {req.technician_name && (
                                      <span className="text-blue-600 font-semibold normal-case">
                                        Assigned: {req.technician_name}
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                                    <div className="py-1.5 px-1 rounded-xl bg-blue-500/10 text-blue-700 font-semibold border border-blue-500/20">
                                      1. Submitted
                                    </div>
                                    <div className={`py-1.5 px-1 rounded-xl font-semibold border ${['ASSIGNED', 'IN PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED'].includes((req.status || '').toUpperCase()) ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' : 'bg-slate-100 text-slate-400 border-slate-200/60'}`}>
                                      2. Dispatched
                                    </div>
                                    <div className={`py-1.5 px-1 rounded-xl font-semibold border ${['IN PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED'].includes((req.status || '').toUpperCase()) ? 'bg-purple-500/10 text-purple-700 border-purple-500/20' : 'bg-slate-100 text-slate-400 border-slate-200/60'}`}>
                                      3. In Progress
                                    </div>
                                    <div className={`py-1.5 px-1 rounded-xl font-semibold border ${isCompleted ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-slate-100 text-slate-400 border-slate-200/60'}`}>
                                      4. Resolved
                                    </div>
                                  </div>
                                </div>

                                {/* Action row for Requesters */}
                                <div className="flex items-center justify-between pt-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      ▲ {req.upvotes || 1} Campus Upvotes
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {isCompleted && !isVerified && (
                                      <button
                                        type="button"
                                        onClick={() => setVerifyingRequest(req)}
                                        className="apple-pill px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                                        <span>Verify & Rate Repair (+15 PTS)</span>
                                      </button>
                                    )}

                                    {isVerified && (
                                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-500/20 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Closed
                                      </span>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => onSelectRequest && onSelectRequest(req.request_id)}
                                      className="apple-pill px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-semibold transition cursor-pointer shadow-2xs"
                                    >
                                      View Details
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteRequest(req.request_id, e)}
                                      className="apple-pill px-3 py-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-full text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                                      title="Withdraw/Delete this complaint"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: CAMPUS FEED & UPVOTE (For Students, Faculty, Technicians) */}
                  {(activeMenuTab === 'campus_feed' || (currentUser?.role === 'requester' && activeMenuTab === 'campus_feed')) && (
                    <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
                      <div className="px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                        <div>
                          <h2 className="text-sm font-bold text-slate-900">
                            Campus Public Feed & Upvoting
                          </h2>
                          <p className="text-[11px] text-slate-500">
                            Upvoting active issues elevates Section 26 complaint frequency and fast-tracks triage without duplicate tickets.
                          </p>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Filter issues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-2 pr-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 w-36"
                          />
                          <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="py-1 px-2 bg-white border border-slate-300 rounded text-xs text-slate-700"
                          >
                            <option value="all">All Types</option>
                            <option value="HVAC">HVAC</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Civil">Civil</option>
                          </select>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {filteredRequests.map((req) => (
                          <div key={req.request_id} className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-mono text-xs font-bold text-slate-900">
                                  {req.asset_code || req.request_id}
                                </span>
                                {getStatusBadge(req.status)}
                                {getPriorityBadge(req.priority_level || req.priority)}
                              </div>
                              <div className="text-xs font-bold text-slate-800">
                                {req.title}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {req.location} • Reported on {new Date(req.created_at).toLocaleDateString()}
                              </div>
                            </div>

                            {/* Upvote Action (No Triage for requesters) */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleUpvote(req.request_id, e)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                title="Upvote this complaint to elevate Section 26 priority"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>Upvote ({req.upvotes || 1})</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => onSelectRequest && onSelectRequest(req.request_id)}
                                className="text-slate-400 hover:text-blue-600 p-1"
                                title="View Ticket"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: FIELD TECHNICIAN - MY ASSIGNED WORK ORDERS */}
                  {currentUser?.role === 'technician' && activeMenuTab === 'tech_tasks' && (
                    <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
                      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <div>
                          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-purple-600" />
                            Assigned Work Orders — Rajesh Kumar
                          </h2>
                          <p className="text-[11px] text-slate-500">
                            Technician dispatch queue for HVAC and Mechanical services.
                          </p>
                        </div>
                        <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                          {techAssignedTasks.length} Active Tasks
                        </span>
                      </div>

                      {techAssignedTasks.length === 0 ? (
                        <div className="p-10 text-center space-y-2">
                          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                          <h3 className="text-sm font-bold text-slate-700">All Work Orders Cleared</h3>
                          <p className="text-xs text-slate-500">No active repair orders currently assigned to you.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {techAssignedTasks.map((task) => {
                            const isStarted = (task.status || '').toUpperCase() === 'IN PROGRESS';
                            const isDone = ['COMPLETED', 'RESOLVED', 'CLOSED', 'VERIFIED'].includes((task.status || '').toUpperCase());

                            return (
                              <div key={task.request_id} className="p-4.5 hover:bg-slate-50/70 transition space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-black text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                      {task.asset_code || task.request_id}
                                    </span>
                                    {getStatusBadge(task.status)}
                                    {getPriorityBadge(task.priority_level || task.priority)}
                                    {task.failure_risk_score >= 0.7 && (
                                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                        RF High Risk ({Math.round(task.failure_risk_score * 100)}%)
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400">
                                    Due: High Priority
                                  </span>
                                </div>

                                <div>
                                  <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                                  <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-semibold text-slate-700">{task.location}</span>
                                    <span>• Equipment: {task.asset_name || task.asset_code}</span>
                                  </div>
                                </div>

                                {/* Operational Action Buttons for Technician */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                  <span className="text-[11px] text-slate-400">
                                    Reporter: {task.requester_name || 'Student / Faculty'}
                                  </span>

                                  <div className="flex items-center gap-2">
                                    {!isStarted && !isDone && (
                                      <button
                                        type="button"
                                        onClick={() => handleTechStartWork(task.request_id)}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Accept & Start Work</span>
                                      </button>
                                    )}

                                    {isStarted && (
                                      <button
                                        type="button"
                                        onClick={() => setCompletingTechTask(task)}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>Submit Repair Proof</span>
                                      </button>
                                    )}

                                    {isDone && (
                                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                                        ✓ Completed & Awaiting Verification
                                      </span>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => onSelectRequest && onSelectRequest(task.request_id)}
                                      className="p-1.5 text-slate-400 hover:text-slate-700 border border-slate-200 rounded"
                                      title="View Ticket Specs"
                                    >
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: ADMINISTRATOR - FULL OPERATIONS DESK WITH TRIAGE */}
                  {currentUser?.role === 'admin' && activeMenuTab === 'admin_requests' && (
                    <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
                      <div className="px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-800">
                            Maintenance Operations Desk
                          </h2>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                            {filteredRequests.length} visible
                          </span>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search issue or asset..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-7 pr-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none w-36 sm:w-44"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                          </div>

                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="py-1 px-2 bg-white border border-slate-300 rounded text-xs text-slate-700"
                          >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="IN PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                          </select>
                        </div>
                      </div>

                      {/* Admin Table */}
                      {loading ? (
                        <div className="p-8 text-center text-xs text-slate-400">Loading maintenance tickets...</div>
                      ) : filteredRequests.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400">
                          No maintenance requests found matching your filter.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {filteredRequests.map((req) => (
                            <div 
                              key={req.request_id}
                              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition"
                            >
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => onSelectRequest && onSelectRequest(req.request_id)}
                              >
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-mono text-xs font-bold text-slate-900">
                                    {req.asset_code || req.request_id}
                                  </span>
                                  {getStatusBadge(req.status)}
                                  {getPriorityBadge(req.priority_level || req.priority)}
                                  {req.failure_risk_score >= 0.7 && (
                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                      RF High Risk ({Math.round(req.failure_risk_score * 100)}%)
                                    </span>
                                  )}
                                  <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                    ▲ {req.upvotes || 1} Upvotes
                                  </span>
                                </div>

                                <div className="text-xs text-slate-700 font-bold">
                                  {req.title}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {req.location} • Assigned: {req.technician_name || 'Unassigned'} • Reported on {new Date(req.created_at).toLocaleDateString()}
                                </div>
                              </div>

                              {/* Right Admin Controls: Triage Button & Direct Status Override */}
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Direct Status Override for Admin */}
                                <select
                                  value={(req.status || '').toUpperCase()}
                                  onChange={(e) => handleAdminStatusChange(req.request_id, e.target.value)}
                                  className="text-[11px] font-semibold py-1 px-2 border border-slate-300 rounded bg-white text-slate-700 cursor-pointer"
                                  title="Admin Status Override"
                                >
                                  <option value="SUBMITTED">Set: Submitted</option>
                                  <option value="ASSIGNED">Set: Assigned</option>
                                  <option value="IN PROGRESS">Set: In Progress</option>
                                  <option value="COMPLETED">Set: Completed</option>
                                  <option value="RESOLVED">Set: Resolved</option>
                                  <option value="CLOSED">Set: Closed</option>
                                </select>

                                {/* Triage Button */}
                                <button
                                  type="button"
                                  onClick={() => setTriageRequestId(req.request_id)}
                                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                                >
                                  Triage
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onSelectRequest && onSelectRequest(req.request_id)}
                                  className="text-slate-400 hover:text-blue-600 p-1"
                                  title="View Ticket Details"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteRequest(req.request_id, e)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                                  title="Delete Ticket"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  )}

                </div>

                {/* Right 1 Column: Campus Status Widget & Role-Specific Cards */}
                <div className="space-y-6">
                  
                  {/* Campus Status 4-Stat Metric Box matching Screenshot 5 */}
                  <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-200">
                      <h2 className="text-sm font-bold text-[#7e183f]">
                        Campus status
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-y divide-slate-200">
                      <div className="p-4">
                        <div className="text-blue-600 mb-1">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 font-mono">
                          {totalIssues}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          Total issues
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="text-blue-600 mb-1">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 font-mono">
                          {activeNow}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          Active now
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="text-blue-600 mb-1">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 font-mono">
                          {urgentCount}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          Urgent
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="text-blue-600 mb-1">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 font-mono">
                          {resolvedCount}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          Resolved
                        </div>
                      </div>
                    </div>

                    {/* Quick Assistant Callout */}
                    <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
                      <button
                        onClick={onOpenAIAssistant}
                        className="w-full flex items-center justify-between px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 rounded text-xs font-bold transition cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-purple-700" /> AI Diagnostic Assistant
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      </button>

                      <button
                        onClick={() => setActiveMenuTab('campus_map')}
                        className="w-full flex items-center justify-between px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded text-xs font-bold transition cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-700" /> View Campus Vector Map
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                      </button>
                    </div>
                  </div>

                  {/* Role-Specific Right Card 1: Requesters (Contribution & Reputation Card) */}
                  {currentUser?.role === 'requester' && (
                    <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 rounded-md p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-600" /> Campus Guardian Tier
                        </span>
                        <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          ⭐ 150 PTS
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        You have contributed to campus safety by reporting and verifying defect repairs.
                      </p>
                      <div className="text-[11px] text-slate-500 space-y-1 bg-white/70 p-2.5 rounded border border-amber-100">
                        <div className="flex justify-between">
                          <span>Report Valid Fault:</span>
                          <span className="font-bold text-amber-700">+10 PTS</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Verify Completed Repair:</span>
                          <span className="font-bold text-amber-700">+15 PTS</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Upvote Existing Issue:</span>
                          <span className="font-bold text-amber-700">+5 PTS</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Role-Specific Right Card 2: Field Technician Scorecard */}
                  {currentUser?.role === 'technician' && (
                    <div className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-200 rounded-md p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                          <Wrench className="w-4 h-4 text-purple-600" /> Technician Scorecard
                        </span>
                        <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          4.85 / 5.0 ★
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between py-1 border-b border-purple-100">
                          <span>Specialization:</span>
                          <span className="font-bold text-slate-800">HVAC Maintenance</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-purple-100">
                          <span>Active Workload:</span>
                          <span className="font-bold text-purple-700">{techAssignedTasks.length} Units</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Resolved This Month:</span>
                          <span className="font-bold text-emerald-700">12 Completed</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </>
          )}

        </main>
      </div>

      {/* MODAL 1: Admin Triage & Technician Assignment Modal */}
      {triageRequestId && currentUser?.role === 'admin' && (
        <TechnicianAssignModal
          requestId={triageRequestId}
          onClose={() => setTriageRequestId(null)}
          onSuccess={() => {
            setTriageRequestId(null);
            loadRequests();
          }}
        />
      )}

      {/* MODAL 2: Requester Verification & 5-Star Rating Modal */}
      {verifyingRequest && (
        <Modal
          isOpen={true}
          onClose={() => setVerifyingRequest(null)}
          title="Verify Completed Repair & Claim +15 PTS"
        >
          <form onSubmit={handleRequesterVerifySubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-bold text-blue-900">{verifyingRequest.title}</div>
              <div className="text-slate-600 mt-0.5">{verifyingRequest.location} • Equipment: {verifyingRequest.asset_code}</div>
              <div className="text-[11px] text-blue-700 mt-1 font-semibold">
                Completed by Technician: {verifyingRequest.technician_name || 'Assigned Field Specialist'}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                How satisfied are you with the resolution?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 cursor-pointer transition hover:scale-110"
                  >
                    <Star 
                      className={`w-6 h-6 ${star <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} 
                    />
                  </button>
                ))}
                <span className="font-bold text-slate-700 ml-2">
                  {feedbackRating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Verification Notes / Confirmation:
              </label>
              <textarea
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                placeholder="Confirm that the equipment is working properly and no defect remains..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 h-20 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVerifyingRequest(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingFeedback}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submittingFeedback ? 'Verifying...' : 'Confirm Verification (+15 PTS)'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Technician Repair Completion Modal */}
      {completingTechTask && (
        <Modal
          isOpen={true}
          onClose={() => setCompletingTechTask(null)}
          title="Submit Repair Proof & Completion"
        >
          <form onSubmit={handleTechCompleteSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="font-bold text-purple-900">{completingTechTask.title}</div>
              <div className="text-slate-600 mt-0.5">{completingTechTask.location} • Equipment: {completingTechTask.asset_code}</div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Work Done / Repair Remarks:
              </label>
              <textarea
                value={techRemarks}
                onChange={(e) => setTechRemarks(e.target.value)}
                placeholder="e.g. Replaced burnt start capacitor, cleaned filter coils, verified airflow..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 h-20 outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Parts Replaced / Materials Used:
              </label>
              <input
                type="text"
                value={techParts}
                onChange={(e) => setTechParts(e.target.value)}
                placeholder="e.g. 1x 50uF Capacitor, 2x Terminal Lugs"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCompletingTechTask(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingEvidence}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submittingEvidence ? 'Submitting...' : 'Mark Completed & Notify Requester'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: Information Corner / SOPs Modal */}
      {activeInfoModal === 'sops' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveInfoModal(null)}
          title="Campus Infrastructure Maintenance SOPs"
        >
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-bold text-blue-900 mb-1">Multi-Factor Section 26 Priority Matrix</h4>
              <p className="text-[11px] text-blue-800">
                Tickets are mathematically evaluated by the AI engine using:
                <br />
                <code className="font-bold">Score = 0.4×Severity + 0.3×FailureRisk + 0.2×ComplaintFrequency + 0.1×Location</code>
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900">Role Guidelines:</h5>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong>Students & Teachers:</strong> Report issues with room details & photos. Check campus feed to upvote existing issues instead of filing duplicates. Verify completed repairs to award stars and earn +15 reputation points.</li>
                <li><strong>Field Technicians:</strong> Check your assigned queue. Click "Start Work" upon arrival on-site and "Submit Repair Proof" upon testing the equipment.</li>
                <li><strong>Administrators:</strong> Full authority to triage tickets, review ML technician matches, override priorities, and monitor asset health.</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
