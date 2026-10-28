import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
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
  const { currentUser, switchRole, setCurrentUser } = useAuth();
  
  // Navigation states - Default directly to LoginPage
  const [currentRoute, setCurrentRoute] = useState('login'); // 'portal' | 'login' | 'ai_assistant' | 'other'
  const [loginRole, setLoginRole] = useState('student');
  const [activeTab, setActiveTab] = useState('portal'); // for internal sub-views
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [prefilledAssetCode, setPrefilledAssetCode] = useState(null);

  // History stack for genuine "Back" navigation
  const [historyStack, setHistoryStack] = useState([]);

  const pushHistory = (stateSnapshot) => {
    setHistoryStack((prev) => [...prev, stateSnapshot]);
  };

  const goBack = () => {
    if (historyStack.length > 0) {
      const prev = historyStack[historyStack.length - 1];
      setHistoryStack((prevStack) => prevStack.slice(0, -1));
      setCurrentRoute(prev.currentRoute);
      setActiveTab(prev.activeTab);
      setSelectedRequestId(prev.selectedRequestId);
      setPrefilledAssetCode(prev.prefilledAssetCode);
      if (prev.currentRoute === 'portal') {
        if (window.history.pushState) window.history.pushState({}, '', '/');
      } else if (prev.currentRoute === 'ai_assistant') {
        if (window.history.pushState) window.history.pushState({}, '', '/ai-assistant');
      } else if (prev.currentRoute === 'login') {
        if (window.history.pushState) window.history.pushState({}, '', `/login?role=${loginRole}`);
      }
    } else {
      // If stack is empty, return safely to portal dashboard
      setSelectedRequestId(null);
      setCurrentRoute('portal');
      if (window.history.pushState) window.history.pushState({}, '', '/');
    }
  };

  // Parse initial URL on mount and on popstate
  useEffect(() => {
    const handleUrlChange = () => {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const roleParam = searchParams.get('role') || 'student';

      if (pathname.includes('/login')) {
        setCurrentRoute('login');
        setLoginRole(roleParam);
      } else if (pathname.includes('/ai-assistant')) {
        setCurrentRoute('ai_assistant');
      } else {
        // default / and /portal -> loads Portal Dashboard directly
        setCurrentRoute('portal');
        if (roleParam && !currentUser) switchRole(roleParam === 'admin' ? 'admin' : roleParam === 'technician' ? 'technician' : 'student');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Helpers to push state and set view
  const navigateTo = (route, role = null, tab = null) => {
    pushHistory({ currentRoute, activeTab, selectedRequestId, prefilledAssetCode });
    setSelectedRequestId(null);
    if (route === 'home' || route === 'portal') {
      setCurrentRoute('portal');
      if (role && !currentUser) switchRole(role);
      if (tab) setActiveTab(tab);
      if (window.history.pushState) window.history.pushState({}, '', `/`);
    } else if (route === 'login') {
      const targetRole = role || 'student';
      setLoginRole(targetRole);
      setCurrentRoute('login');
      if (window.history.pushState) window.history.pushState({}, '', `/login?role=${targetRole}`);
    } else if (route === 'ai_assistant') {
      setCurrentRoute('ai_assistant');
      if (window.history.pushState) window.history.pushState({}, '', '/ai-assistant');
    } else {
      setCurrentRoute('other');
      if (tab) setActiveTab(tab);
    }
  };

  const handleSelectRequest = (requestId) => {
    pushHistory({ currentRoute, activeTab, selectedRequestId, prefilledAssetCode });
    setSelectedRequestId(requestId);
  };

  const handleReportForAsset = (assetCode) => {
    pushHistory({ currentRoute, activeTab, selectedRequestId, prefilledAssetCode });
    setPrefilledAssetCode(assetCode);
    setCurrentRoute('other');
    setActiveTab('new_request');
  };

  // 1. Dedicated LoginPage
  if (currentRoute === 'login' || !currentUser) {
    return (
      <LoginPage
        role={loginRole}
        onLoginSuccess={(roleKey, persona, userObj) => {
          if (userObj) {
            setCurrentUser(userObj);
          } else {
            const target = persona || roleKey || 'student';
            switchRole(target);
          }
          navigateTo('portal');
        }}
        onGoHome={() => {
          if (!currentUser) switchRole('student');
          navigateTo('portal');
        }}
      />
    );
  }

  // 2. AI Diagnostic Assistant
  if (currentRoute === 'ai_assistant') {
    return (
      <AIAssistantView
        onBack={goBack}
        onNavigateToReport={(assetCode) => handleReportForAsset(assetCode)}
        onNavigateToRequest={(requestId) => handleSelectRequest(requestId)}
        onNavigateToTab={(tab) => {
          pushHistory({ currentRoute, activeTab, selectedRequestId, prefilledAssetCode });
          setSelectedRequestId(null);
          setCurrentRoute('other');
          setActiveTab(tab);
        }}
      />
    );
  }

  // 3. Main VTOP Portal Dashboard (Primary Landing Experience)
  if ((currentRoute === 'portal' || currentRoute === 'home') && !selectedRequestId) {
    return (
      <PortalDashboard
        onGoHome={() => navigateTo('portal')}
        onOpenAIAssistant={() => navigateTo('ai_assistant')}
        onNewRequest={() => { 
          pushHistory({ currentRoute, activeTab, selectedRequestId, prefilledAssetCode });
          setCurrentRoute('other'); 
          setActiveTab('new_request'); 
        }}
        onOpenAnalytics={() => { 
          pushHistory({ currentRoute, activeTab, selectedRequestId, prefilledAssetCode });
          setCurrentRoute('other'); 
          setActiveTab('analytics'); 
        }}
        onOpenAssets={() => { 
          pushHistory({ currentRoute, activeTab, selectedRequestId, prefilledAssetCode });
          setCurrentRoute('other'); 
          setActiveTab('asset_management'); 
        }}
        onOpenTechs={() => { 
          pushHistory({ currentRoute, activeTab, selectedRequestId, prefilledAssetCode });
          setCurrentRoute('other'); 
          setActiveTab('technicians'); 
        }}
        onSelectRequest={handleSelectRequest}
      />
    );
  }

  // 4. Specialized Views (Ticket Detail, New Request, Assets, Techs, Analytics)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          pushHistory({ currentRoute, activeTab, selectedRequestId, prefilledAssetCode });
          setSelectedRequestId(null);
          if (tab === 'home' || tab === 'portal') navigateTo('portal');
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
            onBack={goBack}
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
                onCancel={goBack}
              />
            )}

            {activeTab === 'my_requests' && (
              <MyRequests
                onSelectRequest={handleSelectRequest}
                onNewRequest={() => {
                  pushHistory({ currentRoute, activeTab, selectedRequestId, prefilledAssetCode });
                  setActiveTab('new_request');
                }}
              />
            )}

            {activeTab === 'admin_dashboard' && (
              <AdminDashboard
                onNavigate={(tab) => {
                  pushHistory({ currentRoute, activeTab, selectedRequestId, prefilledAssetCode });
                  setActiveTab(tab);
                }}
                onSelectRequest={handleSelectRequest}
                onSelectAsset={() => {
                  pushHistory({ currentRoute, activeTab, selectedRequestId, prefilledAssetCode });
                  setActiveTab('asset_management');
                }}
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
            onClick={goBack}
            className="text-blue-600 hover:underline font-bold cursor-pointer"
          >
            ← Back to Previous View
          </button>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
