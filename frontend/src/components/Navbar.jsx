import React, { useState } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  PlusCircle, 
  ListOrdered, 
  Wrench, 
  BarChart3, 
  ShieldAlert, 
  HardHat, 
  Users, 
  Cpu,
  Bot,
  Home as HomeIcon,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { LoginModal } from '../views/auth/LoginModal';
import { AILogo } from './AILogo';

export function Navbar({ activeTab, setActiveTab, onSelectRequest }) {
  const { currentUser, switchRole } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const role = currentUser?.role || 'admin';

  return (
    <header className="sticky top-0 z-40 glass-nav shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 text-left cursor-pointer group"
            >
              <AILogo size="sm" variant="icon" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-slate-900">
                    CampusCare <span className="text-blue-600 font-extrabold">AI</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                    Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden md:block">
                  Intelligent Campus Maintenance Infrastructure
                </p>
              </div>
            </button>
          </div>

          {/* Apple-style Segmented Navigation */}
          <nav className="hidden md:flex items-center p-1 bg-slate-100/80 rounded-full border border-slate-200/60 gap-0.5">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                activeTab === 'home' 
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HomeIcon className="w-3.5 h-3.5" /> Home
            </button>

            {role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('admin_dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    activeTab === 'admin_dashboard' 
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('request_queue')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    activeTab === 'request_queue' 
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" /> Queue
                </button>
                <button
                  onClick={() => setActiveTab('asset_management')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    activeTab === 'asset_management' 
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Assets
                </button>
                <button
                  onClick={() => setActiveTab('technicians')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    activeTab === 'technicians' 
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Techs
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    activeTab === 'analytics' 
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Analytics
                </button>
              </>
            )}

            {role === 'requester' && (
              <>
                <button
                  onClick={() => setActiveTab('new_request')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    activeTab === 'new_request' 
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Report Issue
                </button>
                <button
                  onClick={() => setActiveTab('my_requests')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    activeTab === 'my_requests' 
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" /> My Complaints
                </button>
              </>
            )}

            {role === 'technician' && (
              <button
                onClick={() => setActiveTab('technician_tasks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  activeTab === 'technician_tasks' 
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" /> My Tasks
              </button>
            )}

            {/* AI Assistant Nav Tab */}
            <button
              onClick={() => setActiveTab('ai_assistant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                activeTab === 'ai_assistant' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Bot className="w-3.5 h-3.5" /> AI Assistant
            </button>
          </nav>

          {/* Right Controls: Apple Persona Switcher & Notifications */}
          <div className="flex items-center gap-3">
            {/* Persona Switcher Pill */}
            <div className="relative flex items-center bg-slate-100 rounded-full px-2.5 py-1 border border-slate-200/60 text-xs">
              <span className="hidden sm:inline font-medium text-slate-400 text-[11px] mr-1.5">View:</span>
              <select
                value={role}
                onChange={(e) => {
                  const newRole = e.target.value;
                  switchRole(newRole);
                  if (newRole === 'requester') setActiveTab('new_request');
                  else if (newRole === 'admin') setActiveTab('admin_dashboard');
                  else if (newRole === 'technician') setActiveTab('technician_tasks');
                  else if (newRole === 'management') setActiveTab('analytics');
                }}
                className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer text-xs pr-1"
              >
                <option value="admin">Administrator (Dr. Sarah)</option>
                <option value="requester">Student (Rohan)</option>
                <option value="technician">Technician (Rajesh)</option>
                <option value="management">Campus Director</option>
              </select>
            </div>

            {/* Notification Bell */}
            <div className="text-slate-700">
              <NotificationDropdown onSelectRequest={onSelectRequest} />
            </div>

            {/* User Profile Avatar */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/60 transition cursor-pointer"
              title="Click to Switch Persona or Sign In"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                {currentUser?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
              </div>
              <span className="text-[11px] font-semibold text-slate-700 hidden sm:inline">
                {currentUser?.name ? currentUser.name.split(' ')[0] : 'Profile'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-150 text-xs overflow-x-auto gap-2">
          <button onClick={() => setActiveTab('home')} className={`py-1 px-2.5 rounded-full ${activeTab === 'home' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}>Home</button>
          {role === 'admin' && (
            <>
              <button onClick={() => setActiveTab('admin_dashboard')} className={`py-1 px-2.5 rounded-full ${activeTab === 'admin_dashboard' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}>Dashboard</button>
              <button onClick={() => setActiveTab('request_queue')} className={`py-1 px-2.5 rounded-full ${activeTab === 'request_queue' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}>Queue</button>
              <button onClick={() => setActiveTab('asset_management')} className={`py-1 px-2.5 rounded-full ${activeTab === 'asset_management' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}>Assets</button>
              <button onClick={() => setActiveTab('analytics')} className={`py-1 px-2.5 rounded-full ${activeTab === 'analytics' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}>Analytics</button>
            </>
          )}
          {role === 'requester' && (
            <>
              <button onClick={() => setActiveTab('new_request')} className={`py-1 px-2.5 rounded-full ${activeTab === 'new_request' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}>Report</button>
              <button onClick={() => setActiveTab('my_requests')} className={`py-1 px-2.5 rounded-full ${activeTab === 'my_requests' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}>My Tickets</button>
            </>
          )}
          {role === 'technician' && (
            <button onClick={() => setActiveTab('technician_tasks')} className={`py-1 px-2.5 rounded-full ${activeTab === 'technician_tasks' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}>My Tasks</button>
          )}
          <button onClick={() => setActiveTab('ai_assistant')} className={`py-1 px-2.5 rounded-full ${activeTab === 'ai_assistant' ? 'bg-blue-600 text-white font-bold' : 'text-blue-600'}`}>AI Chat</button>
        </div>

      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </header>
  );
}

export default Navbar;
