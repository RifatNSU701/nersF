import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { 
  Zap, Flame, Activity, Map as MapIcon, Server, 
  AlertTriangle, Filter, Download, 
  Table, Droplet, Layers, Maximize
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- LEAFLET ICON FIX ---
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const customIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- TYPES ---
interface Project {
  id: string;
  name: string;
  category: 'Power' | 'Gas & LNG' | 'Oil & Fuel';
  capacity: string;
  progress: number;
  status: 'On Schedule' | 'Delayed' | 'Critical' | 'Completed';
  location: string;
  lat: number;
  lng: number;
  budget: string;
  contractor: string;
}

interface Stat {
  label: string;
  value: string;
  trend: string;
  color: string;
}

const Infrastructure = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'Power' | 'Gas & LNG' | 'Oil & Fuel'>('Power');
  const [viewMode, setViewMode] = useState<'List' | 'Map' | 'Table'>('List');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Map Layer Toggles
  const [showPower, setShowPower] = useState(true);
  const [showGas, setShowGas] = useState(true);
  const [showOil, setShowOil] = useState(true);

  // --- STATS DATA ---
  const getStats = (): Stat[] => {
    switch (activeTab) {
      case 'Gas & LNG':
        return [
          { label: "Daily Gas Production", value: "2,300 MMCFD", trend: "-1.2%", color: "border-orange-500" },
          { label: "LNG Import (Daily)", value: "850 MMCFD", trend: "+4.5%", color: "border-blue-500" },
          { label: "National Pipeline", value: "24,000 km", trend: "Stable", color: "border-green-500" },
          { label: "Reserve Pressure", value: "1,100 PSI", trend: "Normal", color: "border-purple-500" },
        ];
      case 'Oil & Fuel':
        return [
          { label: "Strategic Reserves", value: "1.2M Tonnes", trend: "+12%", color: "border-blue-500" },
          { label: "Refining Capacity", value: "1.5M Ton/Yr", trend: "Stable", color: "border-yellow-500" },
          { label: "Import Status", value: "Active", trend: "On Time", color: "border-green-500" },
          { label: "Distribution Fleet", value: "4,200 Tankers", trend: "Active", color: "border-red-500" },
        ];
      default: // Power
        return [
          { label: "Generation Cap.", value: "27,350 MW", trend: "+5.2%", color: "border-blue-500" },
          { label: "Daily Peak Demand", value: "14,500 MW", trend: "+2.1%", color: "border-yellow-500" },
          { label: "Grid Frequency", value: "50.02 Hz", trend: "Stable", color: "border-green-500" },
          { label: "Reserve Margin", value: "15.4%", trend: "Healthy", color: "border-purple-500" },
        ];
    }
  };

  // --- GIS DATA ---
  const allProjects: Project[] = [
    { id: "P-101", name: "Rooppur Nuclear Power Plant", category: 'Power', capacity: "2,400 MW", progress: 78, status: "On Schedule", location: "Ishwardi, Pabna", lat: 24.0673, lng: 89.0475, budget: "$12.65B", contractor: "Rosatom" },
    { id: "P-102", name: "Matarbari Ultra Super Critical", category: 'Power', capacity: "1,200 MW", progress: 92, status: "On Schedule", location: "Cox's Bazar", lat: 21.7019, lng: 91.8741, budget: "$4.5B", contractor: "CPGCBL" },
    { id: "P-103", name: "Rampal Thermal Power Plant", category: 'Power', capacity: "1,320 MW", progress: 98, status: "Completed", location: "Bagerhat", lat: 22.5978, lng: 89.5489, budget: "$2.0B", contractor: "BIFPCL" },
    { id: "P-104", name: "Payra Thermal Power Plant", category: 'Power', capacity: "1,320 MW", progress: 100, status: "Completed", location: "Patuakhali", lat: 22.0225, lng: 90.3013, budget: "$2.4B", contractor: "BCPCL" },
    
    { id: "G-201", name: "Payra LNG Terminal", category: 'Gas & LNG', capacity: "500 MMCFD", progress: 45, status: "Delayed", location: "Patuakhali", lat: 21.9900, lng: 90.2800, budget: "$950M", contractor: "Excelerate Energy" },
    { id: "G-202", name: "Bibiyana Gas Field", category: 'Gas & LNG', capacity: "1200 MMCFD", progress: 100, status: "Completed", location: "Habiganj", lat: 24.6300, lng: 91.6000, budget: "N/A", contractor: "Chevron" },
    { id: "G-203", name: "Bhola North Gas Field", category: 'Gas & LNG', capacity: "20 MMCFD", progress: 60, status: "Critical", location: "Bhola", lat: 22.6800, lng: 90.6500, budget: "$150M", contractor: "BAPEX" },

    { id: "O-301", name: "Eastern Refinery Ltd", category: 'Oil & Fuel', capacity: "1.5M Ton/Yr", progress: 100, status: "Completed", location: "Chittagong", lat: 22.2858, lng: 91.7960, budget: "N/A", contractor: "BPC" },
    { id: "O-302", name: "Single Point Mooring (SPM)", category: 'Oil & Fuel', capacity: "Oil Unloading", progress: 99, status: "On Schedule", location: "Moheshkhali", lat: 21.5500, lng: 91.9500, budget: "$650M", contractor: "China Petroleum" },
  ];

  // --- FILTER LOGIC ---
  const filteredProjects = allProjects.filter(p => {
    const matchTab = p.category === activeTab;
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    let layerVisible = true;
    if (viewMode === 'Map') {
       if (p.category === 'Power' && !showPower) layerVisible = false;
       if (p.category === 'Gas & LNG' && !showGas) layerVisible = false;
       if (p.category === 'Oil & Fuel' && !showOil) layerVisible = false;
    }
    return matchTab && matchStatus && layerVisible;
  });
  
  const mapMarkers = allProjects.filter(p => {
    if (p.category === 'Power' && !showPower) return false;
    if (p.category === 'Gas & LNG' && !showGas) return false;
    if (p.category === 'Oil & Fuel' && !showOil) return false;
    return true;
  });

  const handleDownloadReport = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const headers = "ID,Name,Category,Status,Progress,Location,Coordinates\n";
      const rows = filteredProjects.map(p => `${p.id},"${p.name}",${p.category},${p.status},${p.progress}%,${p.location},"${p.lat}, ${p.lng}"`).join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `NERSF_Infrastructure_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'On Schedule': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Delayed': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* HEADER DASHBOARD */}
      <div className="bg-slate-900 text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity size={300} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="animate-pulse h-2.5 w-2.5 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></span>
                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">System Status: Nominal</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">National Infrastructure</h1>
              <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
                Real-time GIS monitoring of {activeTab} assets, transmission networks, and strategic project lifecycles.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setViewMode(viewMode === 'Map' ? 'List' : 'Map')}
                className={`px-5 py-2.5 rounded font-bold text-sm border flex items-center transition-all ${
                  viewMode === 'Map' 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' 
                    : 'bg-slate-800 border-slate-600 hover:bg-slate-700 text-gray-200'
                }`}
              >
                <MapIcon className="h-4 w-4 mr-2" /> {viewMode === 'Map' ? 'Close GIS Map' : 'View GIS Map'}
              </button>
              <button 
                onClick={() => setViewMode(viewMode === 'Table' ? 'List' : 'Table')}
                className={`px-5 py-2.5 rounded font-bold text-sm border flex items-center transition-all ${
                  viewMode === 'Table' 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' 
                    : 'bg-slate-800 border-slate-600 hover:bg-slate-700 text-gray-200'
                }`}
              >
                <Table className="h-4 w-4 mr-2" /> {viewMode === 'Table' ? 'Close Dashboard' : 'Project Dashboard'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 -mb-16 relative z-10">
            {getStats().map((stat, idx) => (
              <div key={idx} className={`bg-white p-5 rounded shadow-xl border-t-4 ${stat.color} hover:-translate-y-1 transition-transform`}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex justify-between">
                  {stat.label} <Activity className="h-3 w-3 opacity-30" />
                </p>
                <div className="flex justify-between items-end">
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    stat.trend.includes('+') || stat.trend === 'Stable' || stat.trend === 'Healthy' || stat.trend === 'Normal' || stat.trend === 'On Time'
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        {/* FILTERS */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-200 inline-flex">
            {(['Power', 'Gas & LNG', 'Oil & Fuel'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-md text-sm font-bold transition-all flex items-center ${
                  activeTab === tab 
                    ? 'bg-slate-800 text-white shadow-md transform scale-105' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {tab === 'Power' && <Zap className="h-4 w-4 mr-2" />}
                {tab === 'Gas & LNG' && <Flame className="h-4 w-4 mr-2" />}
                {tab === 'Oil & Fuel' && <Droplet className="h-4 w-4 mr-2" />}
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
             <div className="relative">
                <select 
                  className="appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-10 rounded text-xs font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="On Schedule">On Schedule</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Critical">Critical</option>
                </select>
                <Filter className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
             </div>
             
             <button 
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-5 rounded flex items-center text-xs font-bold uppercase tracking-wide transition-colors shadow-sm"
             >
                {isDownloading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full mr-2"></span>
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isDownloading ? "Generating..." : "Report"}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* VIEW MODE 1: LIST VIEW */}
            {viewMode === 'List' && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-700 flex items-center uppercase tracking-wide text-sm">
                    <Activity className="h-4 w-4 mr-2 text-primary" /> 
                    Priority Projects ({filteredProjects.length})
                  </h3>
                </div>
                {filteredProjects.map((project) => (
                  <div key={project.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-primary transition-colors"></div>
                    <div className="flex justify-between items-start mb-4 pl-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">ID: {project.id}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <MapIcon className="h-3 w-3 mr-1" /> {project.location} • <span className="text-gray-400 ml-1">Contractor: {project.contractor}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block text-xl font-bold text-slate-800">{project.progress}%</span>
                        <span className="text-[10px] text-gray-400 uppercase">Complete</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3 ml-2 w-[calc(100%-0.5rem)]">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          project.progress >= 90 ? 'bg-green-500' : 
                          project.progress < 50 ? 'bg-red-400' : 'bg-blue-600'
                        }`} 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* VIEW MODE 2: ACTIVE LEAFLET GIS MAP */}
            {viewMode === 'Map' && (
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl h-[650px] relative border border-gray-300 z-0">
                <MapContainer center={[23.6850, 90.3563]} zoom={7} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {mapMarkers.map((p) => (
                    <Marker key={p.id} position={[p.lat, p.lng]} icon={customIcon}>
                      <Popup>
                        <div className="p-1">
                          <h3 className="font-bold text-sm text-primary mb-1">{p.name}</h3>
                          <div className={`text-[10px] font-bold px-1 py-0.5 rounded inline-block mb-2 border ${getStatusColor(p.status)}`}>{p.status}</div>
                          <p className="text-xs text-gray-600 m-0">Capacity: <strong>{p.capacity}</strong></p>
                          <p className="text-xs text-gray-600 m-0">Progress: <strong>{p.progress}%</strong></p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>

                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-lg rounded-lg p-3 text-xs border border-gray-200 z-[1000]">
                   <div className="font-bold text-gray-800 mb-2 flex items-center border-b border-gray-200 pb-1">
                      <Layers className="h-3 w-3 mr-1" /> GIS LAYERS
                   </div>
                   <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                         <input type="checkbox" checked={showPower} onChange={(e) => setShowPower(e.target.checked)} className="rounded text-blue-600 focus:ring-0" /> 
                         <span>Power Plants</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                         <input type="checkbox" checked={showGas} onChange={(e) => setShowGas(e.target.checked)} className="rounded text-orange-500 focus:ring-0" /> 
                         <span>Gas Pipelines</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                         <input type="checkbox" checked={showOil} onChange={(e) => setShowOil(e.target.checked)} className="rounded text-green-600 focus:ring-0" /> 
                         <span>Oil Refineries</span>
                      </label>
                   </div>
                </div>

                <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur text-white p-3 rounded shadow-lg text-[10px] z-[1000]">
                   <div className="font-bold mb-1 flex items-center"><Maximize className="h-3 w-3 mr-1"/> GIS COORDINATES</div>
                   <div className="font-mono text-gray-300">LAT: 23.6850 N | LNG: 90.3563 E</div>
                   <div className="font-mono text-green-400 mt-1">SIGNAL: STRONG</div>
                </div>
              </div>
            )}

            {/* VIEW MODE 3: DASHBOARD TABLE */}
            {viewMode === 'Table' && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Project Execution Matrix</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-100 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Project Identity</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Completion</th>
                                <th className="px-6 py-4">Fiscal Budget</th>
                                <th className="px-6 py-4">Execution Body</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProjects.map((p) => (
                                <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                       <div className="font-bold text-gray-800">{p.name}</div>
                                       <div className="text-[10px] text-gray-400 font-mono">{p.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded border ${getStatusColor(p.status)}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full ${p.progress > 80 ? 'bg-green-500' : 'bg-blue-500'}`} style={{width: `${p.progress}%`}}></div>
                                            </div>
                                            <span className="text-xs font-mono font-bold">{p.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-700 font-bold">{p.budget}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{p.contractor}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-red-50 px-5 py-3 border-b border-red-100 flex items-center justify-between">
                <h3 className="text-red-800 font-bold text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" /> Critical Alerts
                </h3>
                <span className="text-[10px] font-bold bg-white text-red-600 px-2 py-0.5 rounded border border-red-200 animate-pulse">2 Active</span>
              </div>
              <div className="divide-y divide-gray-50">
                <div className="p-4 hover:bg-red-50/50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                     <p className="text-xs font-bold text-gray-800 group-hover:text-red-700">Ashuganj East - Maintenance</p>
                     <span className="text-[10px] text-gray-400">2m ago</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">Unit 3 offline for scheduled turbine maintenance. Expected uptime: 48h.</p>
                </div>
                <div className="p-4 hover:bg-red-50/50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                     <p className="text-xs font-bold text-gray-800 group-hover:text-red-700">Grid Freq. Deviation</p>
                     <span className="text-[10px] text-gray-400">15m ago</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">Minor frequency drop detected in Zone 4 (Khulna). Stabilization in progress.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 text-white rounded-lg p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-slate-700 opacity-20">
                 <Server size={120} />
              </div>
              <h3 className="font-bold text-lg mb-6 flex items-center relative z-10">
                <Server className="h-5 w-5 mr-2 text-secondary" /> Asset Inventory
              </h3>
              <ul className="space-y-4 relative z-10">
                <li className="flex justify-between items-center border-b border-slate-700 pb-2 group cursor-pointer">
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Power Plants (Active)</span>
                  <span className="font-mono font-bold text-secondary text-lg">152</span>
                </li>
                <li className="flex justify-between items-center border-b border-slate-700 pb-2 group cursor-pointer">
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Grid Substations</span>
                  <span className="font-mono font-bold text-secondary text-lg">840</span>
                </li>
                <li className="flex justify-between items-center border-b border-slate-700 pb-2 group cursor-pointer">
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Gas Fields</span>
                  <span className="font-mono font-bold text-secondary text-lg">28</span>
                </li>
                <li className="flex justify-between items-center pb-1 group cursor-pointer">
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Renewable Parks</span>
                  <span className="font-mono font-bold text-secondary text-lg">14</span>
                </li>
              </ul>
              <button 
                onClick={handleDownloadReport} 
                disabled={isDownloading}
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-bold py-3 rounded shadow-lg transition-all flex items-center justify-center relative z-10"
              >
                 <Download className="h-4 w-4 mr-2" /> Download Full Inventory
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Infrastructure;