import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Zap, Activity, AlertTriangle, MapPin, 
  Search, Filter, ShieldAlert, Battery, BarChart3, 
  ArrowDownRight, ArrowUpRight, PowerOff, Settings,
  CheckCircle2, XCircle, Download, ChevronUp, 
  ChevronDown, ChevronLeft, ChevronRight, X, Info
} from 'lucide-react';

// --- ENTERPRISE TYPES ---

interface RegionData {
  id: string;
  name: string;
  currentLoad: number; // MW
  capacity: number; // MW
  status: 'STABLE' | 'WARNING' | 'CRITICAL';
  sheddingActive: boolean;
  smartMeterCoverage: number;
}

interface AnomalyAlert {
  id: string;
  type: 'THEFT_SUSPECTED' | 'METER_BYPASS' | 'TRANSFORMER_OVERLOAD';
  location: string;
  severity: 'HIGH' | 'CRITICAL';
  lossEstimate: string;
  time: string;
  status: 'ACTIVE' | 'DISPATCHED' | 'RESOLVED';
}

interface ConsumerRecord {
  id: string;
  entityName: string;
  category: 'INDUSTRIAL' | 'COMMERCIAL' | 'RESIDENTIAL' | 'CRITICAL';
  region: string;
  avgDraw: number; 
  smartMeterStatus: 'ONLINE' | 'OFFLINE' | 'TAMPERED';
  billingStatus: 'CLEARED' | 'ARREARS';
}

type FilterType = 'ALL' | 'INDUSTRIAL' | 'CRITICAL' | 'COMMERCIAL' | 'RESIDENTIAL';
type SortKey = 'id' | 'entityName' | 'avgDraw' | 'category';

// --- MOCK TELEMETRY DATA ---

const INITIAL_REGIONS: RegionData[] = [
  { id: 'REG-01', name: 'Dhaka Metropolitan', currentLoad: 4200, capacity: 4500, status: 'WARNING', sheddingActive: false, smartMeterCoverage: 85 },
  { id: 'REG-02', name: 'Chittagong Industrial', currentLoad: 3100, capacity: 3200, status: 'CRITICAL', sheddingActive: false, smartMeterCoverage: 92 },
  { id: 'REG-03', name: 'Sylhet Division', currentLoad: 850, capacity: 1200, status: 'STABLE', sheddingActive: false, smartMeterCoverage: 45 },
  { id: 'REG-04', name: 'Khulna Zone', currentLoad: 1200, capacity: 1500, status: 'STABLE', sheddingActive: false, smartMeterCoverage: 60 },
  { id: 'REG-05', name: 'Rajshahi Grid', currentLoad: 950, capacity: 1000, status: 'WARNING', sheddingActive: false, smartMeterCoverage: 55 },
];

const INITIAL_ANOMALIES: AnomalyAlert[] = [
  { id: 'ANM-9021', type: 'METER_BYPASS', location: 'Gazipur Ind. Sector 4', severity: 'CRITICAL', lossEstimate: '4.2 MW/h', time: '10:42 AM', status: 'ACTIVE' },
  { id: 'ANM-9022', type: 'TRANSFORMER_OVERLOAD', location: 'Mirpur-10 Substation', severity: 'HIGH', lossEstimate: 'N/A', time: '10:15 AM', status: 'ACTIVE' },
  { id: 'ANM-9023', type: 'THEFT_SUSPECTED', location: 'Narayanganj Block B', severity: 'HIGH', lossEstimate: '1.8 MW/h', time: '09:30 AM', status: 'ACTIVE' },
  { id: 'ANM-9024', type: 'THEFT_SUSPECTED', location: 'Savar Hemayetpur', severity: 'HIGH', lossEstimate: '2.1 MW/h', time: '08:12 AM', status: 'ACTIVE' },
];

