import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff, Key, RotateCw, ArrowRight, Home, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { VitLogo } from '../../components/VitLogo';
import { useAuth } from '../../context/AuthContext';

function generateRandomCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export function LoginPage({ role = 'student', onLoginSuccess, onGoHome }) {
  const { switchRole, setCurrentUser } = useAuth();

  const getRoleConfig = (r) => {
    switch (r) {
      case 'admin':
        return {
          title: 'Admin portal access',
          defaultId: 'ADM001',
          roleKey: 'admin',
          accent: 'border-t-[#168857]',
          userObj: {
            user_id: 'usr-admin-1',
            name: 'Dr. Sarah Jenkins',
            login_id: 'ADM001',
            email: 'admin@campus.edu',
            role: 'admin',
            department: 'Facilities & Estate Office',
            phone: '+91 98765 43210'
          }
        };
      case 'staff':
      case 'employee':
        return {
          title: 'Employee portal access',
          defaultId: 'STF8820',
          roleKey: 'requester',
          accent: 'border-t-[#d2af00]',
          userObj: {
            user_id: 'usr-faculty-1',
            name: 'Prof. Ramesh Rao',
            login_id: 'STF8820',
            email: 'ramesh.rao@campus.edu',
            role: 'requester',
            department: 'Computer Science & Engineering',
            phone: '+91 98765 22222'
          }
        };
      case 'technician':
        return {
          title: 'Technician portal access',
          defaultId: 'TECH01',
          roleKey: 'technician',
          accent: 'border-t-[#7c3aed]',
          userObj: {
            user_id: 'usr-tech-1',
            technician_id: 'T01',
            name: 'Rajesh Kumar',
            login_id: 'TECH01',
            email: 'tech.rajesh@campus.edu',
            role: 'technician',
            department: 'HVAC Services',
            skill: 'HVAC Maintenance',
            phone: '+91 98765 44441'
          }
        };
      case 'student':
      default:
        return {
          title: 'Student portal access',
          defaultId: 'STU1001',
          roleKey: 'requester',
          accent: 'border-t-[#3894c2]',
          userObj: {
            user_id: 'usr-student-1',
            name: 'Rohan Sharma',
            login_id: 'STU1001',
            email: 'student@campus.edu',
            role: 'requester',
            department: 'Computer Science & Business Systems',
            phone: '+91 98765 11111'
          }
        };
    }
  };

  const config = getRoleConfig(role);

  const [loginId, setLoginId] = useState(config.defaultId);
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState(generateRandomCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Update when role changes
  useEffect(() => {
    const c = getRoleConfig(role);
    setLoginId(c.defaultId);
    setCaptchaText(generateRandomCaptcha());
    setCaptchaInput('');
    setError('');
  }, [role]);

  const handleRefreshCaptcha = () => {
    setCaptchaText(generateRandomCaptcha());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // If user entered captcha, check match (case-insensitive for good UX)
    if (captchaInput.trim() && captchaInput.trim().toUpperCase() !== captchaText) {
      setError('Captcha entered does not match. Please try again.');
      setCaptchaText(generateRandomCaptcha());
      return;
    }

    // Authenticate
    setCurrentUser(config.userObj);
    switchRole(config.roleKey);
    if (onLoginSuccess) {
      onLoginSuccess(config.roleKey, role);
    }
  };

  const handleQuickRoleSelect = (targetRole) => {
    const targetConfig = getRoleConfig(targetRole);
    setLoginId(targetConfig.defaultId);
    if (window.history.pushState) {
      window.history.pushState({}, '', `/login?role=${targetRole}`);
    }
    // Update parent if managed
    if (onGoHome) {
      // Re-trigger with targetRole
    }
  };

  return (
    <div className="min-h-screen bg-[#edf0f5] flex flex-col justify-between font-sans">
      
      {/* Top Header Banner matching Screenshots 2, 3, 4 */}
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
          <div className={`bg-white rounded-md shadow-[0_10px_25px_rgba(0,0,0,0.08)] border border-slate-200 border-t-[4px] ${config.accent} p-7 sm:p-9`}>
            
            {/* Titles */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">
                VTOP Login
              </h1>
              <p className="text-xs text-slate-500 mt-1 capitalize">
                {config.title}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {infoMessage && (
              <div className="mb-5 p-3 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                {infoMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* User ID Field */}
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Enter User ID"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 pr-10 font-medium"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-blue-500">
                  <User className="w-4 h-4 text-blue-500" />
                </div>
              </div>

              {/* Password Field with Eye Toggle */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
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

              {/* Red Captcha Display Box + Green Refresh Button */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="flex-1 max-w-xs bg-slate-50 border border-slate-200 rounded py-2 px-4 flex items-center justify-center shadow-inner select-none tracking-[0.45em] text-red-700 font-extrabold text-xl font-mono">
                  {captchaText.split('').join(' ')}
                </div>
                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  className="w-10 h-10 bg-[#0d7b4e] hover:bg-[#0b6a43] text-white rounded flex items-center justify-center shadow transition cursor-pointer shrink-0"
                  title="Refresh Captcha"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Enter Captcha Field */}
              <div className="relative">
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="ENTER CAPTCHA (A-Z, 0-9)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 pr-10 uppercase font-mono"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-[#1878ee] hover:bg-[#1466cc] text-white text-xs font-bold rounded shadow-sm transition cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Submit</span>
                </button>
              </div>
            </form>

            {/* Links at bottom of card */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
              <div className="flex flex-col gap-1 text-blue-600">
                <button
                  type="button"
                  onClick={() => setInfoMessage('Password reset link has been dispatched to your registered university email.')}
                  className="hover:underline text-left cursor-pointer"
                >
                  Forgot Password
                </button>
                <button
                  type="button"
                  onClick={() => setInfoMessage(`Your default institutional login ID is ${config.defaultId}.`)}
                  className="hover:underline text-left cursor-pointer"
                >
                  Forgot LoginId
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

          {/* Quick Persona Switcher for Evaluation */}
          <div className="mt-5 p-3.5 bg-white/70 backdrop-blur border border-slate-200 rounded-lg text-center text-xs text-slate-600 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Fast Persona Switch for Testing:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginId('STU1001');
                  setCaptchaInput(captchaText);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold border transition cursor-pointer ${
                  role === 'student' ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Student (STU1001)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginId('STF8820');
                  setCaptchaInput(captchaText);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold border transition cursor-pointer ${
                  role === 'staff' || role === 'employee' ? 'bg-amber-50 border-amber-400 text-amber-800 font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Employee (STF8820)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginId('ADM001');
                  setCaptchaInput(captchaText);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold border transition cursor-pointer ${
                  role === 'admin' ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Admin (ADM001)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginId('TECH01');
                  setCaptchaInput(captchaText);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold border transition cursor-pointer ${
                  role === 'technician' ? 'bg-purple-50 border-purple-400 text-purple-800 font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Technician (TECH01)
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
