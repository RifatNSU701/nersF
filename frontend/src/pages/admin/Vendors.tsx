import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building, ShieldCheck, AlertOctagon, TrendingUp, Search, Filter, 
  Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, 
  X, Info, CheckCircle2, XCircle, Globe, DollarSign, Truck, 
  Scale, FileSignature, AlertTriangle, Clock, Briefcase, Activity, Radio, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- ENTERPRISE TYPES ---

type VendorStatus = 'CLEARED' | 'PENDING_AUDIT' | 'BLACKLISTED' | 'SANCTIONED';
type VendorCategory = 'FUEL_SUPPLY' | 'INFRASTRUCTURE' | 'MAINTENANCE' | 'LOGISTICS' | 'CONSULTING';

interface VendorRecord {
  id: string;
  name: string;
  origin: string; // Country code
  category: VendorCategory;
  status: VendorStatus;
  riskScore: number; // 0-100
  activeContracts: number;
  totalValue: number; // in Millions USD
  reliability: number; // Percentage
  lastAudit: string;
}

type FilterType = 'ALL' | VendorStatus;
type SortKey = 'id' | 'name' | 'category' | 'status' | 'riskScore' | 'totalValue' | 'reliability';

interface BiddingActivity {
  tenderId: string;
  vendorName: string;
  bidAmount: string;
  timestamp: string;
  riskFlag: boolean;
}

// --- MOCK INTELLIGENCE DATA ---

const INITIAL_VENDORS: VendorRecord[] = [
  { id: 'VEN-INT-001', name: 'Chevron Global Energy', origin: 'USA', category: 'FUEL_SUPPLY', status: 'CLEARED', riskScore: 12, activeContracts: 3, totalValue: 450.5, reliability: 98.2, lastAudit: '2025-11-12' },
  { id: 'VEN-INT-002', name: 'Gazprom Export LLC', origin: 'RUS', category: 'FUEL_SUPPLY', status: 'SANCTIONED', riskScore: 98, activeContracts: 0, totalValue: 0, reliability: 45.0, lastAudit: '2024-02-28' },
  { id: 'VEN-LOC-042', name: 'Summit Power Solutions', origin: 'BGD', category: 'INFRASTRUCTURE', status: 'CLEARED', riskScore: 24, activeContracts: 5, totalValue: 125.0, reliability: 94.5, lastAudit: '2026-01-15' },
  { id: 'VEN-INT-015', name: 'Siemens Energy AG', origin: 'DEU', category: 'MAINTENANCE', status: 'CLEARED', riskScore: 8, activeContracts: 2, totalValue: 85.2, reliability: 99.1, lastAudit: '2025-10-05' },
  { id: 'VEN-LOC-088', name: 'Desh Logistics Corp', origin: 'BGD', category: 'LOGISTICS', status: 'PENDING_AUDIT', riskScore: 65, activeContracts: 1, totalValue: 12.4, reliability: 82.0, lastAudit: '2026-02-10' },
  { id: 'VEN-INT-033', name: 'Adani Ports & SEZ', origin: 'IND', category: 'LOGISTICS', status: 'CLEARED', riskScore: 42, activeContracts: 2, totalValue: 310.0, reliability: 88.5, lastAudit: '2025-08-22' },
  { id: 'VEN-INT-045', name: 'Sinopec Engineering', origin: 'CHN', category: 'INFRASTRUCTURE', status: 'CLEARED', riskScore: 35, activeContracts: 4, totalValue: 620.8, reliability: 91.2, lastAudit: '2025-12-01' },
  { id: 'VEN-LOC-091', name: 'Bengal Turbine Services', origin: 'BGD', category: 'MAINTENANCE', status: 'BLACKLISTED', riskScore: 88, activeContracts: 0, totalValue: 0, reliability: 55.4, lastAudit: '2025-06-14' },
  { id: 'VEN-INT-062', name: 'McKinsey & Company', origin: 'USA', category: 'CONSULTING', status: 'CLEARED', riskScore: 5, activeContracts: 1, totalValue: 8.5, reliability: 99.9, lastAudit: '2026-01-20' },
  { id: 'VEN-INT-077', name: 'Petronas Trading', origin: 'MYS', category: 'FUEL_SUPPLY', status: 'PENDING_AUDIT', riskScore: 28, activeContracts: 0, totalValue: 0, reliability: 95.0, lastAudit: '2026-02-22' },
  { id: 'VEN-LOC-105', name: 'Meghna Petroleum Logistics', origin: 'BGD', category: 'LOGISTICS', status: 'CLEARED', riskScore: 18, activeContracts: 6, totalValue: 45.6, reliability: 96.7, lastAudit: '2026-01-05' },
  { id: 'VEN-INT-089', name: 'General Electric (GE)', origin: 'USA', category: 'INFRASTRUCTURE', status: 'CLEARED', riskScore: 10, activeContracts: 3, totalValue: 215.0, reliability: 97.8, lastAudit: '2025-09-30' },
];