const INITIAL_CONSUMERS: ConsumerRecord[] = [
  { id: 'CON-100234', entityName: 'Beximco Textiles Ltd.', category: 'INDUSTRIAL', region: 'Gazipur', avgDraw: 12.4, smartMeterStatus: 'ONLINE', billingStatus: 'CLEARED' },
  { id: 'CON-100235', entityName: 'Square Pharmaceuticals', category: 'CRITICAL', region: 'Pabna', avgDraw: 8.2, smartMeterStatus: 'ONLINE', billingStatus: 'CLEARED' },
  { id: 'CON-100236', entityName: 'Jamuna Future Park', category: 'COMMERCIAL', region: 'Dhaka', avgDraw: 15.1, smartMeterStatus: 'TAMPERED', billingStatus: 'ARREARS' },
  { id: 'CON-100237', entityName: 'Dhaka Medical College', category: 'CRITICAL', region: 'Dhaka', avgDraw: 4.5, smartMeterStatus: 'ONLINE', billingStatus: 'CLEARED' },
  { id: 'CON-100238', entityName: 'KDS Steel Mills', category: 'INDUSTRIAL', region: 'Chittagong', avgDraw: 22.0, smartMeterStatus: 'OFFLINE', billingStatus: 'ARREARS' },
  { id: 'CON-100239', entityName: 'Bashundhara Paper', category: 'INDUSTRIAL', region: 'Narayanganj', avgDraw: 14.2, smartMeterStatus: 'ONLINE', billingStatus: 'CLEARED' },
  { id: 'CON-100240', entityName: 'Gulshan Pink City', category: 'COMMERCIAL', region: 'Dhaka', avgDraw: 3.8, smartMeterStatus: 'ONLINE', billingStatus: 'CLEARED' },
  { id: 'CON-100241', entityName: 'CMH Hospital', category: 'CRITICAL', region: 'Dhaka', avgDraw: 6.1, smartMeterStatus: 'ONLINE', billingStatus: 'CLEARED' },
  { id: 'CON-100242', entityName: 'Abul Khair Steel', category: 'INDUSTRIAL', region: 'Chittagong', avgDraw: 28.5, smartMeterStatus: 'ONLINE', billingStatus: 'CLEARED' },
  { id: 'CON-100243', entityName: 'Walton Hi-Tech', category: 'INDUSTRIAL', region: 'Gazipur', avgDraw: 18.3, smartMeterStatus: 'ONLINE', billingStatus: 'CLEARED' },
  { id: 'CON-100244', entityName: 'Sector 4 Residential', category: 'RESIDENTIAL', region: 'Uttara', avgDraw: 2.1, smartMeterStatus: 'TAMPERED', billingStatus: 'ARREARS' },
  { id: 'CON-100245', entityName: 'Aarong Dairy', category: 'INDUSTRIAL', region: 'Gazipur', avgDraw: 5.4, smartMeterStatus: 'ONLINE', billingStatus: 'CLEARED' },
];

// --- SUB-COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    online: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    offline: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
  };
  const activeStyle = styles[status as keyof typeof styles] || styles.offline;
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${activeStyle} flex items-center gap-1.5 w-fit`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'online' ? 'bg-emerald-400 animate-pulse' : 
        status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'
      }`}></span>
      {status}
    </span>
  );
};

// --- MAIN COMPONENT ---

