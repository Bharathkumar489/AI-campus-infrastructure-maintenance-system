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
  UserRound
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AILogo } from '../../components/AILogo';

const QUICK_PROMPTS = [
  "Draft a failure report for AC in Block A Room 203",
  "How urgent is a buzzing sound and burning odor from LT Panel?",
  "Who is the best available technician for plumbing leaks?",
  "Which campus assets are currently at high risk of breakdown?"
];

export function AIAssistantView({ onBack, onNavigateToReport }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello ${currentUser?.name || 'there'}! I am **CampusCare AI**, your intelligent campus infrastructure diagnostic assistant.\n\nI can help you:\n• Diagnose equipment symptoms & estimate failure risk\n• Auto-draft maintenance requests with recommended priority\n• Check technician workloads & recommended trade skills\n• Inspect high-risk infrastructure across campus buildings\n\nHow can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
      // Analyze text via backend classifier and AI predictor
      const classification = await api.classifyText(query);
      
      let replyText = '';
      const lower = query.toLowerCase().trim();

      // 1. Check for Natural Greetings & Conversational Queries
      const isGreeting = /^(hello|hi|hey|good\s*(morning|afternoon|evening|day)|greetings|namaste|howdy|yo|sup)\b/i.test(lower) || lower === 'hi' || lower === 'hello' || lower === 'hey';
      const isIdentityOrHelp = /^(who\s*are\s*you|what\s*are\s*you|what\s*can\s*you\s*do|what\s*do\s*you\s*do|help|help\s*me|features|how\s*does\s*this\s*work|how\s*to\s*use)\b/i.test(lower);
      const isGratitudeOrClosing = /^(thanks|thank\s*you|thx|bye|goodbye|ok|okay|cool|great|awesome|got\s*it|understood)\b/i.test(lower);
      const isStatusQuery = /^(how\s*are\s*you|what'?s\s*up)\b/i.test(lower);

      if (isGreeting) {
        replyText = `👋 **Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}!**\n\nI am **CampusCare AI**, your campus maintenance diagnostic assistant. I'm ready to help!\n\nYou can chat with me to:\n• **Diagnose equipment issues** (e.g. *"AC in Block A is not cooling"* or *"water leak in restroom"*)\n• **Check high-risk equipment** across campus buildings\n• **Find recommended technicians** for any maintenance category\n• **Evaluate failure urgency & Section 26 priority**\n\nIs there an equipment defect or maintenance issue you would like me to look into?`;
      } else if (isIdentityOrHelp) {
        replyText = `🤖 **About CampusCare AI Diagnostic Assistant**\n\nI am the intelligent diagnostic and automated triage assistant built for VIT-AP University campus maintenance.\n\n**What I can do for you**:\n1. 🔍 **Defect Diagnosis**: Tell me symptoms (e.g. rattling noises, warm air, dripping water), and I will identify the equipment, failure risk, and required trade.\n2. ⚡ **Safety Emergency Triage**: Mention hazards like electrical sparking or smoke for immediate safety protocols.\n3. 👨‍🔧 **Technician Matching**: Recommend the best candidate using Section 29 multi-factor ranking.\n4. 🏢 **Asset Risk Telemetry**: Review 30-day failure probabilities for campus equipment.\n\nFeel free to describe any issue or click one of the quick suggestions below!`;
      } else if (isStatusQuery) {
        replyText = `I'm running optimally and monitoring all 10 campus critical assets! Predictive telemetry and Section 26 priority models are active.\n\nWhat campus equipment or maintenance topic would you like to discuss?`;
      } else if (isGratitudeOrClosing) {
        replyText = `You're very welcome! 😊\n\nIf you spot any infrastructure faults or equipment anomalies around campus, feel free to reach out anytime. Have a great day!`;
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
      } else if (lower.includes('plumbing') || lower.includes('leak') || lower.includes('water') || lower.includes('pump') || lower.includes('tap') || lower.includes('pipe')) {
        const techs = await api.getTechnicians();
        const plumber = techs.find(t => t.skill.includes('Plumbing')) || techs[0];
        replyText = `### 💧 Plumbing Diagnostic & Dispatch Recommendation\n\n` +
          `• **Classified Category**: Plumbing & Water Systems\n` +
          `• **Recommended Trade**: Plumber / Fluid Mechanics Specialist\n` +
          `• **Top Technician**: **${plumber.name}** (${plumber.availability}, ${plumber.workload} active tasks)\n\n` +
          `**Safety Protocol**: If water is spraying near electrical switchboards or conduits, shut off the local isolation valve and alert building supervisor immediately.`;
      } else if (lower.includes('high risk') || lower.includes('breakdown') || lower.includes('assets') || lower.includes('watchlist')) {
        const highRisk = await api.getHighRiskAssets();
        const top3 = highRisk.slice(0, 3).map(a => `• **${a.asset_code}** (${a.asset_name}) — ${Math.round(a.prediction.failure_probability * 100)}% Failure Probability (${a.building})`).join('\n');
        replyText = `### ⚠️ High-Risk Infrastructure Watchlist (CampusCare AI Telemetry)\n\n` +
          `Currently, our predictive maintenance model flags **${highRisk.length} assets** exceeding the 70% failure threshold:\n\n${top3}\n\n` +
          `Preventive servicing is recommended prior to scheduled peak campus events.`;
      } else if (lower.includes('buzzing') || lower.includes('burning') || lower.includes('spark') || lower.includes('panel') || lower.includes('short circuit') || lower.includes('smoke')) {
        replyText = `### ⚡ EMERGENCY ELECTRICAL SAFETY ALERT\n\n` +
          `• **Hazard Level**: **HIGH / LIFE SAFETY**\n` +
          `• **Category**: Electrical Distribution & Switchgear\n` +
          `• **Immediate Action**:\n` +
          `  1. Evacuate personnel from the immediate electrical switchboard perimeter.\n` +
          `  2. Do **not** attempt manual contact with buzzing busbars.\n` +
          `  3. Contact Facilities Control Desk (+91 98765 43210).\n` +
          `• **Recommended Technician**: **Vikram Patel (Master Electrician)**.`;
      } else {
        // Check if query sounds like a defect description
        const isDefectRelated = /\b(ac|air|cooler|cooling|water|leak|leaking|pipe|plumbing|pump|spark|sparking|smoke|fire|panel|switchboard|power|light|bulb|fan|elevator|lift|door|window|lock|furniture|table|chair|toilet|tap|flush|drain|drainage|compressor|generator|broken|damage|damaged|fault|noise|rattling|vibration|repair|maintenance|clean|cleaning|odour|odor|smell|stuck)\b/i.test(lower);

        if (isDefectRelated) {
          replyText = `### 📋 Maintenance Triage Summary\n\n` +
            `• **Detected Category**: **${classification.predicted_category}**\n` +
            `• **Required Trade Skill**: **${classification.required_skill}**\n` +
            `• **Diagnostic Confidence**: ${(classification.confidence * 100).toFixed(0)}%\n\n` +
            `I can help you file this as an official work order. Would you like me to populate the complaint form with these parameters?`;
        } else {
          replyText = `I didn't detect a specific equipment fault in your message.\n\nCould you describe what is malfunctioning? For example:\n• *"Water is leaking from the ceiling in Central Library"*\n• *"Split AC in Block B Room 102 is blowing warm air"*\n• *"Elevator in Technology Tower is vibrating abnormally"*\n\nOr click one of the suggested prompts below to explore!`;
        }
      }

      const botMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        category: classification.predicted_category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: 'I encountered an error analyzing that query. Please try again or submit a ticket directly through the portal.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-4 animate-fade-in flex flex-col h-[calc(100vh-140px)]">
      
      {/* Top Bar */}
      <div className="apple-card flex items-center justify-between bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/80 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="apple-pill p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition cursor-pointer"
            title="Back to Dashboard"
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
                Predictive Maintenance Telemetry & Automated Triage Engine
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
              Evaluating asset telemetry & maintenance knowledge graph...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
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

      {/* Apple Messages Style Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="apple-card p-1.5 sm:p-2 rounded-full border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] bg-white flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask anything (e.g. 'AC leaking water in Block A', 'Who is available for electrical repair?')..."
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
