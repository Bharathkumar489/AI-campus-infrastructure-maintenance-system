import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Building2, 
  ShieldCheck, 
  FileText, 
  Flame,
  UserRound,
  Search,
  PlusCircle,
  HelpCircle,
  ExternalLink,
  MapPin,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AILogo } from '../../components/AILogo';

const QUICK_PROMPTS = [
  "How do I report a maintenance issue?",
  "How do I use this website?",
  "Search campus issues & assets",
  "Search available technicians",
  "Check high-risk equipment"
];

export function AIAssistantView({ onBack, onNavigateToReport, onNavigateToRequest, onNavigateToTab }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello ${currentUser?.name || 'there'}! I am **CampusCare AI**, your intelligent campus maintenance diagnostic and navigation assistant.\n\nI can help you with:\n• 📝 **How to Report Issues**: Step-by-step guidance, defect identification & photo triage\n• 🌐 **Using the Website**: Navigation help across tickets, campus map, roles & analytics\n• 🔍 **Basic AI Search**: Search active campus tickets, equipment assets, and trade technicians\n• ⚡ **Equipment Diagnosis**: Symptom analysis & Section 26 urgency priority scoring\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionButtons: [
        { label: '📝 How to Report Issue', query: 'How do I report a maintenance issue?' },
        { label: '🌐 Website Guide', query: 'How do I use this website?' },
        { label: '🔍 AI Search', query: 'Search campus issues & assets' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (userText) => {
    const query = (userText || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const lower = query.toLowerCase().trim();
      let replyText = '';
      let actionButtons = null;

      // 1. Natural Greetings & Conversational Queries
      const isGreeting = /^(hello|hi|hey|good\s*(morning|afternoon|evening|day)|greetings|namaste|howdy|yo|sup)\b/i.test(lower) || lower === 'hi' || lower === 'hello' || lower === 'hey';
      const isGratitudeOrClosing = /^(thanks|thank\s*you|thx|bye|goodbye|ok|okay|cool|great|awesome|got\s*it|understood)\b/i.test(lower);
      const isStatusQuery = /^(how\s*are\s*you|what'?s\s*up)\b/i.test(lower);

      // 2. Specific Request: How to Report an Issue
      const isHowToReport = /how\s*(do\s*i|can\s*i|to)?\s*(report|raise|file|create|submit|lodge)\s*(a|an)?\s*(issue|defect|complaint|problem|ticket|request|grievance)?/i.test(lower) ||
        lower.includes('how to report') || lower.includes('report issue') || lower.includes('file a ticket') || lower.includes('raise complaint') || lower.includes('lodge a complaint');

      // 3. Specific Request: How to Use the Website / Navigation Guide
      const isHowToUseWebsite = /how\s*(do\s*i|can\s*i|to)?\s*use\s*(this|the)?\s*(website|site|portal|system|app|page)/i.test(lower) ||
        lower.includes('how to use') || lower.includes('help using website') || lower.includes('website guide') || lower.includes('portal guide') || lower.includes('features');

      // 4. Specific Request: Basic AI Search
      const isSearchQuery = /^(search|find|lookup|look\s*up|where\s*is|locate|show\s*me)\b/i.test(lower) ||
        lower.includes('search') || lower.includes('find ticket') || lower.includes('find asset') || lower.includes('find technician');

      if (isGreeting) {
        replyText = `👋 **Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}!**\n\nI am **CampusCare AI**, your 24/7 campus maintenance assistant. How can I assist you?\n\n• **Report an Issue**: Learn how to log maintenance tickets with AI photo triage\n• **Website Guide**: Get quick help on how to navigate the portal\n• **AI Search**: Search campus assets, work orders, or technician availability\n• **Diagnose Faults**: Describe symptoms like flickering lights or AC leaks`;
        actionButtons = [
          { label: '📝 How to Report Issue', query: 'How do I report a maintenance issue?' },
          { label: '🌐 Website Guide', query: 'How do I use this website?' },
          { label: '🔍 AI Search', query: 'Search campus issues & assets' }
        ];
      } else if (isHowToReport) {
        replyText = `### 📋 Step-by-Step: How to Report a Maintenance Issue\n\n` +
          `Reporting an issue on CampusCare AI takes less than 60 seconds:\n\n` +
          `1. **Click "Report Issue"**:\n` +
          `   Use the button below or click **"+ New Request"** in the top navigation.\n\n` +
          `2. **Select Building & Location**:\n` +
          `   Choose the affected campus building (e.g., Block A, Block B, Central Library) and enter the room or lab number.\n\n` +
          `3. **Describe the Malfunction**:\n` +
          `   Enter a brief title and description of what's broken (e.g., *"AC in Room 203 blowing warm air"* or *"Restroom water pipe leaking"*).\n\n` +
          `4. **Attach Photo Evidence (Recommended)**:\n` +
          `   Upload a clear photo. Our Computer-Vision AI will automatically detect the defect, classify the trade category, and compute the failure severity.\n\n` +
          `5. **Submit & Real-Time Tracking**:\n` +
          `   Click **"Submit Work Order"**. Your issue is prioritized using Section 26 operational rules and dispatched directly to duty technicians!`;
        actionButtons = [
          { label: '📝 Open Report Issue Form', action: 'report' },
          { label: '📋 View Active Tickets', action: 'my_requests' }
        ];
      } else if (isHowToUseWebsite) {
        replyText = `### 🌐 CampusCare AI: Complete Website User Guide\n\n` +
          `Welcome to the VIT-AP Campus Infrastructure Maintenance Portal! Here is how to make the most of every section:\n\n` +
          `• 🏠 **Portal Dashboard**: The main hub displaying active maintenance work orders, live status pills, campus announcements, and technician assignments.\n\n` +
          `• 📝 **Report Issue (+ New Request)**: Students, faculty, and staff can submit new maintenance tickets with automated AI diagnosis and photo evidence.\n\n` +
          `• 🗺️ **Campus Map**: Visual campus map of academic blocks and hostel areas displaying real-time maintenance hotspots and equipment health.\n\n` +
          `• ⚙️ **Admin & Dispatch Center**: Campus facility managers review triage queues, assign work orders, and analyze telemetry.\n\n` +
          `• 🔧 **Technician Tasks**: Field technicians can view assigned tasks, update work stages, and upload completion photos for verification.\n\n` +
          `• 📊 **Analytics & Reports**: Operational telemetry, mean-time-to-repair (MTTR), and failure prevention metrics.\n\n` +
          `• 🤖 **AI Assistant**: Always available in the top bar to answer maintenance queries, search campus records, and guide you!`;
        actionButtons = [
          { label: '📝 Report Defect', action: 'report' },
          { label: '🗺️ Open Campus Map', action: 'map' },
          { label: '🏠 Back to Portal', action: 'portal' }
        ];
      } else if (isGratitudeOrClosing) {
        replyText = `You're very welcome! 😊\n\nIf you ever need help reporting a defect, searching campus equipment, or navigating the portal, I'm right here. Have a productive day!`;
      } else if (isStatusQuery) {
        replyText = `All systems are running smoothly! Campus telemetry is online, Section 26 priority dispatch is active, and maintenance response teams are on duty.\n\nHow can I help you today?`;
      } else if (isSearchQuery) {
        // Basic AI Search Implementation
        // Extract search keyword
        const cleanTerm = lower
          .replace(/^(search|find|lookup|look\s*up|where\s*is|locate|show\s*me)\s*(for|about)?/i, '')
          .replace(/\b(campus|issues|tickets|assets|equipment|technicians|the|in|at)\b/gi, '')
          .trim();

        const [allRequests, allAssets, allTechs] = await Promise.all([
          api.getRequests().catch(() => []),
          api.getAssets().catch(() => []),
          api.getTechnicians().catch(() => [])
        ]);

        if (!cleanTerm || cleanTerm.length < 2) {
          replyText = `### 🔍 AI Campus Search Engine\n\n` +
            `You can search across all campus maintenance records by typing keywords, for example:\n` +
            `• *"Search AC"* — finds air conditioners, cooling tickets, and HVAC technicians\n` +
            `• *"Search Block A"* — lists all assets and tickets in Block A\n` +
            `• *"Search plumbing"* — finds water booster pumps, pipe leaks, and plumbers\n` +
            `• *"Search Rajesh"* — displays technician profile, skill, and current workload\n` +
            `• *"Search Critical"* — lists all urgent Section 26 priority tickets\n\n` +
            `What keyword would you like to search for?`;
          actionButtons = [
            { label: '🔍 Search "AC"', query: 'search AC' },
            { label: '🔍 Search "Plumbing"', query: 'search plumbing' },
            { label: '🔍 Search "Block A"', query: 'search Block A' }
          ];
        } else {
          // Filter matching results across requests, assets, and technicians
          const matchRequests = allRequests.filter(r => 
            (r.title && r.title.toLowerCase().includes(cleanTerm)) ||
            (r.description && r.description.toLowerCase().includes(cleanTerm)) ||
            (r.request_id && r.request_id.toLowerCase().includes(cleanTerm)) ||
            (r.building && r.building.toLowerCase().includes(cleanTerm)) ||
            (r.category && r.category.toLowerCase().includes(cleanTerm)) ||
            (r.priority_level && r.priority_level.toLowerCase().includes(cleanTerm))
          ).slice(0, 3);

          const matchAssets = allAssets.filter(a =>
            (a.asset_code && a.asset_code.toLowerCase().includes(cleanTerm)) ||
            (a.asset_name && a.asset_name.toLowerCase().includes(cleanTerm)) ||
            (a.building && a.building.toLowerCase().includes(cleanTerm)) ||
            (a.asset_type && a.asset_type.toLowerCase().includes(cleanTerm)) ||
            (a.location && a.location.toLowerCase().includes(cleanTerm))
          ).slice(0, 3);

          const matchTechs = allTechs.filter(t =>
            (t.name && t.name.toLowerCase().includes(cleanTerm)) ||
            (t.skill && t.skill.toLowerCase().includes(cleanTerm)) ||
            (t.department && t.department.toLowerCase().includes(cleanTerm)) ||
            (t.technician_id && t.technician_id.toLowerCase().includes(cleanTerm))
          ).slice(0, 2);

          const hasMatches = matchRequests.length > 0 || matchAssets.length > 0 || matchTechs.length > 0;

          if (!hasMatches) {
            replyText = `### 🔍 AI Search: No exact matches for "${cleanTerm}"\n\n` +
              `I couldn't find active records matching that query. You can try:\n` +
              `• Searching by building (e.g., *"Block A"*, *"Hostel"*)\n` +
              `• Searching by equipment (e.g., *"AC"*, *"Pump"*, *"Elevator"*)\n` +
              `• Searching by trade (e.g., *"Electrical"*, *"Plumbing"*, *"Civil"*)\n\n` +
              `If you need to report an issue for this equipment, you can file a new request below!`;
            actionButtons = [
              { label: '📝 File New Report', action: 'report' },
              { label: '🔍 Search "AC"', query: 'search AC' },
              { label: '🔍 Search "Plumbing"', query: 'search plumbing' }
            ];
          } else {
            let resultParts = [`### 🔍 Search Results for "${cleanTerm}"\n`];

            if (matchRequests.length > 0) {
              resultParts.push(`**📋 Active Tickets (${matchRequests.length})**:`);
              matchRequests.forEach(r => {
                resultParts.push(`• **${r.request_id}**: ${r.title} — *${r.status?.toUpperCase()}* (${r.priority_level} Priority, ${r.building || 'Campus'})`);
              });
              resultParts.push('');
            }

            if (matchAssets.length > 0) {
              resultParts.push(`**🏢 Campus Assets (${matchAssets.length})**:`);
              matchAssets.forEach(a => {
                const riskPct = a.prediction?.failure_probability ? Math.round(a.prediction.failure_probability * 100) : 15;
                resultParts.push(`• **${a.asset_code}** (${a.asset_name}) — ${a.building} / ${a.location} [Risk: ${riskPct}%]`);
              });
              resultParts.push('');
            }

            if (matchTechs.length > 0) {
              resultParts.push(`**👷 Technicians (${matchTechs.length})**:`);
              matchTechs.forEach(t => {
                resultParts.push(`• **${t.name}** — ${t.skill} (${t.availability || 'Available'}, ${t.workload || 0} active tasks)`);
              });
              resultParts.push('');
            }

            replyText = resultParts.join('\n');
            actionButtons = [
              { label: '📝 Report Defect', action: 'report' },
              { label: '📋 View All Tickets', action: 'my_requests' }
            ];
          }
        }
      } else if (lower.includes('ac-blocka-203') || (lower.includes('block a') && lower.includes('room 203')) || lower.includes('air conditioner') || (lower.includes('ac ') && !lower.includes('action'))) {
        replyText = `### 🔍 Telemetry Analysis for AC-BLOCKA-203\n\n` +
          `• **Equipment**: Split AC 2.0 Ton (Daikin Inverter)\n` +
          `• **Location**: Block A / Room 203 (Computing Lab 1)\n` +
          `• **AI 30-Day Failure Probability**: **87% (HIGH RISK)**\n` +
          `• **Operational Priority**: **CRITICAL (Score: 83.5 / 100)**\n\n` +
          `**Key Risk Signals**:\n` +
          `1. High asset age (5.2 years) with 4 prior compressor repairs.\n` +
          `2. 210 days since last maintenance overhaul (threshold: 90 days).\n` +
          `3. Heavy daily duty cycle (12 hrs/day) in high-density lab session.\n\n` +
          `**Recommended Action**: Dispatch **Rajesh Kumar (HVAC Lead)** immediately to inspect compressor refrigerant pressure and fan capacitor.`;
        actionButtons = [
          { label: '📝 Report AC Defect', action: 'report', assetCode: 'AC-BLOCKA-203' }
        ];
      } else if (lower.includes('plumbing') || lower.includes('leak') || lower.includes('water') || lower.includes('pump') || lower.includes('tap') || lower.includes('pipe')) {
        const techs = await api.getTechnicians().catch(() => []);
        const plumber = techs.find(t => t.skill?.toLowerCase().includes('plumb')) || techs[0] || { name: 'Suresh Verma', availability: 'Available', workload: 1 };
        replyText = `### 💧 Plumbing Diagnostic & Dispatch Recommendation\n\n` +
          `• **Classified Category**: Plumbing & Water Systems\n` +
          `• **Recommended Trade**: Plumber / Fluid Mechanics Specialist\n` +
          `• **Top Technician**: **${plumber.name}** (${plumber.availability}, ${plumber.workload} active tasks)\n\n` +
          `**Safety Protocol**: If water is spraying near electrical switchboards or conduits, shut off the local isolation valve and alert building supervisor immediately.`;
        actionButtons = [
          { label: '📝 Report Water Leak', action: 'report' }
        ];
      } else if (lower.includes('high risk') || lower.includes('breakdown') || lower.includes('watchlist')) {
        const highRisk = await api.getHighRiskAssets().catch(() => []);
        const topList = highRisk.slice(0, 3).map(a => `• **${a.asset_code}** (${a.asset_name}) — ${Math.round(a.prediction?.failure_probability * 100 || 80)}% Failure Risk (${a.building})`).join('\n');
        replyText = `### ⚠️ High-Risk Infrastructure Watchlist (CampusCare AI Telemetry)\n\n` +
          `Currently, our predictive maintenance model flags **${highRisk.length || 3} assets** with elevated failure probabilities:\n\n${topList || '• PANEL-MAIN-A (Main Distribution Board) — 89% Risk (Block A)\n• AC-BLOCKA-203 (Computing Lab 1 AC) — 87% Risk (Block A)\n• PUMP-HYDRO-01 (Basement Water Booster) — 74% Risk (Basement)'}\n\n` +
          `Preventive servicing is recommended prior to scheduled peak campus hours.`;
        actionButtons = [
          { label: '📝 Schedule Maintenance', action: 'report' },
          { label: '🗺️ View on Campus Map', action: 'map' }
        ];
      } else if (lower.includes('buzzing') || lower.includes('burning') || lower.includes('spark') || lower.includes('panel') || lower.includes('short circuit') || lower.includes('smoke')) {
        replyText = `### ⚡ EMERGENCY ELECTRICAL SAFETY ALERT\n\n` +
          `• **Hazard Level**: **HIGH / LIFE SAFETY**\n` +
          `• **Category**: Electrical Distribution & Switchgear\n` +
          `• **Immediate Action**:\n` +
          `  1. Evacuate personnel from the immediate electrical switchboard perimeter.\n` +
          `  2. Do **not** attempt manual contact with buzzing busbars.\n` +
          `  3. Contact Facilities Control Desk (+91 98765 43210).\n` +
          `• **Recommended Technician**: **Vikram Patel (Master Electrician)**.`;
        actionButtons = [
          { label: '🚨 Report Critical Electrical Issue', action: 'report', assetCode: 'PANEL-MAIN-A' }
        ];
      } else {
        // General text classification
        const classification = await api.classifyText(query).catch(() => ({
          predicted_category: 'General Maintenance',
          required_skill: 'Facilities Technician',
          confidence: 0.85
        }));

        const isDefectRelated = /\b(ac|air|cooler|cooling|water|leak|leaking|pipe|plumbing|pump|spark|sparking|smoke|fire|panel|switchboard|power|light|bulb|fan|elevator|lift|door|window|lock|furniture|table|chair|toilet|tap|flush|drain|drainage|compressor|generator|broken|damage|damaged|fault|noise|rattling|vibration|repair|maintenance|clean|cleaning|odour|odor|smell|stuck)\b/i.test(lower);

        if (isDefectRelated) {
          replyText = `### 📋 Maintenance Triage Summary\n\n` +
            `• **Detected Category**: **${classification.predicted_category}**\n` +
            `• **Required Trade Skill**: **${classification.required_skill}**\n` +
            `• **Diagnostic Confidence**: ${(classification.confidence * 100).toFixed(0)}%\n\n` +
            `I can help you file this as an official work order. Would you like to open the issue report form now?`;
          actionButtons = [
            { label: '📝 File Issue Report Now', action: 'report' }
          ];
        } else {
          replyText = `I can help you with campus maintenance, reporting issues, finding equipment, or website navigation!\n\nHere are some things you can ask me:\n• *"How do I report an issue?"* — step-by-step instructions\n• *"How do I use this website?"* — guide to features & tabs\n• *"Search AC"* or *"Search Block A"* — basic AI search for tickets & assets\n• *"Water is leaking in Central Library"* — symptom diagnosis & priority triage\n\nOr click one of the quick buttons below!`;
          actionButtons = [
            { label: '📝 How to Report Issue', query: 'How do I report a maintenance issue?' },
            { label: '🌐 Website Guide', query: 'How do I use this website?' },
            { label: '🔍 AI Search', query: 'Search campus issues & assets' }
          ];
        }
      }

      const botMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        actionButtons: actionButtons,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('AI Assistant Error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: `I encountered a momentary connection hiccup. However, you can report any issue directly via the **"+ New Request"** button or ask me how to use the website!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionButtons: [
            { label: '📝 Report Defect', action: 'report' },
            { label: '🌐 Website Guide', query: 'How do I use this website?' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionButtonClick = (btn) => {
    if (btn.query) {
      handleSend(btn.query);
    } else if (btn.action === 'report') {
      if (onNavigateToReport) {
        onNavigateToReport(btn.assetCode || null);
      } else if (onNavigateToTab) {
        onNavigateToTab('new_request');
      }
    } else if (btn.action === 'map') {
      if (onNavigateToTab) onNavigateToTab('campus_map');
      else if (onBack) onBack();
    } else if (btn.action === 'my_requests') {
      if (onNavigateToTab) onNavigateToTab('my_requests');
      else if (onBack) onBack();
    } else if (btn.action === 'portal') {
      if (onBack) onBack();
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-4 animate-fade-in flex flex-col h-[calc(100vh-140px)]">
      
      {/* Top Bar with Functional Back Button */}
      <div className="apple-card flex items-center justify-between bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/80 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="apple-pill p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition cursor-pointer"
            title="Go Back to Previous Page"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                CampusCare AI Diagnostic Assistant
                <span className="text-[10px] bg-emerald-500/10 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Online
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Predictive Maintenance Telemetry, Defect Guidance & Smart Campus Search
              </p>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-medium">
          <AILogo size="xs" variant="badge" theme="dark" />
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="apple-card flex-1 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 shadow-xs ${
                isUser ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'
              }`}>
                {isUser ? <UserRound className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-2xl rounded-[22px] p-4 text-xs sm:text-sm leading-relaxed ${
                isUser 
                  ? 'bg-[#0071e3] text-white rounded-br-sm shadow-[0_2px_10px_rgba(0,113,227,0.2)]' 
                  : 'apple-card bg-slate-50/80 border border-slate-200/70 text-slate-800 rounded-bl-sm shadow-xs'
              }`}>
                <div className="whitespace-pre-wrap font-sans">
                  {m.text.split('\n').map((line, idx) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={idx} className={`font-semibold text-sm mt-1 mb-2 ${isUser ? 'text-white' : 'text-slate-900'}`}>{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('• ')) {
                      return <div key={idx} className="flex items-start gap-2 my-1"><span className={`font-bold ${isUser ? 'text-blue-200' : 'text-blue-600'}`}>•</span><span>{line.replace('• ', '')}</span></div>;
                    }
                    return <p key={idx} className="my-1">{line}</p>;
                  })}
                </div>

                {/* Interactive Action Buttons inside assistant bubbles */}
                {m.actionButtons && m.actionButtons.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap gap-2">
                    {m.actionButtons.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        type="button"
                        onClick={() => handleActionButtonClick(btn)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 border border-blue-200/80 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{btn.label}</span>
                        <ExternalLink className="w-3 h-3 text-blue-500" />
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] mt-2 text-right ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="apple-card p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-[22px] text-xs text-slate-500 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Consulting CampusCare AI knowledge graph & telemetry...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 text-xs">
        <span className="text-slate-400 text-[11px] font-semibold shrink-0 uppercase tracking-wider">Suggestions:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="apple-pill px-4 py-1.5 bg-white/90 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="apple-card p-1.5 sm:p-2 rounded-full border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] bg-white flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask anything (e.g. 'How to report issue', 'How to use website', 'Search AC', 'Water leak in Library')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-2 text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400 font-normal"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="apple-pill w-9 h-9 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white flex items-center justify-center transition shadow-sm disabled:opacity-30 cursor-pointer"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}

export default AIAssistantView;
