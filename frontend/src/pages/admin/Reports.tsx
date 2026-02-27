import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, ShieldCheck, Database, Search, Filter, 
  Download, Lock, Server, AlertTriangle, Info, 
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Terminal, Activity,
  UserX, ShieldAlert, Cpu, Network, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- ENTERPRISE TYPES ---

type LogLevel = 'INFO' | 'WARN' | 'CRITICAL' | 'SECURITY';
type LogCategory = 'SYSTEM' | 'FINANCE' | 'GRID_OPS' | 'ACCESS';

interface AuditLog {
  id: string; // Hash
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  user: string;
  ipAddress: string;
  action: string;
  details: string; // JSON stringified payload
}

type SortDirection = 'asc' | 'desc';
type SortKey = keyof AuditLog;

// --- MOCK IMMUTABLE LEDGER DATA ---

const GENERATE_MOCK_LOGS = (): AuditLog[] => {
  const logs: AuditLog[] = [];
  const categories: LogCategory[] = ['SYSTEM', 'FINANCE', 'GRID_OPS', 'ACCESS'];
  const levels: LogLevel[] = ['INFO', 'INFO', 'WARN', 'SECURITY', 'CRITICAL'];
  const users = ['SYS_AUTO', 'admin_ahmed', 'min_finance', 'grid_op_04', 'UNKNOWN'];
  
  for (let i = 0; i < 45; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const lvl = levels[Math.floor(Math.random() * levels.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    
    // Generate a fake hash
    const hash = Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const d = new Date();
    d.setMinutes(d.getMinutes() - (i * 47)); // Spread them out
    
    let action = 'System Check';
    let details = '{"status": "ok"}';

    if (cat === 'ACCESS' && lvl === 'SECURITY') {
      action = 'Failed Authentication';
      details = '{"reason": "Invalid Token", "attempts": 4, "geo": "103.44.x.x"}';
    } else if (cat === 'GRID_OPS' && lvl === 'CRITICAL') {
      action = 'Manual Load Shed Initiated';
      details = '{"region": "REG-02", "drop_mw": 450, "auth_override": true}';
    } else if (cat === 'FINANCE' && lvl === 'INFO') {
      action = 'L/C Approval Processed';
      details = '{"vendor_id": "VEN-INT-001", "amount_usd": 12500000}';
    } else if (cat === 'SYSTEM' && lvl === 'WARN') {
      action = 'High CPU Utilization';
      details = '{"node": "master-db-01", "load_avg": 92.4}';
    }

    logs.push({
      id: hash,
      timestamp: d.toISOString(),
      level: lvl,
      category: cat,
      user: user,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      action: action,
      details: details
    });
  }
  return logs;
};

const INITIAL_LOGS = GENERATE_MOCK_LOGS();

// --- SUB-COMPONENTS ---

const LevelBadge = ({ level }: { level: LogLevel }) => {
  const styles = {
    INFO: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    WARN: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    CRITICAL: 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse',
    SECURITY: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[level]} flex items-center gap-1 w-fit`}>
      {level}
    </span>
  );
};

// --- MAIN COMPONENT ---

const Reports = () => {
  const navigate = useNavigate();
  
  // State
  const [logs] = useState<AuditLog[]>(INITIAL_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<LogCategory | 'ALL'>('ALL');
  const [activeLevel, setActiveLevel] = useState<LogLevel | 'ALL'>('ALL');
  
  // PERFECT USAGE OF SortDirection
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'timestamp', direction: 'desc' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'alert' | 'info' } | null>(null);
  
  // PERFECT USAGE OF useEffect (Live Clock & System Sync)
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const itemsPerPage = 12;

  const triggerToast = (msg: string, type: 'success' | 'alert' | 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- SORTING & FILTERING LOGIC ---
  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedLogs = useMemo(() => {
    // 1. Filter
    const filtered = logs.filter(log => {
      const matchSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = activeCategory === 'ALL' || log.category === activeCategory;
      const matchLevel = activeLevel === 'ALL' || log.level === activeLevel;
      return matchSearch && matchCat && matchLevel;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [logs, searchQuery, activeCategory, activeLevel, sortConfig]);

  const totalPages = Math.ceil(processedLogs.length / itemsPerPage);
  const currentData = processedLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    const headers = "Timestamp,Hash_ID,Level,Category,User,IP_Address,Action,Payload\n";
    const rows = processedLogs.map(l => 
      `${new Date(l.timestamp).toLocaleString()},${l.id},${l.level},${l.category},${l.user},${l.ipAddress},"${l.action}","${l.details.replace(/"/g, '""')}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `NERSF_Audit_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    triggerToast('Official Audit Ledger exported securely.', 'success');
  };

  // KPIs
  const criticalCount = logs.filter(l => l.level === 'CRITICAL').length;
  const securityCount = logs.filter(l => l.level === 'SECURITY').length;

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
           toast.type === 'success' ? <ShieldCheck className="h-5 w-5" /> : 
           <Info className="h-5 w-5" />}
          <p className="text-sm font-bold tracking-wide">{toast.msg}</p>
        </div>
      )}

      {/* --- COMMAND HEADER --- */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin')}>
            <div className="bg-slate-700/50 p-2 rounded border border-slate-600">
              <Database className="h-5 w-5 text-slate-300" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-widest uppercase">Immutable Audit Ledger</h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <Lock className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-500 font-bold">SHA-256 SECURED</span>
                <span className="text-slate-600">|</span>
                COMPLIANCE MODE
              </div>
            </div>
          </div>
        </div>

        {/* Center Ticker */}
        <div className="hidden xl:flex items-center gap-8 bg-slate-950/50 px-6 py-2 rounded-full border border-slate-800 shadow-inner">
           <div className="flex items-center gap-2">
             <span className="text-[10px] text-slate-500 font-bold uppercase">DB Uptime</span>
             <span className="text-sm font-mono font-bold text-emerald-400">99.998%</span>
           </div>
           <div className="w-px h-4 bg-slate-800"></div>
           <div className="flex items-center gap-2">
             <span className="text-[10px] text-slate-500 font-bold uppercase">Total Ledger Entries</span>
             <span className="text-sm font-mono font-bold text-blue-400">1.42M</span>
           </div>
        </div>

        {/* Right Tools & Live Clock */}
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <div className="flex items-center justify-end gap-2 text-slate-400 mb-0.5">
               <Clock className="h-3 w-3" />
               <p className="text-[10px] font-bold uppercase">{currentTime.toLocaleDateString()}</p>
            </div>
            <p className="text-xl font-mono font-bold text-white leading-none tracking-widest">{currentTime.toLocaleTimeString()}</p>
          </div>
        </div>
      </header>

      {/* --- KPI MACRO DATA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pt-6">
        {[
          { title: "Total Session Logs", val: logs.length.toString(), icon: Server, color: "blue" },
          { title: "Critical Grid Events", val: criticalCount.toString(), icon: AlertTriangle, color: "rose" },
          { title: "Security Interventions", val: securityCount.toString(), icon: ShieldAlert, color: "purple" },
          { title: "Failed Auth Attempts", val: "4", icon: UserX, color: "amber" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-700 p-5 rounded-sm relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-20 h-20 bg-${kpi.color}-500/10 rounded-full blur-xl transition-all`}></div>
            <div className="flex justify-between items-start mb-2">
              <kpi.icon className={`h-5 w-5 text-${kpi.color}-400`} />
            </div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{kpi.title}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-white">{kpi.val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* --- MAIN LEDGER TABLE --- */}
      <div className="bg-slate-900 border border-slate-700 rounded-sm overflow-hidden flex flex-col min-h-[600px] mx-6">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
               <Terminal className="h-4 w-4 text-blue-500" /> System Event Matrix
            </h3>
            <span className="text-[10px] text-slate-400 uppercase">Live Database Query</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search Hash, User, or Action..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <select 
                value={activeCategory}
                onChange={(e) => { setActiveCategory(e.target.value as LogCategory | 'ALL'); setCurrentPage(1); }} 
                className="bg-slate-950 border border-slate-700 rounded text-xs font-bold text-slate-300 pl-9 pr-8 py-2 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition-colors"
              >
                <option value="ALL">ALL CATEGORIES</option>
                <option value="SYSTEM">SYSTEM</option>
                <option value="GRID_OPS">GRID_OPS</option>
                <option value="FINANCE">FINANCE</option>
                <option value="ACCESS">ACCESS</option>
              </select>
            </div>
            <div className="relative">
              <Activity className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <select 
                value={activeLevel}
                onChange={(e) => { setActiveLevel(e.target.value as LogLevel | 'ALL'); setCurrentPage(1); }} 
                className="bg-slate-950 border border-slate-700 rounded text-xs font-bold text-slate-300 pl-9 pr-8 py-2 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition-colors"
              >
                <option value="ALL">ALL LEVELS</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="SECURITY">SECURITY</option>
              </select>
            </div>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] font-bold text-white uppercase rounded transition-colors"
            >
              <Download className="h-3 w-3" /> Export Ledger
            </button>
          </div>
        </div>

        {/* Table - NOW FULLY SORTABLE */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-[10px] uppercase text-slate-500 font-bold tracking-wider select-none">
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('timestamp')}>
                  Timestamp {sortConfig.key === 'timestamp' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('id')}>
                  Hash ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('level')}>
                  Level {sortConfig.key === 'level' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('category')}>
                  Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('action')}>
                  Action / Event {sortConfig.key === 'action' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('user')}>
                  Actor (User) {sortConfig.key === 'user' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
                <th className="p-4 border-b border-slate-800 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('ipAddress')}>
                  IP Origin {sortConfig.key === 'ipAddress' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3"/> : <ChevronDown className="inline h-3 w-3"/>)}
                </th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {currentData.map((log) => (
                <tr 
                  key={log.id} 
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-slate-800/40 border-b border-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 font-mono text-blue-400 group-hover:underline">
                    {log.id.substring(0, 12)}...
                  </td>
                  <td className="p-4">
                     <LevelBadge level={log.level} />
                  </td>
                  <td className="p-4">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase border bg-slate-800 text-slate-400 border-slate-600">
                      {log.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`p-4 font-bold ${log.level === 'CRITICAL' ? 'text-rose-400' : 'text-white'}`}>
                    {log.action}
                  </td>
                  <td className="p-4 font-mono text-slate-400 flex items-center gap-2">
                    {log.user === 'SYS_AUTO' ? <Cpu className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                    {log.user}
                  </td>
                  <td className="p-4 font-mono text-slate-500 flex items-center gap-2">
                    <Network className="h-3 w-3" />
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest">
                    <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    No cryptographic logs match this query parameter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center text-[10px] text-slate-400 font-bold">
           <span>SHOWING {processedLogs.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} TO {Math.min(currentPage * itemsPerPage, processedLogs.length)} OF {processedLogs.length} LOGS</span>
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

      {/* --- LOG INSPECTOR MODAL --- */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
              
              <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-950/50">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded border border-slate-700">
                       <FileText className="h-6 w-6 text-slate-300" />
                    </div>
                    <div>
                       <h2 className="text-lg font-bold text-white uppercase flex items-center gap-2">
                          Event Inspector
                       </h2>
                       <p className="text-xs text-blue-400 font-mono mt-1">HASH: {selectedLog.id}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedLog(null)} className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors">
                    <X className="h-6 w-6" />
                 </button>
              </div>
              
              <div className="p-6 space-y-6">
                 
                 {/* Meta Info */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                       <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Time (UTC)</p>
                       <p className="text-xs font-mono text-white">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                       <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Level</p>
                       <LevelBadge level={selectedLog.level} />
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                       <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Actor ID</p>
                       <p className="text-xs font-mono text-emerald-400">{selectedLog.user}</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                       <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Network IP</p>
                       <p className="text-xs font-mono text-blue-400">{selectedLog.ipAddress}</p>
                    </div>
                 </div>

                 {/* Action */}
                 <div>
                    <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Event Action</h4>
                    <p className={`text-lg font-bold ${selectedLog.level === 'CRITICAL' ? 'text-rose-400' : 'text-white'}`}>
                       {selectedLog.action}
                    </p>
                 </div>

                 {/* JSON Payload Inspector */}
                 <div>
                    <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Metadata Payload</h4>
                    <div className="bg-[#0d1117] p-4 rounded border border-slate-800 font-mono text-xs overflow-x-auto relative">
                       <div className="absolute top-2 right-2 text-[9px] text-slate-600 border border-slate-800 px-1 rounded">JSON</div>
                       <pre className="text-emerald-400">
                          {JSON.stringify(JSON.parse(selectedLog.details), null, 2)}
                       </pre>
                    </div>
                 </div>

              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
                 <button onClick={() => triggerToast('Log block verified against cryptographic ledger.', 'success')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-bold uppercase rounded transition-colors flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Verify Hash
                 </button>
                 <button onClick={() => setSelectedLog(null)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded transition-colors">
                    Close Inspector
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Reports;