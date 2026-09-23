import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  Wrench,
  ArrowRight, 
  Zap, 
  Bot, 
  Sparkles,
  CheckCircle2,
  Activity,
  Layers,
  Building2,
  Clock,
  Shield
} from 'lucide-react';
import { VitLogo } from '../../components/VitLogo';
import { AILogo } from '../../components/AILogo';

export function InstitutionalHome({ onSelectRole, onOpenAIAssistant }) {
  const handleRoleCardClick = (roleKey) => {
    if (onSelectRole) {
      onSelectRole(roleKey);
    }
  };

  const METRICS = [
    { label: "Dispatch Accuracy", value: "99.2%", sub: "Autonomous triage" },
    { label: "Avg. Response Time", value: "42 min", sub: "Priority-driven" },
    { label: "Monitored Assets", value: "10 Units", sub: "Active telemetry" },
    { label: "Section 26 Triage", value: "Real-Time", sub: "Multi-factor model" }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-800 flex flex-col justify-between font-sans selection:bg-blue-500/20">
      
      {/* 1. Apple-Style Frosted Header */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <VitLogo className="h-9" textColor="text-slate-900" />
            <div className="hidden sm:block h-6 w-px bg-slate-200"></div>
            <AILogo size="sm" variant="badge" theme="dark" className="hidden sm:inline-flex" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAIAssistant}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
        
        {/* Main Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Generation Campus Maintenance
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.08]">
            Smart Infrastructure. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Engineered with Intelligence.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed max-w-2xl mx-auto">
            Autonomous defect diagnosis, Section 26 priority dispatch, and transparent resolution tracking across classrooms, research labs, and hostel utilities.
          </p>
        </div>

        {/* 3. Live Metrics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {METRICS.map((m, idx) => (
            <div key={idx} className="apple-card p-5 text-center">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight block">
                {m.value}
              </span>
              <span className="text-xs font-semibold text-slate-700 mt-1 block">
                {m.label}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {m.sub}
              </span>
            </div>
          ))}
        </div>

        {/* 4. Apple-Grade 4 Persona Cards */}
        <div className="space-y-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Select Your Access Portal
            </h2>
            <span className="text-xs text-slate-400">VIT-AP University Institutional Access</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Student Card */}
            <div 
              onClick={() => handleRoleCardClick('student')}
              className="apple-card apple-card-hover p-6 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition duration-200">
                  <GraduationCap className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Student Portal</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Report hostel, classroom, or campus utility faults. Track resolution lifecycle live.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-semibold text-blue-600">
                <span>Enter Portal</span>
                <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Employee / Faculty Card */}
            <div 
              onClick={() => handleRoleCardClick('staff')}
              className="apple-card apple-card-hover p-6 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition duration-200">
                  <Briefcase className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Faculty & Staff</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Expedite departmental equipment, lab facilities, and academic infrastructure requests.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-semibold text-amber-700">
                <span>Enter Portal</span>
                <div className="w-8 h-8 rounded-full bg-amber-50 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Field Technician Card */}
            <div 
              onClick={() => handleRoleCardClick('technician')}
              className="apple-card apple-card-hover p-6 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition duration-200">
                  <Wrench className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Technicians</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  View assigned tasks, required tools & replacement parts, and upload repair evidence.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-semibold text-purple-700">
                <span>Enter Portal</span>
                <div className="w-8 h-8 rounded-full bg-purple-50 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Admin Card */}
            <div 
              onClick={() => handleRoleCardClick('admin')}
              className="apple-card apple-card-hover p-6 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition duration-200">
                  <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Administration</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Predictive telemetry watchlists, Section 26 multi-factor dispatch, and facility audits.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-semibold text-emerald-700">
                <span>Enter Portal</span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 5. Institutional Accreditation & Credentials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          <div className="apple-card p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Vellore Institute of Technology - Andhra Pradesh</h3>
                <p className="text-xs text-slate-400">Institutional Excellence & Credentials</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Ranked No. #1 In Emerging Private Universities in India (Outlook University Rankings-2022, 2023 & 2024)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Outcome Based Education (OBE) Diamond Band (A+) Category in OBE-2023 R-World Institutional Ranking</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Host Institute (HI) under Ministry of Micro, Small & Medium Enterprises (MSME), Government of India</span>
              </div>
            </div>
          </div>

          <div className="apple-card p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Campus Maintenance Intelligence</h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  v2.4 Active
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Powered by autonomous NLP complaint classification, computer-vision photo evidence verification, and Section 26 multi-factor operational priority dispatch.
              </p>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800">
                  <span>30-Day Failure Prediction Telemetry</span>
                  <span className="text-emerald-600">Online</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Continuous sensor and maintenance history monitoring across all campus academic blocks.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Dept. of Computer Science & Business Systems</span>
              <span className="font-mono text-[11px] font-bold text-slate-600">2026–2027</span>
            </div>
          </div>

        </div>

      </main>

      {/* 6. Refined Footer */}
      <footer className="bg-white border-t border-slate-200/60 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Copyright © 2026 Software Development Cell, VIT-AP University. All rights reserved.</span>
          <span className="text-slate-500 font-medium">CampusCare AI • Enterprise Maintenance System</span>
        </div>
      </footer>

    </div>
  );
}

export default InstitutionalHome;
