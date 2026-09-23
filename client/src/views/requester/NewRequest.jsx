import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Building2, 
  Camera, 
  Sliders, 
  Cpu,
  ShieldAlert,
  Wrench,
  Activity,
  CheckCircle2,
  RefreshCw,
  Zap,
  Flame,
  ArrowRight,
  ThumbsUp,
  Award
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { RiskBadge } from '../../components/RiskBadge';
import { PriorityBadge } from '../../components/PriorityBadge';

const DEMO_SCENARIOS = [
  {
    label: 'Electrical Sparking (Critical)',
    icon: Zap,
    accent: 'border-rose-300 bg-rose-50/50 text-rose-800 hover:bg-rose-100',
    title: 'Main LT distribution panel sparking and buzzing loudly',
    description: 'The main electrical switchboard on the ground floor is emitting continuous electrical sparks and a strong burning plastic odor. Sparks are visible near the circuit breaker.',
    location: 'Block A / Ground Floor Electrical Room',
    assetCode: 'PANEL-MAIN-A'
  },
  {
    label: 'AC Breakdown in Lab 1 (High)',
    icon: Flame,
    accent: 'border-amber-300 bg-amber-50/50 text-amber-900 hover:bg-amber-100',
    title: 'AC unit blowing warm air with severe compressor vibration',
    description: 'The Daikin split air conditioner in Computing Lab 1 is blowing warm air and vibrating noisily with water condensation dripping onto desks. 60 students currently attending programming lab.',
    location: 'Block A / Room 203 (Computing Lab 1)',
    assetCode: 'AC-BLOCKA-203'
  },
  {
    label: 'Water Booster Pump Leak (High)',
    icon: AlertTriangle,
    accent: 'border-blue-300 bg-blue-50/50 text-blue-900 hover:bg-blue-100',
    title: 'Hydro booster pump pipe burst and water flooding',
    description: 'High pressure water booster pump in the pump house basement is leaking heavily from the flange coupling with water gushing across the basement floor.',
    location: 'Boys Hostel / Pump House 1 Basement',
    assetCode: 'PUMP-HYDRO-01'
  },
  {
    label: 'Loose Chair Armrest (Low)',
    icon: CheckCircle2,
    accent: 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100',
    title: 'Student desk chair armrest screw loose',
    description: 'One student wooden chair near the back of classroom 102 has a loose armrest screw. Still usable but slightly wobbly.',
    location: 'Block B / Room 102',
    assetCode: ''
  }
];

