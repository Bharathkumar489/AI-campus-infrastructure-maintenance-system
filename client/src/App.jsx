import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { InstitutionalHome } from './views/home/InstitutionalHome';
import { LoginPage } from './views/auth/LoginPage';
import { PortalDashboard } from './views/portal/PortalDashboard';
import { AIAssistantView } from './views/assistant/AIAssistantView';
import { AdminDashboard } from './views/admin/AdminDashboard';
import { RequestQueue } from './views/admin/RequestQueue';
import { AssetManagement } from './views/admin/AssetManagement';
import { TechnicianManagement } from './views/admin/TechnicianManagement';
import { NewRequest } from './views/requester/NewRequest';
import { MyRequests } from './views/requester/MyRequests';
import { RequestDetail } from './views/requester/RequestDetail';
import { TechnicianTasks } from './views/technician/TechnicianTasks';
import { AnalyticsReports } from './views/analytics/AnalyticsReports';

function MainLayout() {
  const { currentUser, switchRole } = useAuth();
  
  // Navigation states
  const [currentRoute, setCurrentRoute] = useState('home'); // 'home' | 'login' | 'portal' | 'ai_assistant' | 'other'
  const [loginRole, setLoginRole] = useState('student');
  const [activeTab, setActiveTab] = useState('portal'); // for internal sub-views
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [prefilledAssetCode, setPrefilledAssetCode] = useState(null);

  // Parse initial URL on mount and on popstate
  useEffect(() => {
    const handleUrlChange = () => {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const roleParam = searchParams.get('role') || 'student';

      if (pathname.includes('/login')) {
        setCurrentRoute('login');
        setLoginRole(roleParam);
      } else if (pathname.includes('/portal')) {
        setCurrentRoute('portal');
        if (roleParam) switchRole(roleParam === 'admin' ? 'admin' : roleParam === 'technician' ? 'technician' : 'requester');
      } else if (pathname.includes('/ai-assistant')) {
        setCurrentRoute('ai_assistant');
      } else {
        // default /
        setCurrentRoute('home');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Helpers to push state and set view
  const navigateTo = (route, role = null, tab = null) => {
    setSelectedRequestId(null);
    if (route === 'home') {
      setCurrentRoute('home');
      if (window.history.pushState) window.history.pushState({}, '', '/');
    } else if (route === 'login') {
      const targetRole = role || 'student';
      setLoginRole(targetRole);
      setCurrentRoute('login');
      if (window.history.pushState) window.history.pushState({}, '', `/login?role=${targetRole}`);
    } else if (route === 'portal') {
      const targetRole = role || (currentUser?.role === 'admin' ? 'admin' : currentUser?.role === 'technician' ? 'technician' : 'student');
      setCurrentRoute('portal');
      if (tab) setActiveTab(tab);
      if (window.history.pushState) window.history.pushState({}, '', `/portal?role=${targetRole}`);
    } else if (route === 'ai_assistant') {
      setCurrentRoute('ai_assistant');
      if (window.history.pushState) window.history.pushState({}, '', '/ai-assistant');
    } else {
      setCurrentRoute('other');
      if (tab) setActiveTab(tab);
    }
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequestId(requestId);
  };

  const handleReportForAsset = (assetCode) => {
    setPrefilledAssetCode(assetCode);
    setCurrentRoute('other');
    setActiveTab('new_request');
  };

  // 1. Dedicated LoginPage matching Screenshots 2, 3, 4
  if (currentRoute === 'login') {
    return (
      <LoginPage
        role={loginRole}
        onLoginSuccess={(roleKey, persona) => {
          navigateTo('portal', persona);
        }}
        onGoHome={() => navigateTo('home')}
      />
    );
  }

  // 2. Dedicated Institutional Home matching Screenshot 1
  if (currentRoute === 'home') {
    return (
      <InstitutionalHome
        onSelectRole={(selectedRole) => {
          navigateTo('login', selectedRole);
        }}
        onOpenAIAssistant={() => navigateTo('ai_assistant')}
      />
    );
  }

  // 3. AI Diagnostic Assistant
  if (currentRoute === 'ai_assistant') {
    return (
      <AIAssistantView
        onBack={() => navigateTo('portal')}
        onNavigateToReport={(assetCode) => handleReportForAsset(assetCode)}
      />
    );
  }

  // 4. Portal Dashboard matching Screenshot 5
  if (currentRoute === 'portal' && !selectedRequestId) {
    return (
      <PortalDashboard
        onGoHome={() => navigateTo('home')}
        onOpenAIAssistant={() => navigateTo('ai_assistant')}
        onNewRequest={() => { setCurrentRoute('other'); setActiveTab('new_request'); }}
        onOpenAnalytics={() => { setCurrentRoute('other'); setActiveTab('analytics'); }}
        onOpenAssets={() => { setCurrentRoute('other'); setActiveTab('asset_management'); }}
        onOpenTechs={() => { setCurrentRoute('other'); setActiveTab('technicians'); }}
        onSelectRequest={handleSelectRequest}
      />
    );
  }

  // 5. Specialized Views (Ticket Detail, New Request, Assets, Techs, Analytics)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedRequestId(null);
          if (tab === 'home') navigateTo('home');
          else if (tab === 'portal') navigateTo('portal');
          else {
            setCurrentRoute('other');
            setActiveTab(tab);
          }
        }}
        onSelectRequest={handleSelectRequest}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {selectedRequestId ? (
          <RequestDetail
            requestId={selectedRequestId}
            onBack={() => {
              setSelectedRequestId(null);
              navigateTo('portal');
            }}
            onStatusUpdated={() => {}}
          />
        ) : (
          <>
            {activeTab === 'new_request' && (
              <NewRequest
                initialAssetCode={prefilledAssetCode}
                onSuccess={(reqId) => {
                  setPrefilledAssetCode(null);
                  handleSelectRequest(reqId);
                }}
              />
            )}

            {activeTab === 'my_requests' && (
              <MyRequests
                onSelectRequest={handleSelectRequest}
                onNewRequest={() => setActiveTab('new_request')}
              />
            )}

            {activeTab === 'admin_dashboard' && (
              <AdminDashboard
                onNavigate={(tab) => setActiveTab(tab)}
                onSelectRequest={handleSelectRequest}
                onSelectAsset={() => setActiveTab('asset_management')}
              />
            )}

            {activeTab === 'request_queue' && (
              <RequestQueue
                onSelectRequest={handleSelectRequest}
              />
            )}

            {activeTab === 'asset_management' && (
              <AssetManagement
                onReportIssue={handleReportForAsset}
              />
            )}

            {activeTab === 'technicians' && (
              <TechnicianManagement />
            )}

            {activeTab === 'technician_tasks' && (
              <TechnicianTasks
                onSelectRequest={handleSelectRequest}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsReports />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold text-slate-700">
            CampusCare AI • Campus Infrastructure Maintenance System
          </div>
          <div>
            Dept. of Computer Science & Business Systems • 2026–2027
          </div>
          <button
            onClick={() => navigateTo('portal')}
            className="text-blue-600 hover:underline font-bold"
          >
            ← Back to VTOP Portal
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
