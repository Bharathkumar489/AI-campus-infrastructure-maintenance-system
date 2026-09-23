import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Search, 
  Crosshair, 
  Activity, 
  PlusCircle, 
  ChevronRight, 
  Sparkles,
  Zap,
  Wrench,
  Flame,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { api } from '../../services/api';

const CAMPUS_BUILDINGS = [
  {
    id: 'bldg-a',
    name: 'Block A (Academic & Computing)',
    code: 'BLOCK-A',
    description: 'Computer Science Labs, Department of CSBS, Smart Classrooms 101-305',
    x: 28, // Percentage for architectural layout
    y: 32,
    type: 'Academic',
    floors: 5,
    gps: '16.4971° N, 80.4988° E'
  },
  {
    id: 'bldg-b',
    name: 'Block B (Engineering & Chemistry)',
    code: 'BLOCK-B',
    description: 'Seminar Hall 1, Chemistry Research Labs, Mechanical Workshops',
    x: 48,
    y: 28,
    type: 'Academic',
    floors: 5,
    gps: '16.4975° N, 80.4996° E'
  },
  {
    id: 'bldg-c',
    name: 'Block C (Administration & Lecture Theatres)',
    code: 'BLOCK-C',
    description: 'Deans Offices, Central Otis Elevator Shaft, Multi-purpose Auditoriums',
    x: 68,
    y: 35,
    type: 'Academic',
    floors: 6,
    gps: '16.4968° N, 80.5008° E'
  },
  {
    id: 'bldg-lib',
    name: 'Central Library',
    code: 'LIBRARY',
    description: '3-Storey Central Learning Resource Center, Digital Study Halls',
    x: 35,
    y: 60,
    type: 'Facility',
    floors: 3,
    gps: '16.4958° N, 80.4991° E'
  },
  {
    id: 'bldg-tt',
    name: 'Technology Tower',
    code: 'TECH-TOWER',
    description: 'Software Development Cell, Innovation Hub & High-Performance Server Racks',
    x: 55,
    y: 56,
    type: 'Research',
    floors: 7,
    gps: '16.4962° N, 80.5002° E'
  },
  {
    id: 'bldg-hostel-b',
    name: 'Boys Hostel Complex',
    code: 'BOYS-HOSTEL',
    description: 'Residential Blocks 1-4, Hydro Booster Pump House in Basement',
    x: 18,
    y: 75,
    type: 'Residential',
    floors: 9,
    gps: '16.4945° N, 80.4975° E'
  },
  {
    id: 'bldg-gate',
    name: 'Campus Main Gate 1 & Security',
    code: 'MAIN-GATE',
    description: 'Security Command Center, 4K PTZ Surveillance & Turnstiles',
    x: 82,
    y: 72,
    type: 'Security',
    floors: 1,
    gps: '16.4950° N, 80.5020° E'
  },
  {
    id: 'bldg-substation',
    name: 'Main 33kV Electrical Substation & DG Yard',
    code: 'SUBSTATION',
    description: 'Primary Transformers, Heavy Distribution Switchgear & 1000kVA DG',
    x: 80,
    y: 20,
    type: 'Utility',
    floors: 1,
    gps: '16.4982° N, 80.5015° E'
  }
];