const Consumers = () => {
  // Application State
  const [regions, setRegions] = useState<RegionData[]>(INITIAL_REGIONS);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>(INITIAL_ANOMALIES);
  const [consumers, setConsumers] = useState<ConsumerRecord[]>(INITIAL_CONSUMERS);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'avgDraw', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // System State
  const [totalLoad, setTotalLoad] = useState(10300);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'alert' | 'info' } | null>(null);
  const [selectedConsumer, setSelectedConsumer] = useState<ConsumerRecord | null>(null);

  // --- EFFECTS ---

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalLoad(prev => Math.floor(prev + (Math.random() * 50 - 25)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg: string, type: 'success' | 'alert' | 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- FUNCTIONAL LOGIC ---

  // 1. Load Shedding Logic
  const handleToggleShedding = (regionId: string) => {
    setRegions(prevRegions => prevRegions.map(reg => {
      if (reg.id === regionId) {
        const isSheddingNow = !reg.sheddingActive;
        const newLoad = isSheddingNow ? reg.currentLoad * 0.75 : reg.currentLoad * 1.33; 
        const newStatus = (newLoad / reg.capacity) > 0.9 ? 'CRITICAL' : (newLoad / reg.capacity) > 0.75 ? 'WARNING' : 'STABLE';
        
        triggerToast(
          isSheddingNow ? `Load Shedding INITIATED for ${reg.name}. Load dropping.` : `Power RESTORED to ${reg.name}. Monitoring grid stress.`,
          isSheddingNow ? 'alert' : 'success'
        );

        return { ...reg, sheddingActive: isSheddingNow, currentLoad: Math.round(newLoad), status: newStatus };
      }
      return reg;
    }));
  };

  // 2. Anomaly Dispatch Logic
  const handleDispatch = (anomalyId: string) => {
    setAnomalies(prev => prev.map(a => 
      a.id === anomalyId ? { ...a, status: 'DISPATCHED' } : a
    ));
    triggerToast(`Mobile Enforcement Unit dispatched to anomaly location.`, 'info');
    
    setTimeout(() => {
      setAnomalies(prev => prev.filter(a => a.id !== anomalyId));
      triggerToast(`Threat Resolved. Sector secured.`, 'success');
    }, 4000);
  };

  // 3. Consumer Operational Logic (Uses setConsumers)
  const handleRemoteDisconnect = (consumerId: string) => {
    setConsumers(prev => prev.map(c => 
      c.id === consumerId ? { ...c, smartMeterStatus: 'OFFLINE', avgDraw: 0 } : c
    ));
    triggerToast(`KILL SIGNAL SENT: Meter ${consumerId} disconnected remotely.`, 'alert');
    setSelectedConsumer(null);
  };

  const handleAuditClearance = (consumerId: string) => {
    setConsumers(prev => prev.map(c => 
      c.id === consumerId ? { ...c, smartMeterStatus: 'ONLINE', billingStatus: 'CLEARED' } : c
    ));
    triggerToast(`AUDIT COMPLETE: Meter ${consumerId} secured and fines cleared.`, 'success');
    setSelectedConsumer(null);
  };

  // 4. Sorting & Filtering Data (Using useMemo properly)
  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedConsumers = useMemo(() => {
    const filtered = consumers.filter(c => 
      (activeFilter === 'ALL' || c.category === activeFilter) &&
      (c.entityName.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [consumers, activeFilter, searchQuery, sortConfig]);

  // 5. Pagination Logic
  const totalPages = Math.ceil(processedConsumers.length / itemsPerPage);
  const currentData = processedConsumers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 6. CSV Export Feature
  const handleExportCSV = () => {
    const headers = "Entity ID,Consumer Name,Category,Region,Avg Draw (MW),Smart Meter,Billing\n";
    const rows = processedConsumers.map(c => 
      `${c.id},"${c.entityName}",${c.category},${c.region},${c.avgDraw},${c.smartMeterStatus},${c.billingStatus}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `NERSF_Consumer_Data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    triggerToast('Data exported successfully. Check downloads.', 'success');
  };

  return (
    <div className="space-y-6 font-sans text-slate-200 relative">
      
      {/* --- TACTICAL TOAST NOTIFICATION --- */}
      {toast && (
        <div className={`fixed top-24 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded shadow-2xl border animate-in fade-in slide-in-from-right-8 ${
          toast.type === 'alert' ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' :
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' :
          'bg-blue-950/90 border-blue-500/50 text-blue-200'
        }`}>
          {toast.type === 'alert' ? <AlertTriangle className="h-5 w-5" /> : 
           toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : 
           <Info className="h-5 w-5" />}
          <p className="text-sm font-bold tracking-wide">{toast.msg}</p>
        </div>
      )}

      {/* --- COMMAND HEADER --- */}
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-sm flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-emerald-500/20 p-2 rounded border border-emerald-500/30">
            <Users className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight uppercase">Smart Grid & Consumer Telemetry</h1>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              NODE: DISTRIBUTION_MASTER_01
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded flex items-center gap-3 shadow-inner">
            <Activity className="h-4 w-4 text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">National Live Draw</span>
              <span className="text-sm font-mono font-bold text-blue-400">{totalLoad.toLocaleString()} MW</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- KPI MACRO DATA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Active Connections", val: "4.2M", unit: "Nodes", icon: Users, color: "blue", trend: "+1.2%", trendIcon: ArrowUpRight },
          { title: "Industrial Draw", val: "6,840", unit: "MW", icon: Zap, color: "orange", trend: "+4.5%", trendIcon: ArrowUpRight },
          { title: "System Loss (Theft)", val: "8.4", unit: "%", icon: ArrowDownRight, color: "rose", trend: "-0.2%", trendIcon: ArrowDownRight },
          { title: "Smart Meter Cov.", val: "62.4", unit: "%", icon: Battery, color: "emerald", trend: "+12.1%", trendIcon: ArrowUpRight },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-700 p-5 rounded-sm relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-20 h-20 bg-${kpi.color}-500/10 rounded-full blur-xl group-hover:bg-${kpi.color}-500/20 transition-all`}></div>
            <div className="flex justify-between items-start mb-2">
              <kpi.icon className={`h-5 w-5 text-${kpi.color}-400`} />
              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${
                kpi.color === 'rose' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-blue-900/30 text-blue-400'
              }`}>
                {kpi.trend} <kpi.trendIcon className="h-3 w-3" />
              </span>
            </div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{kpi.title}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-white">{kpi.val}</span>
              <span className="text-xs text-slate-400 font-bold">{kpi.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* --- MID SECTION: LOAD BALANCING & ANOMALIES --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT: Regional Load Balancer (8 Cols) */}
        <div className="xl:col-span-8 bg-slate-900 border border-slate-700 rounded-sm flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <BarChart3 className="h-4 w-4 text-blue-500" /> Regional Load Matrix
            </h3>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">AUTO-BALANCER: OFFLINE (MANUAL OVERRIDE)</span>
          </div>
          
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {regions.map((region) => {
              const loadPercent = (region.currentLoad / region.capacity) * 100;
              return (
                <div key={region.id} className={`bg-slate-950 border p-4 rounded relative overflow-hidden transition-colors ${
                  region.sheddingActive ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-800 hover:border-slate-600'
                }`}>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <h4 className="font-bold text-slate-200 flex items-center gap-2">
                        <MapPin className={`h-4 w-4 ${region.sheddingActive ? 'text-amber-500' : 'text-slate-500'}`} /> 
                        {region.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">SMART COVERAGE: {region.smartMeterCoverage}%</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        {region.sheddingActive && (
                          <span className="text-[9px] font-bold bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded uppercase animate-pulse border border-amber-500/30">
                            SHEDDING ACTIVE
                          </span>
                        )}
                        {!region.sheddingActive && (
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                             region.status === 'CRITICAL' ? 'bg-rose-900/30 text-rose-400 border-rose-500/30 animate-pulse' : 
                             region.status === 'WARNING' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' : 
                             'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                           }`}>
                             {region.status}
                           </span>
                        )}
                      </div>
                      <span className="text-sm font-mono font-bold text-white">{region.currentLoad} <span className="text-[10px] text-slate-500">/ {region.capacity} MW</span></span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex mb-4">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        region.sheddingActive ? 'bg-amber-500' :
                        loadPercent > 90 ? 'bg-rose-500' : loadPercent > 75 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${loadPercent}%` }}
                    ></div>
                  </div>

                  {/* Operational Override Buttons */}
                  <div className="pt-3 border-t border-slate-800 flex justify-between gap-2">
                    <button 
                      onClick={() => triggerToast(`Connecting to ${region.name} substations...`, 'info')}
                      className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold uppercase rounded text-slate-300 border border-slate-700 transition-colors"
                    >
                      <Settings className="h-3 w-3" /> Config
                    </button>
                    <button 
                      onClick={() => handleToggleShedding(region.id)}
                      className={`flex-1 flex justify-center items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase rounded transition-colors ${
                      region.sheddingActive 
                        ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                        : 'bg-rose-900/30 text-rose-400 border border-rose-500/30 hover:bg-rose-900/50 hover:shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                    }`}>
                      <PowerOff className="h-3 w-3" /> {region.sheddingActive ? 'RESTORE POWER' : 'KILL SWITCH (SHED)'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: AI Anomaly Detection (4 Cols) */}
        <div className="xl:col-span-4 bg-slate-900 border border-slate-700 rounded-sm flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <ShieldAlert className="h-4 w-4 text-rose-500" /> Security AI Threats
            </h3>
            <span className="text-[10px] font-bold bg-rose-900/50 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span> {anomalies.length} ACTIVE
            </span>
          </div>
          
          <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1 max-h-[500px]">
            {anomalies.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500/50" />
                  <p className="text-xs uppercase font-bold tracking-widest text-emerald-500/70">Grid Secure. No Threats.</p>
               </div>
            ) : (
              anomalies.map((alert) => (
                <div key={alert.id} className={`bg-slate-950 border p-3 rounded-sm border-l-4 transition-all ${
                  alert.status === 'DISPATCHED' ? 'border-l-blue-500 opacity-60' :
                  alert.severity === 'CRITICAL' ? 'border-l-rose-500 hover:bg-slate-800/50' : 'border-l-amber-500 hover:bg-slate-800/50'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{alert.time}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      alert.status === 'DISPATCHED' ? 'bg-blue-900/40 text-blue-400' :
                      alert.severity === 'CRITICAL' ? 'bg-rose-900/40 text-rose-400 animate-pulse' : 'bg-amber-900/40 text-amber-400'
                    }`}>
                      {alert.status === 'DISPATCHED' ? 'UNIT EN ROUTE' : alert.severity}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1 uppercase">{alert.type.replace('_', ' ')}</h4>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mb-2">
                    <AlertTriangle className="h-3 w-3 text-slate-500" /> {alert.location}
                  </p>
                  
                  {alert.status === 'ACTIVE' && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-mono text-rose-400">Est. Loss: {alert.lossEstimate}</span>
                      <button 
                        onClick={() => handleDispatch(alert.id)}
                        className="text-[10px] font-bold bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-2 py-1 rounded border border-blue-500/30 uppercase transition-colors"
                      >
                        Dispatch Enforcer
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- BOTTOM: SMART METER DIRECTORY (DATA TABLE) --- */}
      <div className="bg-slate-900 border border-slate-700 rounded-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Major Consumer Telemetry</h3>
            <span className="text-[10px] text-slate-400 uppercase">Interactive Node Database</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search entity..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset page safely without useEffect
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <select 
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value as FilterType);
                  setCurrentPage(1); // Reset page safely without useEffect
                }} 
                className="bg-slate-950 border border-slate-700 rounded text-xs font-bold text-slate-300 pl-9 pr-8 py-2 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition-colors"
              >
                <option value="ALL">ALL SECTORS</option>
                <option value="INDUSTRIAL">INDUSTRIAL</option>
                <option value="COMMERCIAL">COMMERCIAL</option>
                <option value="CRITICAL">CRITICAL (Hospitals)</option>
              </select>
            </div>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] font-bold text-white uppercase rounded transition-colors"
            >
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-[10px] uppercase text-slate-500 font-bold tracking-wider select-none">
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('id')}>
                  Entity ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('entityName')}>
                  Consumer Name {sortConfig.key === 'entityName' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('category')}>
                  Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800">Region</th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('avgDraw')}>
                  Current Draw {sortConfig.key === 'avgDraw' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800">Telemetry Status</th>
                <th className="p-4 border-b border-slate-800">Billing</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {currentData.map((consumer) => (
                <tr 
                  key={consumer.id} 
                  onClick={() => setSelectedConsumer(consumer)}
                  className="hover:bg-blue-900/20 border-b border-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="p-4 font-mono text-blue-400 group-hover:underline">{consumer.id}</td>
                  <td className="p-4 font-bold text-white">{consumer.entityName}</td>
                  <td className="p-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                      consumer.category === 'CRITICAL' ? 'bg-purple-900/30 text-purple-400 border-purple-500/30' :
                      consumer.category === 'INDUSTRIAL' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' :
                      consumer.category === 'COMMERCIAL' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-600'
                    }`}>
                      {consumer.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{consumer.region}</td>
                  <td className="p-4 font-mono font-bold">{consumer.avgDraw.toFixed(1)} MW</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {consumer.smartMeterStatus === 'ONLINE' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                       consumer.smartMeterStatus === 'TAMPERED' ? <AlertTriangle className="h-4 w-4 text-rose-500" /> :
                       <XCircle className="h-4 w-4 text-slate-500" />}
                      <span className={`font-bold text-[10px] ${
                        consumer.smartMeterStatus === 'ONLINE' ? 'text-emerald-500' :
                        consumer.smartMeterStatus === 'TAMPERED' ? 'text-rose-500' : 'text-slate-500'
                      }`}>{consumer.smartMeterStatus}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      consumer.billingStatus === 'CLEARED' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20' : 'bg-rose-900/20 text-rose-400 border-rose-500/20'
                    }`}>
                      {consumer.billingStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest">
                    No Telemetry Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center text-[10px] text-slate-400 font-bold">
           <span>SHOWING {processedConsumers.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} TO {Math.min(currentPage * itemsPerPage, processedConsumers.length)} OF {processedConsumers.length} RECORDS</span>
           <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-700 text-white">
                PAGE {currentPage} / {totalPages || 1}
              </div>
              <button 
                disabled={currentPage >= totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
           </div>
        </div>
      </div>

      {/* --- CONSUMER DETAIL MODAL --- */}
      {selectedConsumer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/50">
                 <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded border border-blue-500/30">
                       <Activity className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                       <h2 className="text-lg font-bold text-white uppercase">{selectedConsumer.entityName}</h2>
                       <p className="text-xs text-slate-400 font-mono">NODE ID: {selectedConsumer.id}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedConsumer(null)} className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors">
                    <X className="h-6 w-6" />
                 </button>
              </div>
              
              <div className="p-6 grid grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <div>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Live Telemetry Draw</p>
                       <p className="text-3xl font-mono font-bold text-blue-400">{selectedConsumer.avgDraw.toFixed(2)} <span className="text-sm text-slate-500">MW/h</span></p>
                    </div>
                    <div>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Meter Status</p>
                       <StatusBadge status={selectedConsumer.smartMeterStatus === 'ONLINE' ? 'online' : selectedConsumer.smartMeterStatus === 'TAMPERED' ? 'warning' : 'offline'} />
                    </div>
                    <div>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Financial Standing</p>
                       <span className={`text-xs font-bold px-2 py-1 rounded border ${selectedConsumer.billingStatus === 'CLEARED' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-rose-900/30 text-rose-400 border-rose-500/30'}`}>
                          {selectedConsumer.billingStatus}
                       </span>
                    </div>
                 </div>
                 
                 <div className="bg-slate-950 border border-slate-800 rounded p-4 flex flex-col justify-between relative overflow-hidden">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 z-10">Consumption Profile (24H)</p>
                    <div className="flex-1 flex items-end gap-1 opacity-80 z-10">
                       {[4, 5, 8, 12, 18, 22, 20, 15, 10, 8, 5, 4].map((h, i) => (
                          <div key={i} className={`w-full rounded-t transition-all cursor-pointer ${
                            selectedConsumer.smartMeterStatus === 'OFFLINE' ? 'bg-slate-700/50' : 'bg-blue-500/50 hover:bg-blue-400'
                          }`} style={{ height: selectedConsumer.smartMeterStatus === 'OFFLINE' ? '5%' : `${(h/25)*100}%` }}></div>
                       ))}
                    </div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:10px_10px] opacity-20"></div>
                 </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
                 {selectedConsumer.smartMeterStatus === 'TAMPERED' && (
                   <button 
                     onClick={() => handleAuditClearance(selectedConsumer.id)}
                     className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/50 text-rose-400 text-xs font-bold uppercase rounded transition-colors"
                   >
                     Dispatch Audit Team
                   </button>
                 )}
                 {selectedConsumer.billingStatus === 'ARREARS' && selectedConsumer.smartMeterStatus !== 'OFFLINE' && (
                   <button 
                     onClick={() => handleRemoteDisconnect(selectedConsumer.id)}
                     className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/50 text-amber-400 text-xs font-bold uppercase rounded transition-colors"
                   >
                     Remote Disconnect
                   </button>
                 )}
                 <button onClick={() => setSelectedConsumer(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded transition-colors">
                    Close Profile
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Consumers;