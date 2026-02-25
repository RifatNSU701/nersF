import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Zap, AlertTriangle, TrendingUp, Users, 
  FileText, Clock, ShieldCheck, Map, Server, 
  Droplet, Anchor, Radio, ChevronRight, MoreHorizontal,
  Wind, Thermometer, Cpu, Database, Lock, 
  Globe, Satellite, Truck, Search, Bell, X, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- TYPES & INTERFACES (Strict Enterprise Typing) ---

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  change: string;
  isNegative?: boolean;
  icon: React.ElementType;
  color: 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'slate' | 'teal';
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRIT' | 'SEC';
  module: string;
  message: string;
}

interface GridNode {
  id: string;
  name: string;
  type: 'generation' | 'substation' | 'distribution';
  status: 'online' | 'warning' | 'offline';
  load: number; // MW
  coordinates: { x: number; y: number };
}

// --- MOCK DATA GENERATORS ---

const GENERATE_LOGS = (): LogEntry[] => [
  { id: 'L-1024', timestamp: new Date().toLocaleTimeString(), level: 'INFO', module: 'SCADA_CORE', message: 'Unit 4 Synchronization complete.' },
  { id: 'L-1023', timestamp: new Date(Date.now() - 50000).toLocaleTimeString(), level: 'WARN', module: 'GRID_OPT', message: 'Frequency deviation detected in Zone-D.' },
  { id: 'L-1022', timestamp: new Date(Date.now() - 120000).toLocaleTimeString(), level: 'SEC', module: 'AUTH_GATE', message: 'Failed login attempt from IP 10.23.1.55' },
  { id: 'L-1021', timestamp: new Date(Date.now() - 300000).toLocaleTimeString(), level: 'INFO', module: 'MARKET_API', message: 'Spot price updated: 14.2 BDT/Unit' },
  { id: 'L-1020', timestamp: new Date(Date.now() - 600000).toLocaleTimeString(), level: 'CRIT', module: 'PHYSICAL_SEC', message: 'Door sensor trigger: Server Room B' },
];

const GRID_NODES: GridNode[] = [
  { id: 'G-01', name: 'Payra Power', type: 'generation', status: 'online', load: 1200, coordinates: { x: 20, y: 80 } },
  { id: 'G-02', name: 'Rampal Coal', type: 'generation', status: 'warning', load: 850, coordinates: { x: 30, y: 70 } },
  { id: 'G-03', name: 'Ashuganj', type: 'generation', status: 'online', load: 1400, coordinates: { x: 60, y: 40 } },
  { id: 'S-01', name: 'Dhaka North', type: 'substation', status: 'online', load: 2200, coordinates: { x: 50, y: 50 } },
  { id: 'S-02', name: 'Ctg Central', type: 'substation', status: 'online', load: 1100, coordinates: { x: 70, y: 80 } },
  { id: 'D-01', name: 'Sylhet Zone', type: 'distribution', status: 'online', load: 450, coordinates: { x: 80, y: 20 } },
  { id: 'D-02', name: 'Khulna Zone', type: 'distribution', status: 'warning', load: 600, coordinates: { x: 25, y: 60 } },
];

// --- SUB-COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    online: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    offline: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
    positive: 'bg-blue-500/20 text-blue-400 border-blue-500/50', // Added for financial tab
  };
  // Fallback for custom statuses
  const activeStyle = styles[status as keyof typeof styles] || styles.offline;
  
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${activeStyle} flex items-center gap-1.5 w-fit`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'online' ? 'bg-emerald-400 animate-pulse' : 
        status === 'warning' ? 'bg-amber-400' : 
        status === 'positive' ? 'bg-blue-400' : 'bg-rose-400'
      }`}></span>
      {status}
    </span>
  );
};