const RECENT_BIDS: BiddingActivity[] = [
  { tenderId: 'TND-26-092', vendorName: 'Petronas Trading', bidAmount: '$42.5M', timestamp: '10:45 AM', riskFlag: false },
  { tenderId: 'TND-26-092', vendorName: 'Gazprom Export LLC', bidAmount: '$38.0M', timestamp: '10:12 AM', riskFlag: true },
  { tenderId: 'TND-26-088', vendorName: 'Siemens Energy AG', bidAmount: '$18.2M', timestamp: '09:30 AM', riskFlag: false },
  { tenderId: 'TND-26-088', vendorName: 'Bengal Turbine Services', bidAmount: '$12.1M', timestamp: '08:15 AM', riskFlag: true },
];

// --- SUB-COMPONENTS ---

// FIXED: Utilized XCircle & Clock perfectly inside the Status Badge
const StatusBadge = ({ status }: { status: VendorStatus }) => {
  const styles = {
    CLEARED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    PENDING_AUDIT: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    BLACKLISTED: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
    SANCTIONED: 'bg-purple-900/40 text-purple-400 border-purple-500/50',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[status]} flex items-center gap-1.5 w-fit`}>
      {status === 'CLEARED' ? <CheckCircle2 className="h-3 w-3" /> : 
       status === 'PENDING_AUDIT' ? <Clock className="h-3 w-3 animate-pulse" /> : 
       status === 'SANCTIONED' ? <AlertOctagon className="h-3 w-3" /> : 
       <XCircle className="h-3 w-3" />}
      {status.replace('_', ' ')}
    </span>
  );
};

// --- MAIN COMPONENT ---

const Vendors = () => {
  const navigate = useNavigate();
  
  // State
  const [vendors, setVendors] = useState<VendorRecord[]>(INITIAL_VENDORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'totalValue', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [currentTime, setCurrentTime] = useState(new Date());

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'alert' | 'info' } | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<VendorRecord | null>(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg: string, type: 'success' | 'alert' | 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- ACTIONS ---

  const handleAction = (vendorId: string, action: 'APPROVE' | 'REVOKE' | 'BLACKLIST') => {
    setVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        let newStatus: VendorStatus = v.status;
        let msg = '';
        let type: 'success' | 'alert' | 'info' = 'info';

        if (action === 'APPROVE') {
          newStatus = 'CLEARED';
          msg = `Compliance Cleared: ${v.name} is now approved for procurement.`;
          type = 'success';
        } else if (action === 'REVOKE') {
          newStatus = 'PENDING_AUDIT';
          msg = `Clearance Suspended: ${v.name} flagged for mandatory financial audit.`;
          type = 'alert';
        } else if (action === 'BLACKLIST') {
          newStatus = 'BLACKLISTED';
          msg = `CRITICAL: ${v.name} has been added to the National Blacklist. Contracts frozen.`;
          type = 'alert';
        }
        triggerToast(msg, type);
        
        const updatedVendor = { ...v, status: newStatus };
        if (selectedVendor?.id === vendorId) setSelectedVendor(updatedVendor);
        
        return updatedVendor;
      }
      return v;
    }));
  };

  // --- SORTING & FILTERING ---

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedVendors = useMemo(() => {
    const filtered = vendors.filter(v => 
      (activeFilter === 'ALL' || v.status === activeFilter) &&
      (v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
       v.origin.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [vendors, activeFilter, searchQuery, sortConfig]);

  const totalPages = Math.ceil(processedVendors.length / itemsPerPage);
  const currentData = processedVendors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    const headers = "Vendor ID,Name,Origin,Category,Status,Risk Score,Active Contracts,Total Value (M USD),Reliability %\n";
    const rows = processedVendors.map(v => 
      `${v.id},"${v.name}",${v.origin},${v.category},${v.status},${v.riskScore},${v.activeContracts},${v.totalValue},${v.reliability}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `NERSF_Vendor_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    triggerToast('Secure Vendor Registry exported to local drive.', 'success');
  };

  const totalEscrow = vendors.filter(v => v.status === 'CLEARED').reduce((acc, curr) => acc + curr.totalValue, 0);
  const pendingAudits = vendors.filter(v => v.status === 'PENDING_AUDIT').length;
  const highRiskCount = vendors.filter(v => v.riskScore > 75 || v.status === 'BLACKLISTED' || v.status === 'SANCTIONED').length;

  return (
    <div className="space-y-6 font-sans text-slate-200 relative pb-20">
      
      {/* --- TOAST --- */}
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

      {/* --- TOP COMMAND HEADER --- */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin')}>
            <div className="bg-purple-600/20 p-2 rounded border border-purple-500/30">
              <Briefcase className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-widest uppercase">Procurement & Vendor Command</h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-500 font-bold">KYC / AML ACTIVE</span>
                <span className="text-slate-600">|</span>
                FINANCE SECURE
              </div>
            </div>
          </div>
        </div>

        {/* Center Ticker */}
        <div className="hidden xl:flex items-center gap-8 bg-slate-950/50 px-6 py-2 rounded-full border border-slate-800 shadow-inner">
           <div className="flex items-center gap-2">
             <span className="text-[10px] text-slate-500 font-bold uppercase">System Auth</span>
             <span className="text-sm font-mono font-bold text-emerald-400">Lvl-4 (Ministerial)</span>
           </div>
           <div className="w-px h-4 bg-slate-800"></div>
           <div className="flex items-center gap-2">
             <span className="text-[10px] text-slate-500 font-bold uppercase">Global Sanctions Sync</span>
             <span className="text-sm font-mono font-bold text-blue-400">Synced: 2m ago</span>
           </div>
        </div>

        {/* Right Tools */}
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
             </button>
             <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 transition-colors group">
               <Activity className="h-5 w-5 text-slate-400 group-hover:text-purple-400" />
             </button>
             {/* FIXED: Utilized Radio Icon Perfectly */}
             <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 relative transition-colors group" title="Secure Comms Link">
               <Radio className="h-5 w-5 text-slate-400 group-hover:text-emerald-400" />
               <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
             </button>
          </div>
        </div>
      </header>

      {/* --- KPI MACRO DATA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pt-6">
        {[
          { title: "Registered Entities", val: vendors.length.toString(), unit: "Vendors", icon: Building, color: "blue", trend: "+2 this week" },
          { title: "Active Escrow (L/C)", val: `$${totalEscrow.toFixed(1)}`, unit: "Mil USD", icon: DollarSign, color: "emerald", trend: "Fully Backed" },
          { title: "Pending Clearances", val: pendingAudits.toString(), unit: "Audits", icon: FileSignature, color: "amber", trend: "Requires Action" },
          { title: "Blacklist / High Risk", val: highRiskCount.toString(), unit: "Entities", icon: AlertOctagon, color: "rose", trend: "OFAC Synced" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-700 p-5 rounded-sm relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-20 h-20 bg-${kpi.color}-500/10 rounded-full blur-xl group-hover:bg-${kpi.color}-500/20 transition-all`}></div>
            <div className="flex justify-between items-start mb-2">
              <kpi.icon className={`h-5 w-5 text-${kpi.color}-400`} />
              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${
                kpi.color === 'rose' ? 'bg-rose-900/30 text-rose-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {kpi.trend}
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

      {/* --- MID SECTION: PROCUREMENT PIPELINE & RISK --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 px-6">
        
        {/* LEFT: Live Bidding (6 Cols) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-700 rounded-sm flex flex-col h-[350px]">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <TrendingUp className="h-4 w-4 text-blue-500" /> Live Contract Bidding
            </h3>
            <button onClick={() => navigate('/tenders')} className="text-[10px] font-bold text-blue-400 hover:text-white uppercase transition-colors">
              Manage Tenders &rarr;
            </button>
          </div>
          <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950/80 text-[9px] uppercase text-slate-500 font-bold sticky top-0">
                   <tr>
                      <th className="px-4 py-2 border-b border-slate-800">Tender Ref</th>
                      <th className="px-4 py-2 border-b border-slate-800">Bidding Entity</th>
                      <th className="px-4 py-2 border-b border-slate-800">Amount</th>
                      <th className="px-4 py-2 border-b border-slate-800 text-right">Time</th>
                   </tr>
                </thead>
                <tbody className="text-xs text-slate-300 font-mono">
                   {RECENT_BIDS.map((bid, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 border-b border-slate-800/50 transition-colors">
                         <td className="px-4 py-3 text-blue-400 font-bold cursor-pointer hover:underline">{bid.tenderId}</td>
                         <td className="px-4 py-3 flex items-center gap-2">
                           {bid.vendorName}
                           {/* FIXED: title prop issue mapped inside a secure span */}
                           {bid.riskFlag && <span title="Entity on Watchlist"><AlertTriangle className="h-3 w-3 text-rose-500 cursor-help" /></span>}
                         </td>
                         <td className="px-4 py-3 font-bold text-emerald-400">{bid.bidAmount}</td>
                         <td className="px-4 py-3 text-right text-slate-500">{bid.timestamp}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* RIGHT: Compliance Framework (6 Cols) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-700 rounded-sm flex flex-col h-[350px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0,transparent_70%)] pointer-events-none"></div>
          
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 z-10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Scale className="h-4 w-4 text-purple-500" /> Global Compliance Framework
            </h3>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">KYC / AML ENGINE</span>
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-center space-y-6 z-10">
             <div className="flex items-center gap-4 bg-slate-950 p-4 rounded border border-slate-800">
                <Globe className="h-8 w-8 text-blue-500 opacity-80" />
                <div className="flex-1">
                   <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold text-slate-300 uppercase">UN Security Council Sanctions</span>
                      <span className="text-[10px] text-emerald-400 font-bold">100% SYNCED</span>
                   </div>
                   <div className="w-full bg-slate-800 h-1.5 rounded-full"><div className="h-full bg-emerald-500 w-full"></div></div>
                </div>
             </div>

             <div className="flex items-center gap-4 bg-slate-950 p-4 rounded border border-slate-800">
                <ShieldCheck className="h-8 w-8 text-purple-500 opacity-80" />
                <div className="flex-1">
                   <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold text-slate-300 uppercase">Financial Intelligence Unit (FIU)</span>
                      <span className="text-[10px] text-amber-400 font-bold animate-pulse">2 FLAGS PENDING</span>
                   </div>
                   <div className="w-full bg-slate-800 h-1.5 rounded-full"><div className="h-full bg-amber-500 w-[85%]"></div></div>
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* --- BOTTOM: VENDOR REGISTRY DIRECTORY (DATA TABLE) --- */}
      <div className="bg-slate-900 border border-slate-700 rounded-sm overflow-hidden flex flex-col min-h-[500px] mx-6">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Master Vendor Registry</h3>
            <span className="text-[10px] text-slate-400 uppercase">Secure Database Matrix</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search entity, ID, or Origin..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
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
                  setCurrentPage(1);
                }} 
                className="bg-slate-950 border border-slate-700 rounded text-xs font-bold text-slate-300 pl-9 pr-8 py-2 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition-colors"
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="CLEARED">CLEARED ONLY</option>
                <option value="PENDING_AUDIT">PENDING AUDIT</option>
                <option value="BLACKLISTED">BLACKLISTED</option>
                <option value="SANCTIONED">SANCTIONED</option>
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
                  Registry ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                  Corporate Entity {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800">Origin</th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('category')}>
                  Sector {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('riskScore')}>
                  Risk Index {sortConfig.key === 'riskScore' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('totalValue')}>
                  L/C Value {sortConfig.key === 'totalValue' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('reliability')}>
                  Reliability {sortConfig.key === 'reliability' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800">Clearance Status</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {currentData.map((vendor) => (
                <tr 
                  key={vendor.id} 
                  onClick={() => setSelectedVendor(vendor)}
                  className={`border-b border-slate-800/50 transition-colors cursor-pointer group hover:bg-slate-800/40 ${
                    vendor.status === 'SANCTIONED' ? 'bg-rose-950/10' : ''
                  }`}
                >
                  <td className="p-4 font-mono text-blue-400 group-hover:underline">{vendor.id}</td>
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                     {vendor.name}
                     {vendor.status === 'CLEARED' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                     {(vendor.status === 'BLACKLISTED' || vendor.status === 'SANCTIONED') && <AlertOctagon className="h-3 w-3 text-rose-500" />}
                  </td>
                  <td className="p-4 text-slate-400 font-mono">{vendor.origin}</td>
                  <td className="p-4">
                    {/* FIXED: Utilized Truck Icon perfectly for Logistics */}
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase border bg-slate-800 text-slate-400 border-slate-600 flex items-center gap-1 w-fit">
                      {vendor.category === 'LOGISTICS' && <Truck className="h-3 w-3 text-slate-400" />}
                      {vendor.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className={`font-mono font-bold ${vendor.riskScore > 70 ? 'text-rose-400' : vendor.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {vendor.riskScore}/100
                       </span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-400">${vendor.totalValue.toFixed(1)}M</td>
                  <td className="p-4 font-mono">
                     <div className="flex items-center gap-2">
                        {vendor.reliability}%
                        <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className={`h-full ${vendor.reliability > 90 ? 'bg-emerald-500' : vendor.reliability > 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{width: `${vendor.reliability}%`}}></div>
                        </div>
                     </div>
                  </td>
                  <td className="p-4">
                     <StatusBadge status={vendor.status} />
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest">
                    No Vendors Found matching criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center text-[10px] text-slate-400 font-bold">
           <span>SHOWING {processedVendors.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} TO {Math.min(currentPage * itemsPerPage, processedVendors.length)} OF {processedVendors.length} RECORDS</span>
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

      {/* --- VENDOR DETAIL MODAL --- */}
      {selectedVendor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-950/50">
                 <div className="flex items-center gap-4">
                    <div className={`p-3 rounded border ${
                       selectedVendor.status === 'CLEARED' ? 'bg-emerald-500/20 border-emerald-500/30' :
                       selectedVendor.status === 'PENDING_AUDIT' ? 'bg-amber-500/20 border-amber-500/30' :
                       'bg-rose-500/20 border-rose-500/30'
                    }`}>
                       <Building className={`h-6 w-6 ${
                         selectedVendor.status === 'CLEARED' ? 'text-emerald-400' :
                         selectedVendor.status === 'PENDING_AUDIT' ? 'text-amber-400' : 'text-rose-400'
                       }`} />
                    </div>
                    <div>
                       <h2 className="text-xl font-bold text-white uppercase flex items-center gap-2">
                          {selectedVendor.name}
                          {selectedVendor.origin && <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">{selectedVendor.origin}</span>}
                       </h2>
                       <p className="text-xs text-slate-400 font-mono mt-1">REGISTRY ID: {selectedVendor.id} | SECTOR: {selectedVendor.category.replace('_', ' ')}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedVendor(null)} className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors">
                    <X className="h-6 w-6" />
                 </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900">
                 
                 {/* Left Col: Compliance & Risk */}
                 <div className="space-y-6">
                    <div>
                       <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Compliance Status</h4>
                       <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-slate-300">Clearance Level</span>
                             <StatusBadge status={selectedVendor.status} />
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-slate-300">Last Financial Audit</span>
                             <span className="text-sm font-mono text-slate-400">{selectedVendor.lastAudit}</span>
                          </div>
                       </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                       <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 flex justify-between">
                          Calculated Risk Score
                          <span className="text-blue-400 cursor-pointer hover:underline">View Matrix</span>
                       </h4>
                       <div className="flex items-end gap-3 mb-2">
                          <span className={`text-4xl font-mono font-bold leading-none ${
                             selectedVendor.riskScore > 75 ? 'text-rose-500' : 
                             selectedVendor.riskScore > 30 ? 'text-amber-500' : 'text-emerald-500'
                          }`}>{selectedVendor.riskScore}</span>
                          <span className="text-xs text-slate-500 mb-1">/ 100</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${
                             selectedVendor.riskScore > 75 ? 'bg-rose-500' : 
                             selectedVendor.riskScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} style={{ width: `${selectedVendor.riskScore}%` }}></div>
                       </div>
                       <p className="text-[10px] text-slate-500 mt-2">
                         {selectedVendor.riskScore > 75 ? 'High probability of sanctions or default. Do not engage.' : 
                          selectedVendor.riskScore > 30 ? 'Moderate risk. Standard L/C terms apply.' : 
                          'Low risk. Preferred government supplier status.'}
                       </p>
                    </div>
                 </div>
                 
                 {/* Right Col: Financials & Operations */}
                 <div className="space-y-6">
                    <div>
                       <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Operational Metrics</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-950 p-3 rounded border border-slate-800">
                             <p className="text-[10px] text-slate-500 uppercase">Active Contracts</p>
                             <p className="text-2xl font-mono font-bold text-white mt-1">{selectedVendor.activeContracts}</p>
                          </div>
                          <div className="bg-slate-950 p-3 rounded border border-slate-800">
                             <p className="text-[10px] text-slate-500 uppercase">Reliability Index</p>
                             <p className="text-2xl font-mono font-bold text-white mt-1">{selectedVendor.reliability}%</p>
                          </div>
                       </div>
                    </div>

                    <div>
                       <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Financial Exposure (Escrow)</h4>
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                             <DollarSign className="h-6 w-6 text-emerald-500" />
                          </div>
                          <div>
                             <p className="text-3xl font-mono font-bold text-emerald-400 leading-none mb-1">
                                ${selectedVendor.totalValue.toFixed(2)} <span className="text-sm text-emerald-600">Million</span>
                             </p>
                             <p className="text-[10px] text-slate-400 uppercase">Total Letters of Credit (L/C) Value</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Modal Actions (Command & Control) */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex flex-wrap justify-end gap-3">
                 {selectedVendor.status === 'CLEARED' && (
                   <button 
                     onClick={() => handleAction(selectedVendor.id, 'REVOKE')}
                     className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/50 text-amber-400 text-xs font-bold uppercase rounded transition-colors flex items-center gap-2"
                   >
                     <AlertTriangle className="h-3 w-3" /> Revoke Clearance
                   </button>
                 )}
                 {selectedVendor.status === 'PENDING_AUDIT' && (
                   <button 
                     onClick={() => handleAction(selectedVendor.id, 'APPROVE')}
                     className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-400 text-xs font-bold uppercase rounded transition-colors flex items-center gap-2"
                   >
                     <CheckCircle2 className="h-3 w-3" /> Approve & Clear
                   </button>
                 )}
                 {selectedVendor.status !== 'BLACKLISTED' && selectedVendor.status !== 'SANCTIONED' && (
                   <button 
                     onClick={() => handleAction(selectedVendor.id, 'BLACKLIST')}
                     className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/50 text-rose-400 text-xs font-bold uppercase rounded transition-colors flex items-center gap-2"
                   >
                     <AlertOctagon className="h-3 w-3" /> Add to Blacklist
                   </button>
                 )}
                 <div className="w-px h-8 bg-slate-800 mx-2"></div>
                 <button onClick={() => setSelectedVendor(null)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded transition-colors">
                    Close
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Vendors;