export function CampusMapView({ onReportAtLocation, onSelectRequest }) {
  const [assets, setAssets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState(CAMPUS_BUILDINGS[0]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const [assetsData, requestsData] = await Promise.all([
        api.getAssets(),
        api.getRequests()
      ]);
      setAssets(assetsData || []);
      setRequests(requestsData || []);
    } catch (err) {
      console.error('Failed to load campus map data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute building health status
  const getBuildingStats = (bldg) => {
    const bldgAssets = assets.filter(a => 
      (a.building || '').toLowerCase().includes(bldg.name.toLowerCase().split(' ')[0].toLowerCase()) ||
      (a.location || '').toLowerCase().includes(bldg.code.toLowerCase()) ||
      (a.building || '').toLowerCase().includes(bldg.code.toLowerCase())
    );

    const bldgRequests = requests.filter(r => 
      ['submitted', 'in_progress', 'assigned'].includes(r.status) && (
        (r.location || '').toLowerCase().includes(bldg.name.toLowerCase().split(' ')[0].toLowerCase()) ||
        (r.location || '').toLowerCase().includes(bldg.code.toLowerCase()) ||
        bldgAssets.some(a => a.asset_id === r.asset_id)
      )
    );

    const hasCritical = bldgRequests.some(r => r.priority_level === 'CRITICAL');
    const hasHigh = bldgRequests.some(r => r.priority_level === 'HIGH' || r.risk_level === 'HIGH');

    let status = 'NORMAL';
    if (hasCritical) status = 'CRITICAL';
    else if (hasHigh || bldgRequests.length > 0) status = 'WARNING';

    return {
      assets: bldgAssets,
      activeRequests: bldgRequests,
      status
    };
  };

  const selectedStats = selectedBuilding ? getBuildingStats(selectedBuilding) : { assets: [], activeRequests: [], status: 'NORMAL' };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in font-sans">
      
      {/* Top Header & GPS Status Bar matching Reference Mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#17488f] via-[#1d5aa6] to-[#2068b5] p-5 rounded-xl text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/15 text-blue-100 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Crosshair className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>VIT-AP University • Live Campus Geolocation Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Interactive Campus Infrastructure Map
          </h1>
          <p className="text-xs text-blue-100 mt-0.5 max-w-xl">
            Real-time geospatial monitoring of campus facilities, active maintenance work orders, and predictive equipment risks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg border border-white/20 text-xs flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
            <span className="font-mono text-[11px] text-blue-100">16.4965° N, 80.4992° E</span>
          </div>
          <button
            onClick={() => onReportAtLocation && onReportAtLocation(selectedBuilding.name)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Issue Here</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Metric Bar matching CivicPulse Reference */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 font-mono">{CAMPUS_BUILDINGS.length}</div>
            <div className="text-[11px] font-semibold text-slate-500">Monitored Zones</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {requests.filter(r => ['submitted', 'in_progress', 'assigned'].includes(r.status)).length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500">Active Geotagged Issues</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {assets.filter(a => a.criticality === 'Critical' || a.previous_failures >= 3).length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500">Critical Fleet Assets</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 font-mono">98.4%</div>
            <div className="text-[11px] font-semibold text-slate-500">AI Location Accuracy</div>
          </div>
        </div>
      </div>

      {/* Main Map Workspace: 2/3 Map Graphic + 1/3 Building Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Cols: Interactive Vector Architectural Campus Map */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Map Controls Toolbar */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Campus Layout View</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                Amaravati Master Plan
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span> Critical Issue
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Active Ticket
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> All Clear
              </span>
            </div>
          </div>

          {/* Interactive SVG / Canvas Architectural Campus Canvas */}
          <div className="relative w-full h-[450px] sm:h-[500px] bg-[#0f172a] overflow-hidden select-none">
            
            {/* Campus Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"></div>

            {/* Campus Roads & Pathways */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-700/60 stroke-[3] fill-none">
              {/* Main Ring Road */}
              <rect x="8%" y="12%" width="84%" height="76%" rx="20" strokeDasharray="6,6" />
              {/* Central Avenue */}
              <line x1="10%" y1="50%" x2="90%" y2="50%" />
              <line x1="50%" y1="12%" x2="50%" y2="88%" />
            </svg>

            {/* Central Courtyard / Green Area */}
            <div className="absolute left-[40%] top-[40%] w-[20%] h-[20%] rounded-full bg-emerald-900/20 border border-emerald-500/30 flex items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Central Lawn</span>
            </div>

            {/* Building Pins on Campus Canvas */}
            {CAMPUS_BUILDINGS.map((bldg) => {
              const stats = getBuildingStats(bldg);
              const isSelected = selectedBuilding?.id === bldg.id;

              return (
                <div
                  key={bldg.id}
                  onClick={() => setSelectedBuilding(bldg)}
                  style={{ left: `${bldg.x}%`, top: `${bldg.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 group z-20`}
                >
                  {/* Pin Node */}
                  <div className="relative flex flex-col items-center">
                    
                    {/* Pulsing indicator for active issues */}
                    {stats.status === 'CRITICAL' && (
                      <div className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping"></div>
                    )}
                    {stats.status === 'WARNING' && (
                      <div className="absolute -inset-1.5 rounded-full bg-amber-500/20 animate-pulse"></div>
                    )}

                    {/* Building Icon Marker */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition transform group-hover:scale-115 ${
                      isSelected 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-400/50 scale-110' 
                        : stats.status === 'CRITICAL'
                          ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                          : stats.status === 'WARNING'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>

                    {/* Issue Count Badge */}
                    {stats.activeRequests.length > 0 && (
                      <span className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-black shadow ${
                        stats.status === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-amber-400 text-slate-900'
                      }`}>
                        {stats.activeRequests.length}
                      </span>
                    )}

                    {/* Building Name Tag */}
                    <div className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shadow-md transition ${
                      isSelected 
                        ? 'bg-blue-600 text-white font-black' 
                        : 'bg-slate-900/90 text-slate-200 border border-slate-700 group-hover:bg-slate-800'
                    }`}>
                      {bldg.code}
                    </div>

                  </div>
                </div>
              );
            })}

          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
            Click any campus building to inspect facilities, assets, and active maintenance complaints.
          </div>
        </div>

        {/* Right 1 Col: Selected Building Operations & Assets Panel */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          
          {/* Building Title & GPS */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {selectedBuilding.type} Facility
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedStats.status === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                selectedStats.status === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {selectedStats.status === 'CRITICAL' ? 'Critical Attention Required' :
                 selectedStats.status === 'WARNING' ? 'Active Work Orders' : 'Normal Operation'}
              </span>
            </div>

            <h2 className="text-base font-black text-slate-900">
              {selectedBuilding.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {selectedBuilding.description}
            </p>
            <div className="text-[11px] font-mono text-blue-700 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{selectedBuilding.gps} • {selectedBuilding.floors} Floors</span>
            </div>
          </div>

          {/* Quick Action Button */}
          <div>
            <button
              onClick={() => onReportAtLocation && onReportAtLocation(selectedBuilding.name)}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#1878ee] hover:bg-[#1366cc] text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Issue in {selectedBuilding.code}</span>
            </button>
          </div>

          {/* Active Work Orders in this Building */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Active Tickets ({selectedStats.activeRequests.length})
              </span>
            </div>

            {selectedStats.activeRequests.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-50 text-center text-xs text-slate-400">
                No active complaints reported in this building.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedStats.activeRequests.map(req => (
                  <div 
                    key={req.request_id}
                    onClick={() => onSelectRequest && onSelectRequest(req.request_id)}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 rounded-lg text-xs cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-slate-900">{req.asset_code || req.request_id}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        req.priority_level === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                        req.priority_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {req.priority_level}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700 line-clamp-1">{req.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{req.location}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registered Assets in this Building */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              Installed Equipment ({selectedStats.assets.length})
            </span>

            <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs">
              {selectedStats.assets.map(asset => (
                <div key={asset.asset_id} className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 text-[11px]">{asset.asset_code}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{asset.asset_name}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    asset.criticality === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {asset.criticality}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