export function NewRequest({ onSuccess, initialAssetCode }) {
  const { currentUser } = useAuth();
  const [assets, setAssets] = useState([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState(3);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Core AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiManualOverride, setAiManualOverride] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(null);

  // Proximity & Duplicate Detection State (CivicPulse Adaptation)
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [upvoteMessage, setUpvoteMessage] = useState('');

  const debounceTimeout = useRef(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const list = await api.getAssets();
      setAssets(list || []);
      if (initialAssetCode) {
        const found = list.find(a => a.asset_code === initialAssetCode);
        if (found) {
          setSelectedAssetId(found.asset_id);
          setLocation(`${found.building} / ${found.location}`);
          setCategory(found.asset_type);
        }
      }
    } catch (err) {
      console.error('Failed to load assets in NewRequest:', err);
    }
  };

  // Trigger AI Equipment Detection & Criticality Analysis
  const runAIAnalysis = async (customText = null, customLocation = null, customImage = null) => {
    const textToAnalyze = customText !== null ? customText : `${title} ${description}`.trim();
    const locToAnalyze = customLocation !== null ? customLocation : location;
    const imgToAnalyze = customImage !== null ? customImage : imageFile;

    if (textToAnalyze.length < 5 && !imgToAnalyze) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await api.analyzeComplaint({
        title: title || '',
        description: textToAnalyze,
        location: locToAnalyze || '',
        imageFile: imgToAnalyze
      });

      if (result && result.success) {
        setAiAnalysis(result);

        // 1. Auto-link equipment asset if found and not manually overridden
        let linkedAssetId = selectedAssetId;
        if (result.equipment && result.equipment.matched_asset && !aiManualOverride) {
          const matched = result.equipment.matched_asset;
          linkedAssetId = matched.asset_id;
          setSelectedAssetId(matched.asset_id);
          if (!location.trim()) {
            setLocation(`${matched.building} / ${matched.location}`);
          }
          if (!category) {
            setCategory(matched.asset_type);
          }
        } else if (result.equipment && result.equipment.category && !category) {
          setCategory(result.equipment.category);
        }

        // 2. Auto-set criticality and severity
        if (result.criticality && !aiManualOverride) {
          setSeverity(result.criticality.severity);
        }

        // 3. Proximity & Duplicate Check (Adapted from Reference)
        try {
          const dupRes = await api.checkDuplicate({
            asset_id: linkedAssetId || '',
            asset_code: result.equipment?.matched_asset?.asset_code || '',
            location: locToAnalyze || '',
            title: title || '',
            category: category || result.equipment?.category || ''
          });
          if (dupRes && dupRes.isDuplicate) {
            setDuplicateInfo(dupRes);
          } else {
            setDuplicateInfo(null);
          }
        } catch (dupErr) {
          console.warn('Duplicate check error:', dupErr);
        }
      }
    } catch (err) {
      console.error('AI complaint analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpvoteExisting = async () => {
    if (!duplicateInfo?.matchedRequest?.request_id) return;
    setIsUpvoting(true);
    try {
      const res = await api.upvoteRequest(duplicateInfo.matchedRequest.request_id, currentUser.user_id);
      setUpvoteMessage(`✓ Upvote Registered! Priority boosted to ${res.new_priority_score.toFixed(1)} (${res.new_priority_level}). You earned +5 PTS!`);
      setTimeout(() => {
        setDuplicateInfo(null);
        if (onSuccess) onSuccess(duplicateInfo.matchedRequest.request_id);
      }, 2500);
    } catch (err) {
      alert('Failed to upvote: ' + err.message);
    } finally {
      setIsUpvoting(false);
    }
  };

  // Debounced auto-analysis as user types
  const handleTextChange = (field, value) => {
    if (field === 'title') setTitle(value);
    if (field === 'description') setDescription(value);

    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      const combined = field === 'title' ? `${value} ${description}` : `${title} ${value}`;
      if (combined.trim().length >= 8) {
        runAIAnalysis(combined);
      }
    }, 600);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Trigger AI analysis with new image
      runAIAnalysis(null, null, file);
    }
  };

  const handleLoadScenario = (scenario) => {
    setTitle(scenario.title);
    setDescription(scenario.description);
    setLocation(scenario.location);
    setAiManualOverride(false);

    // Find and set asset if known
    if (scenario.assetCode) {
      const found = assets.find(a => a.asset_code === scenario.assetCode);
      if (found) {
        setSelectedAssetId(found.asset_id);
        setCategory(found.asset_type);
      }
    }

    // Run AI analysis immediately for this scenario
    runAIAnalysis(`${scenario.title} ${scenario.description}`, scenario.location);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Please enter a complaint title and description.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('user_id', currentUser.user_id);
      if (selectedAssetId) formData.append('asset_id', selectedAssetId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category || (aiAnalysis?.equipment?.category) || 'General');
      formData.append('severity', severity);
      formData.append('location', location || (aiAnalysis?.equipment?.matched_asset ? `${aiAnalysis.equipment.matched_asset.building} / ${aiAnalysis.equipment.matched_asset.location}` : 'Campus Facility'));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.createRequest(formData);
      setSubmittedSuccess(res);
      if (onSuccess) {
        setTimeout(() => onSuccess(res.request.request_id), 2500);
      }
    } catch (err) {
      alert('Failed to submit request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedAssetId('');
    setCategory('');
    setSeverity(3);
    setLocation('');
    setImageFile(null);
    setImagePreview(null);
    setAiAnalysis(null);
    setAiManualOverride(false);
    setSubmittedSuccess(null);
  };

  // 1. Success Confirmation View with AI Analysis Recap
  if (submittedSuccess) {
    const { request, ai_assessment } = submittedSuccess;
    return (
      <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-emerald-100 text-center animate-fade-in my-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-1">
          Maintenance Ticket Registered!
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Ticket ID: <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{request.request_id}</span>
        </p>

        {/* AI Analysis Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left mb-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> AI Diagnostic & Equipment Discovery Summary
            </span>
            <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
              CampusCare AI Diagnostic Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Detected Equipment */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Identified Equipment & Asset</span>
              <div className="font-bold text-slate-900 text-sm">
                {request.asset_code || aiAnalysis?.equipment?.matched_asset?.asset_code || 'General Facility'}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                {request.asset_name || aiAnalysis?.equipment?.detected_name || 'Campus Infrastructure'}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                ✓ Equipment Auto-Identified from Description
              </div>
            </div>

            {/* AI Criticality & Priority */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Assessed Criticality & Priority</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-black ${
                  request.priority_level === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                  request.priority_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {request.priority_level} CRITICALITY
                </span>
                <span className="font-mono font-bold text-slate-800">
                  Score: {request.priority_score?.toFixed(1)} / 100
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Failure Risk: <strong>{Math.round((request.failure_probability || 0.5) * 100)}%</strong> • Severity: <strong>{request.severity}/5</strong>
              </div>
            </div>
          </div>

          {aiAnalysis?.criticality?.reasoning && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-950">
              <strong className="block text-[11px] uppercase tracking-wider text-blue-800 font-bold mb-0.5">
                AI Explainable Rationale:
              </strong>
              <p className="leading-relaxed">{aiAnalysis.criticality.reasoning}</p>
            </div>
          )}
        </div>

        <button
          onClick={resetForm}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer"
        >
          Submit Another Maintenance Complaint
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-fade-in">
      
      {/* Apple-Grade Clean Header */}
      <div className="text-left space-y-2 mb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/70 text-slate-700 text-[11px] font-semibold tracking-wide backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>CampusCare AI Equipment Discovery & Triage</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Report Infrastructure Issue
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl font-normal leading-relaxed">
          Describe the defect or attach a photo. CampusCare AI automatically identifies the equipment, links the campus asset code, and estimates operational failure risk.
        </p>
      </div>

      {/* 4 1-Click Evaluation Scenarios */}
      <div className="apple-card p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          Instant Evaluation Scenarios (Click to test AI Detection):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEMO_SCENARIOS.map((scen, idx) => {
            const Icon = scen.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadScenario(scen)}
                className="apple-card apple-card-hover flex items-start gap-2.5 p-3.5 rounded-2xl border border-slate-200/70 text-left transition-all cursor-pointer bg-slate-50/60 hover:bg-white"
              >
                <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-slate-800">{scen.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{scen.title}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duplicate Ticket Alert Banner (CivicPulse Proximity Adaptation) */}
      {duplicateInfo && duplicateInfo.isDuplicate && duplicateInfo.matchedRequest && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-3 text-xs text-amber-950 animate-in fade-in shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Active Issue Already Reported Here!</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
              {duplicateInfo.matchType === 'EXACT_ASSET' ? 'Identical Equipment' : 'Proximity Match'} • {Math.round(duplicateInfo.similarityScore * 100)}% Similarity
            </span>
          </div>

          <p className="leading-relaxed text-amber-900 font-medium">
            {duplicateInfo.reason}
          </p>

          <div className="bg-white/80 p-3 rounded-lg border border-amber-200 flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="font-bold text-slate-800">
                Ticket: <span className="font-mono text-blue-700">{duplicateInfo.matchedRequest.request_id}</span> • {duplicateInfo.matchedRequest.title}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Current Priority: <strong className="text-amber-900">{duplicateInfo.matchedRequest.priority_level} ({duplicateInfo.matchedRequest.priority_score?.toFixed(1)})</strong> • Community Upvotes: <strong>{duplicateInfo.matchedRequest.upvotes || 1}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUpvoteExisting}
              disabled={isUpvoting}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{isUpvoting ? 'Recording Upvote...' : 'Upvote Existing Issue (+5 PTS)'}</span>
            </button>
          </div>

          {upvoteMessage && (
            <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-lg text-xs">
              {upvoteMessage}
            </div>
          )}
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="apple-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Complaint Title & Detailed Description */}
          <div className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Complaint Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AC unit leaking warm air, Sparking in electrical box..."
                value={title}
                onChange={(e) => handleTextChange('title', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Detailed Problem Description *
                </label>
                <button
                  type="button"
                  onClick={() => runAIAnalysis()}
                  disabled={isAnalyzing}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition"
                >
                  <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Analyzing AI...' : 'Run AI Analysis'}</span>
                </button>
              </div>
              <textarea
                rows="5"
                required
                placeholder="Describe what you see or hear: symptoms, strange sounds, water leaks, smoke, or impact on classes/labs. The AI will find the equipment and analyze criticality automatically..."
                value={description}
                onChange={(e) => handleTextChange('description', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                💡 Tip: Mentioning room details (e.g. "Lab 1", "Room 203", "Block A") helps AI pinpoint the exact campus asset.
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Location / Room
              </label>
              <input
                type="text"
                placeholder="e.g. Block A / Room 203 (Computing Lab 1)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

          </div>

          {/* Right Column: Photo Upload & AI Detection Panel */}
          <div className="space-y-4">
            
            {/* Photo Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Upload Photo Evidence (Computer Vision Defect Analysis)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-500/60 rounded-2xl p-5 cursor-pointer bg-slate-50/50 hover:bg-white transition-all">
                  <Camera className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Click or Drag Photo to Analyze</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">AI scans for water leaks, cracks, sparks & burn marks</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imagePreview && (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                    <img src={imagePreview} alt="Defect" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Prominent Live AI Analysis Card */}
            <div className={`apple-card p-5 rounded-2xl border transition-all duration-300 ${
              aiAnalysis?.criticality?.level === 'CRITICAL' ? 'bg-rose-50/50 border-rose-200' :
              aiAnalysis?.criticality?.level === 'HIGH' ? 'bg-orange-50/50 border-orange-200' :
              aiAnalysis ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50/70 border-slate-200/80'
            }`}>
              
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>AI Equipment & Criticality Engine</span>
                </div>
                {isAnalyzing ? (
                  <span className="text-[10px] font-semibold text-blue-600 animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Processing AI...
                  </span>
                ) : aiAnalysis ? (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    Analysis Ready
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">
                    Auto-analyzes as you type
                  </span>
                )}
              </div>

              {aiAnalysis ? (
                <div className="space-y-3 text-xs">
                  
                  {/* 1. Detected Equipment & Matched Asset */}
                  <div className="apple-card bg-white p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      <span>Detected Equipment</span>
                      <span className="text-blue-600 font-semibold">
                        {Math.round(aiAnalysis.equipment.confidence * 100)}% Match
                      </span>
                    </div>

                    <div className="font-semibold text-slate-900 text-sm">
                      {aiAnalysis.equipment.detected_name}
                    </div>

                    {aiAnalysis.equipment.matched_asset ? (
                      <div className="mt-2 p-2.5 bg-emerald-50/80 border border-emerald-200/70 rounded-xl flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-mono font-semibold text-emerald-900 block">
                            {aiAnalysis.equipment.matched_asset.asset_code}
                          </span>
                          <span className="text-emerald-700">
                            {aiAnalysis.equipment.matched_asset.asset_name} ({aiAnalysis.equipment.matched_asset.building})
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-full shrink-0">
                          Auto-Linked
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 mt-1">
                        Equipment category: <strong>{aiAnalysis.equipment.category}</strong>
                      </div>
                    )}
                  </div>

                  {/* 2. Assessed Criticality & Severity */}
                  <div className="apple-card bg-white p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      <span>Criticality & Triage</span>
                      <span>Severity Level: {aiAnalysis.criticality.severity}/5</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        aiAnalysis.criticality.level === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                        aiAnalysis.criticality.level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {aiAnalysis.criticality.level}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        Score: {aiAnalysis.criticality.priority_score?.toFixed(1)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Risk: {Math.round(aiAnalysis.criticality.failure_risk * 100)}%
                      </span>
                    </div>

                    {/* AI Reasoning */}
                    <p className="text-[11px] text-slate-600 italic bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      &quot;{aiAnalysis.criticality.reasoning}&quot;
                    </p>

                    <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between font-medium">
                      <span>Routing: <strong>{aiAnalysis.routing.recommended_skill}</strong></span>
                      <span className="font-mono">{aiAnalysis.routing.urgency_status}</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Cpu className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                  <p className="max-w-xs mx-auto">Type above or click a scenario to view real-time AI equipment discovery & criticality analysis</p>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Optional Manual Overrides Accordion */}
        <div className="border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setAiManualOverride(!aiManualOverride)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{aiManualOverride ? 'Hide Manual Adjustments' : 'Optional: Override Equipment or Severity Manually'}</span>
          </button>

          {aiManualOverride && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                  Manual Asset Selection
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => {
                    setSelectedAssetId(e.target.value);
                    const chosen = assets.find(a => a.asset_id === e.target.value);
                    if (chosen) setLocation(`${chosen.building} / ${chosen.location}`);
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                >
                  <option value="">-- Let AI Auto-Select Asset --</option>
                  {assets.map(a => (
                    <option key={a.asset_id} value={a.asset_id}>
                      {a.asset_code} — {a.asset_name} ({a.building})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-semibold text-slate-600 uppercase">
                    Manual Severity Slider
                  </label>
                  <span className="font-semibold text-blue-700">Level {severity} of 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="apple-pill flex items-center gap-2 px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Submitting & Dispatching AI...' : 'Submit Maintenance Request'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