const MetricCard = ({ title, value, unit, change, isNegative, icon: Icon, color }: MetricCardProps) => (
  <div className="bg-slate-900 border border-slate-700 p-5 rounded-sm relative overflow-hidden group hover:border-slate-600 transition-all cursor-pointer">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-${color}-500/20 group-hover:scale-110`}></div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-2">
        <Icon className={`h-6 w-6 text-${color}-400`} />
        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${isNegative ? 'text-rose-400 bg-rose-900/30' : 'text-emerald-400 bg-emerald-900/30'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-mono font-bold text-white tracking-tight">{value}</span>
        <span className="text-xs text-slate-500 font-bold">{unit}</span>
      </div>
      
      {/* Micro Chart Simulation */}
      <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full bg-${color}-500 w-2/3 opacity-75`}></div>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const DashboardOverview = () => {
  const navigate = useNavigate();
  
  // State Management
  const [currentTime, setCurrentTime] = useState(new Date());
  // Added 'financial' to activeTab state type definition
  const [activeTab, setActiveTab] = useState<'overview' | 'grid' | 'logistics' | 'security' | 'financial'>('overview');
  const [securityLevel, setSecurityLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [logs, setLogs] = useState<LogEntry[]>(GENERATE_LOGS());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  
  // Real-time simulations
  const [freq, setFreq] = useState(50.00);
  const [load, setLoad] = useState(14250);
  const [temp, setTemp] = useState(32);
  const [windSpeed, setWindSpeed] = useState(12);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Clock & Data Simulation Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Randomize grid data slightly
      setFreq(prev => +(prev + (Math.random() * 0.04 - 0.02)).toFixed(3));
      setLoad(prev => Math.floor(prev + (Math.random() * 100 - 50)));
      setTemp(prev => Math.floor(prev + (Math.random() * 2 - 1)));
      setWindSpeed(prev => +(prev + (Math.random() * 1 - 0.5)).toFixed(1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Spectrum Analyzer Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const bars = 40;
    const barWidth = canvas.width / bars;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#3b82f6'; // Blue-500
      
      for (let i = 0; i < bars; i++) {
        const height = Math.random() * canvas.height;
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 1, height);
      }
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLogs(GENERATE_LOGS());
      setIsRefreshing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 pb-20">
      
      {/* --- LEVEL 1: TOP COMMAND BAR --- */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin')}>
            <div className="bg-blue-600/20 p-2 rounded border border-blue-500/30">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-widest uppercase">National Energy Command</h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-500 font-bold">SECURE LINK</span>
                <span className="text-slate-600">|</span>
                AUTH: ADMIN_LEVEL_1
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Ticker */}
        <div className="hidden 2xl:flex items-center gap-8 bg-slate-950/50 px-6 py-2 rounded-full border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Grid Freq</span>
            <span className={`text-sm font-mono font-bold ${freq < 49.9 ? 'text-rose-500' : 'text-emerald-400'}`}>{freq.toFixed(3)} Hz</span>
          </div>
          <div className="w-px h-4 bg-slate-800"></div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] text-slate-500 font-bold uppercase">Total Load</span>
             <span className="text-sm font-mono font-bold text-blue-400">{load.toLocaleString()} MW</span>
          </div>
          <div className="w-px h-4 bg-slate-800"></div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] text-slate-500 font-bold uppercase">Brent Crude</span>
             <span className="text-sm font-mono font-bold text-amber-400 flex items-center gap-1">
                $82.45 <TrendingUp className="h-3 w-3 text-emerald-500" /> {/* USED: TrendingUp for market ticker */}
             </span>
          </div>
        </div>

        {/* Right: Tools & Clock */}
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block border-r border-slate-800 pr-6">
            <div className="flex items-center justify-end gap-2 text-slate-400 mb-0.5">
               <Clock className="h-3 w-3" />
               <p className="text-[10px] font-bold uppercase">{currentTime.toLocaleDateString()}</p>
            </div>
            <p className="text-xl font-mono font-bold text-white leading-none tracking-widest">{currentTime.toLocaleTimeString()}</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 relative transition-colors group">
               <Bell className="h-5 w-5 text-slate-400 group-hover:text-white" />
               <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
             </button>
             <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 transition-colors group">
               <Radio className="h-5 w-5 text-slate-400 group-hover:text-blue-400" />
             </button>
          </div>
        </div>
      </header>

      {/* --- LEVEL 2: EMERGENCY BROADCAST BANNER --- */}
      {showAlert && (
        <div className="bg-rose-950/30 border-b border-rose-900/50 px-6 py-2 flex items-center justify-between backdrop-blur-sm animate-in slide-in-from-top duration-300">
           <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />
              <p className="text-xs font-bold text-rose-200 uppercase tracking-wide">
                 <span className="text-white bg-rose-600 px-1 rounded mr-2">PRIORITY 1</span>
                 Cyclone Warning in Coastal Belt (Signal 4) - Initiate Grid Protection Protocols.
              </p>
           </div>
           <button onClick={() => setShowAlert(false)} className="text-rose-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
           </button>
        </div>
      )}

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <main className="p-6 max-w-[1920px] mx-auto space-y-6">
        
        {/* ROW 1: KPI METRICS (Including Environmental & Logistics) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <MetricCard 
            title="Total Generation" value="14,250" unit="MW" 
            change="+2.4%" icon={Zap} color="blue" 
          />
          <MetricCard 
            title="National Reserve" value="1,240" unit="MW" 
            change="-5.1%" isNegative icon={Cpu} color="orange" 
          />
          <MetricCard 
            title="Oil Stockpile" value="42" unit="Days" 
            change="Stable" icon={Droplet} color="purple" 
          />
          
          {/* Environmental Card */}
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-sm relative overflow-hidden flex flex-col justify-between group hover:border-teal-500/50 transition-colors">
             <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 uppercase">Ambient Cond.</span>
                <Thermometer className="h-4 w-4 text-teal-400" />
             </div>
             <div className="flex items-center gap-4 mt-2">
                <div>
                   <span className="text-2xl font-mono font-bold text-white">{temp}°C</span>
                   <p className="text-[10px] text-slate-500">Avg. Plant Temp</p>
                </div>
                <div className="h-8 w-px bg-slate-700"></div>
                <div>
                   <span className="text-xl font-mono font-bold text-white flex items-center gap-1">
                      {windSpeed} <span className="text-xs text-slate-500">kn</span>
                   </span>
                   <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Wind className="h-3 w-3" /> Wind Load
                   </p>
                </div>
             </div>
             <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-900/50">
                <div className="h-full bg-teal-500 w-1/2"></div>
             </div>
          </div>

          <MetricCard 
            title="Active Tenders" value="18" unit="Files" 
            change="+3 New" icon={FileText} color="green" 
          />

          {/* Security Control Panel (Defcon) */}
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-sm flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/50 transition-colors">
            <div className="flex justify-between items-start z-10">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Threat Level</span>
              <Lock className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex items-center gap-1 my-2 z-10">
               {[1, 2, 3, 4, 5].map((lvl) => (
                 <button 
                   key={lvl}
                   onClick={() => setSecurityLevel(lvl as 1|2|3|4|5)}
                   className={`h-8 w-full rounded-sm transition-all ${
                     securityLevel >= lvl 
                       ? lvl > 3 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-blue-500' 
                       : 'bg-slate-800'
                   }`}
                 />
               ))}
            </div>
            <p className="text-xs text-center font-bold text-slate-300 z-10">
              DEFCON {6 - securityLevel} - {securityLevel > 3 ? 'ELEVATED' : 'ROUTINE'}
            </p>
            <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]"></div>
          </div>
        </section>

        {/* ROW 2: VISUALIZATION & LOGS */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[600px]">
          
          {/* LEFT: INTERACTIVE MAP (8 Cols) */}
          <div className="xl:col-span-8 bg-slate-900 border border-slate-700 rounded-sm flex flex-col relative overflow-hidden">
            {/* Map Toolbar */}
            <div className="h-12 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Map className="h-4 w-4 text-blue-500" /> NATIONAL GRID & LOGISTICS
                </h3>
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded border border-blue-500/30">GENERATION</button>
                  <button className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold rounded border border-slate-700 hover:text-white">TRANSMISSION</button>
                  <button className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold rounded border border-slate-700 hover:text-white flex items-center gap-1">
                     <Globe className="h-3 w-3" /> INT'L LINKS
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900">
                  <Satellite className="h-3 w-3" /> SAT-LINK ACTIVE
                </span>
              </div>
            </div>

            {/* The Map Canvas */}
            <div className="flex-1 relative bg-slate-950 p-4">
               {/* Grid Background */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
               
               {/* Nodes */}
               {GRID_NODES.map((node) => (
                 <div 
                    key={node.id}
                    className="absolute group cursor-pointer"
                    style={{ left: `${node.coordinates.x}%`, top: `${node.coordinates.y}%` }}
                    onClick={() => navigate('/admin/stocks')}
                 >
                    <div className={`w-3 h-3 rounded-full border-2 shadow-[0_0_15px_currentColor] transition-all group-hover:scale-150 ${
                      node.status === 'online' ? 'bg-emerald-500 border-emerald-300 text-emerald-500' : 
                      node.status === 'warning' ? 'bg-amber-500 border-amber-300 text-amber-500' : 'bg-rose-500 border-rose-300 text-rose-500'
                    }`}></div>
                    {/* Tooltip */}
                    <div className="absolute left-6 top-[-10px] bg-slate-800 border border-slate-600 p-2 rounded w-32 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl">
                       <p className="text-[10px] font-bold text-white uppercase">{node.name}</p>
                       <p className="text-[10px] text-slate-400 font-mono">Load: {node.load} MW</p>
                       <StatusBadge status={node.status} />
                       <div className="mt-1 text-[9px] text-blue-400 flex items-center">
                          Click to manage <ChevronRight className="h-2 w-2" />
                       </div>
                    </div>
                 </div>
               ))}

               {/* Logistics Overlay */}
               <div className="absolute top-[40%] right-[20%] p-2 bg-slate-800/80 border border-slate-600 rounded flex items-center gap-2 animate-pulse">
                  <Truck className="h-3 w-3 text-orange-400" />
                  <span className="text-[9px] font-bold text-orange-200">CONVOY #992</span>
               </div>
               
               {/* Simulated Connection Lines (SVG) */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                 <path d="M 20% 80% L 50% 50% L 60% 40%" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="5,5" className="animate-pulse" />
                 <path d="M 30% 70% L 25% 60% L 50% 50%" stroke="#eab308" strokeWidth="1" fill="none" />
                 <path d="M 60% 40% L 80% 20%" stroke="#3b82f6" strokeWidth="2" fill="none" />
                 <path d="M 70% 80% L 50% 50%" stroke="#3b82f6" strokeWidth="2" fill="none" />
               </svg>

               {/* Bottom Legend */}
               <div className="absolute bottom-4 left-4 bg-slate-900/90 p-3 rounded border border-slate-700 backdrop-blur shadow-lg">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                     <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> ONLINE</span>
                     <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full"></span> WARNING</span>
                     <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full"></span> FAULT</span>
                  </div>
               </div>
            </div>
          </div>

          {/* RIGHT: LOGS & ALERTS (4 Cols) */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            
            {/* Frequency Spectrum Widget */}
            <div className="bg-slate-900 border border-slate-700 rounded-sm p-4 h-1/3 flex flex-col">
               <div className="flex justify-between items-center mb-2">
                 <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                   <Activity className="h-4 w-4" /> Frequency Spectrum
                 </h4>
                 <span className="text-[10px] font-mono text-emerald-500">LIVE FEED</span>
               </div>
               <canvas ref={canvasRef} className="w-full h-full rounded bg-slate-950 border border-slate-800 opacity-80" height={100} width={300}></canvas>
            </div>

            {/* Server Health Widget */}
            <div className="bg-slate-900 border border-slate-700 rounded-sm p-4 flex flex-col gap-3">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                  <Database className="h-4 w-4" /> Server Infrastructure
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
                     <span>Primary Cluster</span>
                     <span className="text-emerald-400">ONLINE (12ms)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-[32%]"></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                     <span>CPU Load: 32%</span>
                     <span>Mem: 12GB / 64GB</span>
                  </div>
               </div>
            </div>

            {/* System Logs */}
            <div className="bg-slate-900 border border-slate-700 rounded-sm flex-1 flex flex-col overflow-hidden">
               <div className="h-10 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between px-3">
                 <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                   <Server className="h-4 w-4" /> System Events
                 </h4>
                 <button 
                    onClick={handleManualRefresh} 
                    className={`p-1 hover:bg-slate-800 rounded transition-all ${isRefreshing ? 'animate-spin text-blue-400' : 'text-slate-500'}`}
                 >
                   <RefreshCw className="h-3 w-3" />
                 </button>
               </div>
               <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                 {logs.map((log) => (
                   <div key={log.id} className="text-[10px] font-mono p-2 hover:bg-slate-800 rounded cursor-pointer border-l-2 border-transparent hover:border-blue-500 transition-all">
                     <div className="flex justify-between text-slate-500 mb-1">
                       <span>{log.timestamp}</span>
                       <span className={
                         log.level === 'CRIT' ? 'text-rose-500 font-bold' : 
                         log.level === 'WARN' ? 'text-amber-500 font-bold' : 'text-blue-400'
                       }>[{log.level}]</span>
                     </div>
                     <div className="text-slate-300 truncate">
                       <span className="text-slate-500 mr-2">{log.module}:</span>
                       {log.message}
                     </div>
                   </div>
                 ))}
               </div>
            </div>

          </div>
        </section>

        {/* ROW 3: COMPLEX DATA TABLES (Tabbed) */}
        <section className="bg-slate-900 border border-slate-700 rounded-sm overflow-hidden min-h-[400px]">
           {/* Tab Header */}
           <div className="flex border-b border-slate-800 bg-slate-950/50">
              {[
                { id: 'overview', label: 'Active Tenders', icon: FileText },
                { id: 'logistics', label: 'Marine Logistics', icon: Anchor },
                { id: 'grid', label: 'Substation Status', icon: Zap },
                { id: 'security', label: 'Personnel & Access', icon: Users },
                { id: 'financial', label: 'Fiscal Growth', icon: TrendingUp }, // USED: TrendingUp for Financial Tab
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'grid' | 'logistics' | 'security' | 'financial')}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wide border-r border-slate-800 transition-all
                    ${activeTab === tab.id 
                      ? 'bg-slate-800 text-blue-400 border-b-2 border-b-blue-500' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}
                  `}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
              <div className="flex-1"></div>
              <div className="flex items-center px-4 gap-2">
                 <div className="relative">
                    <Search className="absolute left-2 top-2 h-3 w-3 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Filter Data..." 
                      className="bg-slate-950 border border-slate-700 rounded text-xs text-slate-300 pl-7 pr-3 py-1.5 focus:outline-none focus:border-blue-500 w-48"
                    />
                 </div>
                 <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase rounded transition-colors">
                    Export CSV
                 </button>
              </div>
           </div>

           {/* Tab Content */}
           <div className="p-0">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-950 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                   <th className="p-4 border-b border-slate-800">Reference ID</th>
                   <th className="p-4 border-b border-slate-800">Entity / Vessel</th>
                   <th className="p-4 border-b border-slate-800">Type / Category</th>
                   <th className="p-4 border-b border-slate-800">Metric / Volume</th>
                   <th className="p-4 border-b border-slate-800">Origin / Location</th>
                   <th className="p-4 border-b border-slate-800">Status</th>
                   <th className="p-4 border-b border-slate-800 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="text-xs text-slate-300 font-mono">
                 {/* Simulated Rows based on active tab */}
                 {[1, 2, 3, 4, 5].map((row) => (
                   <tr key={row} className="hover:bg-slate-800/50 border-b border-slate-800/50 transition-colors group">
                     <td 
                       className="p-4 text-blue-400 font-bold group-hover:underline cursor-pointer"
                       onClick={() => navigate('/admin/import-export')}
                     >
                       {activeTab === 'overview' ? `TND-2026-${490+row}` : 
                        activeTab === 'logistics' ? `IMO-923${88+row}` : 
                        activeTab === 'financial' ? `INV-${2026}${row}` : `SUB-${10+row}`}
                     </td>
                     <td className="p-4 font-bold text-white">
                       {activeTab === 'overview' ? 'Summit Power Ltd' : 
                        activeTab === 'logistics' ? 'MT Torm Helvig' : 
                        activeTab === 'financial' ? 'Q1 Revenue' : 'Ashuganj Grid North'}
                     </td>
                     <td className="p-4 text-slate-400">
                       {activeTab === 'overview' ? 'HFO Procurement' : 
                        activeTab === 'logistics' ? 'Crude Oil Carrier' : 
                        activeTab === 'financial' ? 'Tax Revenue' : 'Step-down Transformer'}
                     </td>
                     <td className="p-4">
                       {activeTab === 'overview' ? '$12.5M USD' : 
                        activeTab === 'logistics' ? '145,000 MT' : 
                        activeTab === 'financial' ? '$45.2M BDT' : '230 KV'}
                     </td>
                     <td className="p-4 text-slate-400">
                       {activeTab === 'overview' ? 'Dhaka HQ' : 
                        activeTab === 'logistics' ? 'Ras Tanura, KSA' : 
                        activeTab === 'financial' ? 'National Treasury' : 'Zone 4'}
                     </td>
                     <td className="p-4">
                        <StatusBadge status={
                          activeTab === 'financial' ? 'positive' :
                          row === 2 ? 'warning' : 'online'
                        } />
                     </td>
                     <td className="p-4 text-right">
                       <button className="text-slate-500 hover:text-white"><MoreHorizontal className="h-4 w-4" /></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             <div className="p-3 border-t border-slate-800 bg-slate-950/30 flex justify-between items-center text-[10px] text-slate-500">
               <span>Showing 5 of 128 records</span>
               <div className="flex gap-1">
                 <button className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 flex items-center gap-1">
                    Prev
                 </button>
                 <button className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700">1</button>
                 <button className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white font-bold">2</button>
                 <button className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700">3</button>
                 <button className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 flex items-center gap-1">
                    Next <ChevronRight className="h-2 w-2" />
                 </button>
               </div>
             </div>
           </div>
        </section>

      </main>
    </div>
  );
};

export default DashboardOverview;