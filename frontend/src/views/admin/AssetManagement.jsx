import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  RefreshCw, 
  Wrench, 
  Filter, 
  Eye, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { api } from '../../services/api';
import { RiskBadge } from '../../components/RiskBadge';
import { AssetDetailModal } from './AssetDetailModal';
import { Modal } from '../../components/Modal';

export function AssetManagement({ onReportIssue }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  // New Asset Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('HVAC');
  const [newBuilding, setNewBuilding] = useState('Block A');
  const [newLocation, setNewLocation] = useState('');
  const [newDutyHours, setNewDutyHours] = useState(8);
  const [newCriticality, setNewCriticality] = useState('Medium');
  const [savingAsset, setSavingAsset] = useState(false);

  useEffect(() => {
    loadAssets();
  }, [buildingFilter, typeFilter]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await api.getAssets({
        building: buildingFilter,
        type: typeFilter
      });
      setAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    setSavingAsset(true);
    try {
      await api.createAsset({
        asset_code: newCode,
        asset_name: newName,
        asset_type: newType,
        building: newBuilding,
        location: newLocation,
        installation_date: new Date().toISOString().split('T')[0],
        last_maintenance: new Date().toISOString().split('T')[0],
        usage_hours_day: parseFloat(newDutyHours),
        criticality: newCriticality,
        previous_failures: 0
      });
      setShowAddModal(false);
      setNewCode('');
      setNewName('');
      setNewLocation('');
      loadAssets();
    } catch (err) {
      alert('Error creating asset: ' + err.message);
    } finally {
      setSavingAsset(false);
    }
  };

  const filtered = assets.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.asset_code.toLowerCase().includes(q) ||
      a.asset_name.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Campus Infrastructure Assets</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registry of physical assets, telemetry profiles, failure histories, and predictive risk scoring.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Register New Asset
          </button>
          <button
            onClick={loadAssets}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-sm transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search asset code (e.g. AC-BLOCKA-203), equipment name, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-slate-800"
          />
        </div>

        <select
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
        >
          <option value="">All Buildings</option>
          <option value="Block A">Block A</option>
          <option value="Block B">Block B</option>
          <option value="Block C">Block C</option>
          <option value="Main Library">Main Library</option>
          <option value="Boys Hostel">Boys Hostel</option>
          <option value="Auditorium">Auditorium</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
        >
          <option value="">All Asset Types</option>
          <option value="HVAC">HVAC</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Elevator">Elevator</option>
          <option value="Civil">Civil</option>
          <option value="Furniture">Furniture</option>
          <option value="Security/CCTV">Security/CCTV</option>
          <option value="Lab Equipment">Lab Equipment</option>
        </select>
      </div>

      {/* Assets Grid / Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading infrastructure assets...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No assets match criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Asset Code</th>
                  <th className="py-3.5 px-4">Equipment Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Building & Room</th>
                  <th className="py-3.5 px-4">Age / Last Service</th>
                  <th className="py-3.5 px-4">Duty Cycle</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">AI Failure Risk</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map(a => (
                  <tr key={a.asset_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {a.asset_code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {a.asset_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {a.asset_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {a.building} • {a.location}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {a.age_years} yrs • {a.days_since_maintenance}d ago
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {a.usage_hours_day}h/d
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'Operational' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        a.status === 'Degraded' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge riskLevel={a.risk_level} probability={a.predicted_failure_risk} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedAssetId(a.asset_id)}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Asset Detail Modal */}
      {selectedAssetId && (
        <AssetDetailModal
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
          onReportIssue={(code) => {
            setSelectedAssetId(null);
            if (onReportIssue) onReportIssue(code);
          }}
        />
      )}

      {/* Register Asset Modal */}
      {showAddModal && (
        <Modal isOpen={true} onClose={() => setShowAddModal(false)} title="Register Campus Infrastructure Asset">
          <form onSubmit={handleCreateAsset} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Asset Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AC-BLOCKC-302"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inverter Air Conditioner 1.5T"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Asset Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                >
                  <option value="HVAC">HVAC</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Elevator">Elevator</option>
                  <option value="Civil">Civil</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Security/CCTV">Security/CCTV</option>
                  <option value="Lab Equipment">Lab Equipment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Campus Building</label>
                <select
                  value={newBuilding}
                  onChange={(e) => setNewBuilding(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                >
                  <option value="Block A">Block A</option>
                  <option value="Block B">Block B</option>
                  <option value="Block C">Block C</option>
                  <option value="Main Library">Main Library</option>
                  <option value="Boys Hostel">Boys Hostel</option>
                  <option value="Girls Hostel">Girls Hostel</option>
                  <option value="Auditorium">Auditorium</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location Details *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block C / Room 302 (Digital Signal Processing Lab)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Daily Usage (Hours/Day)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={newDutyHours}
                  onChange={(e) => setNewDutyHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Criticality</label>
                <select
                  value={newCriticality}
                  onChange={(e) => setNewCriticality(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingAsset}
                className="px-6 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-sm transition"
              >
                {savingAsset ? 'Saving...' : 'Register Asset'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
