import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff, Key, RotateCw, ArrowRight, Home, ShieldCheck, CheckCircle2, Sparkles, GraduationCap, Briefcase, Wrench, Shield, Check } from 'lucide-react';
import { VitLogo } from '../../components/VitLogo';
import { useAuth, STUDENT_DATABASE } from '../../context/AuthContext';

function generateRandomCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

const ROLES = [
  { id: 'student', label: 'Student', icon: '🎓', defaultId: 'Bharath', defaultPass: '24bcb7220', title: 'Student portal access', desc: 'Raise requests & track tickets' },
  { id: 'staff', label: 'Faculty', icon: '👨‍🏫', defaultId: 'STF8820', defaultPass: 'password123', title: 'Faculty & staff portal access', desc: 'Departmental defect reporting' },
  { id: 'admin', label: 'Admin', icon: '🛡️', defaultId: 'Koushik', defaultPass: '24bcb7230', title: 'Admin operations & dispatch desk', desc: 'Triage queue & technician assignment' },
  { id: 'technician', label: 'Technician', icon: '🔧', defaultId: 'TECH01', defaultPass: 'password123', title: 'Technician work order access', desc: 'Task execution & completion evidence' }
];

export function LoginPage({ role = 'student', onLoginSuccess, onGoHome }) {
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState(role || 'student');

  const getRoleConfig = (r) => {
    switch (r) {
      case 'admin':
        return {
          title: 'Admin operations & dispatch desk',
          defaultId: 'Koushik',
          defaultPass: '24bcb7230',
          roleKey: 'admin',
          accent: 'border-t-[#168857]',
          helperHint: 'Admin login: Username "Koushik" & Password "24bcb7230"'
        };
      case 'staff':
      case 'faculty':
      case 'employee':
        return {
          title: 'Faculty & staff portal access',
          defaultId: 'STF8820',
          defaultPass: 'password123',
          roleKey: 'staff',
          accent: 'border-t-[#d2af00]',
          helperHint: 'Faculty demo login: STF8820 / password123'
        };
      case 'technician':
        return {
          title: 'Technician work order access',
          defaultId: 'TECH01',
          defaultPass: 'password123',
          roleKey: 'technician',
          accent: 'border-t-[#7c3aed]',
          helperHint: 'Field technician login: TECH01 / password123'
        };
      case 'student':
      default:
        return {
          title: 'Student portal access',
          defaultId: 'Bharath',
          defaultPass: '24bcb7220',
          roleKey: 'student',
          accent: 'border-t-[#3894c2]',
          helperHint: 'Student login: Name (Bharath, Abhiram, Aaron, Balaji, Koushik) & Password = Reg. No.'
        };
    }
  };

  const config = getRoleConfig(selectedRole);

  const [loginId, setLoginId] = useState(config.defaultId);
  const [password, setPassword] = useState(config.defaultPass);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState(generateRandomCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle switching roles
  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    const targetConfig = getRoleConfig(newRole);
    setLoginId(targetConfig.defaultId);
    setPassword(targetConfig.defaultPass);
    setCaptchaText(generateRandomCaptcha());
    setCaptchaInput('');
    setError('');
    setInfoMessage('');
    if (window.history.pushState) {
      window.history.pushState({}, '', `/login?role=${newRole}`);
    }
  };

  // Sync if parent prop role changes
  useEffect(() => {
    if (role && role !== selectedRole) {
      handleRoleChange(role);
    }
  }, [role]);

  // Quick select a registered student
  const handleSelectStudent = (student) => {
    setLoginId(student.name);
    setPassword(student.registration_no);
    setCaptchaInput(captchaText);
    setError('');
    setInfoMessage(`Loaded ${student.name} (${student.registration_no}) credentials with password ready.`);
  };

  // Quick select an admin
  const handleSelectAdmin = (adminName, regNo) => {
    setLoginId(adminName);
    setPassword(regNo);
    setCaptchaInput(captchaText);
    setError('');
    setInfoMessage(`Loaded Administrator credentials for ${adminName} (${regNo}).`);
  };

  // Smart User ID detection
  const handleLoginIdChange = (e) => {
    const val = e.target.value;
    setLoginId(val);
    const upper = val.toUpperCase().trim();
    if (upper.startsWith('ADM') && selectedRole !== 'admin') {
      setSelectedRole('admin');
    } else if ((upper.startsWith('STF') || upper.startsWith('FAC')) && selectedRole !== 'staff') {
      setSelectedRole('staff');
    } else if ((upper.startsWith('TECH') || upper.startsWith('T0')) && selectedRole !== 'technician') {
      setSelectedRole('technician');
    } else if (upper.startsWith('STU') && selectedRole !== 'student') {
      setSelectedRole('student');
    }
  };

  const handleRefreshCaptcha = () => {
    setCaptchaText(generateRandomCaptcha());
    setCaptchaInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    // Captcha is strictly compulsory
    const sanitized = captchaInput.trim().toUpperCase();
    if (!sanitized) {
      setError('Please enter the CAPTCHA code shown in the box.');
      return;
    }
    if (sanitized !== captchaText.toUpperCase()) {
      setError('Incorrect CAPTCHA entered. Please enter matching letters/numbers.');
      setCaptchaText(generateRandomCaptcha());
      setCaptchaInput('');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(loginId, password, selectedRole);
      if (onLoginSuccess) {
        onLoginSuccess(user.role, selectedRole, user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setCaptchaText(generateRandomCaptcha());
      setCaptchaInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf0f5] flex flex-col justify-between font-sans">
      
      {/* Top Header Banner matching VTOP Design */}
      <header className="bg-gradient-to-r from-[#17488f] via-[#1d5aa6] to-[#2068b5] text-white py-3.5 px-6 sm:px-12 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <VitLogo className="h-10" />
            <div className="h-8 w-px bg-white/30 hidden sm:block"></div>
            <div className="text-xs sm:text-sm font-semibold tracking-wide hidden sm:block leading-tight">
              <div className="font-bold text-white tracking-wider text-[11px]">VIT-AP</div>
              <div className="text-[13px] text-blue-100 font-medium">Campus Maintenance System</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-1.5 text-xs text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl">
          
          {/* Card matching VTOP Design */}
          <div className={`bg-white rounded-md shadow-[0_10px_25px_rgba(0,0,0,0.08)] border border-slate-200 border-t-[5px] ${config.accent} p-7 sm:p-9 transition-colors duration-200`}>
            
            {/* Header with Title & Active Role Subtitle */}
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">
                  VTOP Login
                </h1>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  selectedRole === 'admin' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : selectedRole === 'technician' 
                    ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                    : selectedRole === 'staff' 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  {selectedRole}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 capitalize font-medium">
                {config.title}
              </p>
            </div>

            {/* 4-Role Selection Tabs Right at the Top */}
            <div className="mb-5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Select Portal Access Role:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ROLES.map((r) => {
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleChange(r.id)}
                      className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                        isSelected 
                          ? r.id === 'admin'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs ring-2 ring-emerald-500/30'
                            : r.id === 'technician'
                            ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs ring-2 ring-purple-500/30'
                            : r.id === 'staff'
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs ring-2 ring-amber-500/30'
                            : 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs ring-2 ring-blue-500/30'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="text-base">{r.icon}</span>
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Student Database Quick Select Panel */}
            {selectedRole === 'student' && (
              <div className="mb-5 p-3 rounded-lg bg-blue-50/70 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                    Student Database (Click to Auto-fill):
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold">Password = Reg. No</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {STUDENT_DATABASE.map((s) => {
                    const isCurrent = loginId.toLowerCase() === s.name.toLowerCase() || loginId.toLowerCase() === s.registration_no.toLowerCase();
                    return (
                      <button
                        key={s.user_id}
                        type="button"
                        onClick={() => handleSelectStudent(s)}
                        className={`px-2.5 py-1.5 rounded text-left border transition text-xs flex flex-col cursor-pointer active:scale-95 ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                            : 'bg-white hover:bg-blue-100/60 text-slate-700 border-blue-200'
                        }`}
                      >
                        <span className="font-bold flex items-center justify-between">
                          {s.name}
                          {isCurrent && <Check className="w-3 h-3 text-white" />}
                        </span>
                        <span className={`text-[10px] font-mono ${isCurrent ? 'text-blue-100' : 'text-blue-600'}`}>
                          {s.registration_no}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Admin Database Quick Select Panel */}
            {selectedRole === 'admin' && (
              <div className="mb-5 p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-700" />
                    Administrator Account:
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Password = 24bcb7230</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAdmin('Koushik', '24bcb7230')}
                    className={`px-3 py-2 rounded text-left border transition text-xs flex flex-col cursor-pointer active:scale-95 ${
                      loginId.toLowerCase() === 'koushik' || loginId.toLowerCase() === '24bcb7230'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-white hover:bg-emerald-100/60 text-slate-700 border-emerald-300'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      Koushik (Admin)
                      {(loginId.toLowerCase() === 'koushik' || loginId.toLowerCase() === '24bcb7230') && <Check className="w-3.5 h-3.5 text-white" />}
                    </span>
                    <span className={`text-[10px] font-mono ${(loginId.toLowerCase() === 'koushik' || loginId.toLowerCase() === '24bcb7230') ? 'text-emerald-100' : 'text-emerald-700'}`}>
                      User: Koushik / Reg: 24bcb7230
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAdmin('ADM001', 'password123')}
                    className={`px-3 py-2 rounded text-left border transition text-xs flex flex-col cursor-pointer active:scale-95 ${
                      loginId.toUpperCase() === 'ADM001'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-white hover:bg-emerald-100/60 text-slate-700 border-emerald-300'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      Dr. Sarah Jenkins
                      {loginId.toUpperCase() === 'ADM001' && <Check className="w-3.5 h-3.5 text-white" />}
                    </span>
                    <span className={`text-[10px] font-mono ${loginId.toUpperCase() === 'ADM001' ? 'text-emerald-100' : 'text-emerald-700'}`}>
                      ID: ADM001
                    </span>
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
                {error}
              </div>
            )}

            {infoMessage && (
              <div className="mb-5 p-3 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold animate-in fade-in flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* User ID Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Username / Registration No.
                  </label>
                  <span className="text-[10px] text-slate-400">e.g. Bharath or 24bcb7220</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={handleLoginIdChange}
                    placeholder="Enter Name or Reg No (e.g. Bharath, 24bcb7220)"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 pr-10 font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-blue-500">
                    <User className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Password Field with Eye Toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-400">Registration number for students</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Registration No. (e.g. 24bcb7220)"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 pr-10 tracking-widest font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-rose-500 hover:text-rose-600 transition cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-rose-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Red Captcha Display Box + Green Refresh Button */}
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Verification Code (CAPTCHA)
                </label>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex-1 max-w-xs bg-slate-50 border border-slate-200 rounded py-2 px-4 flex items-center justify-center shadow-inner select-none tracking-[0.45em] text-red-700 font-extrabold text-xl font-mono">
                    {captchaText.split('').join(' ')}
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshCaptcha}
                    className="w-10 h-10 bg-[#0d7b4e] hover:bg-[#0b6a43] text-white rounded flex items-center justify-center shadow-sm transition cursor-pointer shrink-0"
                    title="Generate New Captcha"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Enter Captcha Field */}
              <div className="relative">
                <input
                  type="text"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  placeholder="ENTER CAPTCHA (A-Z, 0-9)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 pr-10 uppercase font-mono tracking-wider"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Auto-fill helper for convenience */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                <span>Auto-converts to uppercase</span>
                <button
                  type="button"
                  onClick={() => setCaptchaInput(captchaText)}
                  className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                >
                  Auto-fill CAPTCHA ⚡
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-7 py-2.5 bg-[#1878ee] hover:bg-[#1466cc] text-white text-xs font-bold rounded shadow-sm transition cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Verifying...' : `Login as ${selectedRole.toUpperCase()}`}</span>
                </button>
              </div>
            </form>

            {/* Links at bottom of card */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
              <div className="flex flex-col gap-1 text-blue-600">
                <button
                  type="button"
                  onClick={() => setInfoMessage('For students, password is your Registration Number. For Admin Koushik, password is "24bcb7230".')}
                  className="hover:underline text-left cursor-pointer"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => setInfoMessage('Your username is your Name (e.g. Bharath) or Registration No. (e.g. 24bcb7220).')}
                  className="hover:underline text-left cursor-pointer"
                >
                  Forgot LoginId?
                </button>
              </div>

              <button
                type="button"
                onClick={onGoHome}
                className="text-[#0d7b4e] hover:text-[#0b6a43] italic underline cursor-pointer"
              >
                Go to Home Page
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Footer matching reference portal */}
      <footer className="bg-[#17488f] text-white py-3 text-center text-xs text-blue-200 font-normal">
        Copyright © 2026 Software Development Cell, VIT-AP University, Andhra Pradesh-522241.
      </footer>

    </div>
  );
}

export default LoginPage;
