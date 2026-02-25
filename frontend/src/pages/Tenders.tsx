import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { 
  Search, Filter, Download, Calendar, FileText, X, 
  CheckCircle, RefreshCw, DollarSign, Activity, List, Grid, 
  Clock, Shield, Printer, Briefcase
} from 'lucide-react';

// --- TYPES ---
interface Tender {
  id: string;
  title: string;
  department: string;
  method: 'NCT' | 'ICT' | 'OTM' | 'RFQ';
  deadline: string;
  published: string;
  status: 'Open' | 'Closing Soon' | 'Evaluation' | 'Awarded';
  value: string;
  category: string;
  description: string;
  location: string;
  security: string;
}

const Tenders = () => {
  // --- STATE ---
  const [viewMode, setViewMode] = useState<'Grid' | 'List'>('List');
  const [inputType, setInputType] = useState('All');
  const [inputStatus, setInputStatus] = useState('All');
  const [inputSearch, setInputSearch] = useState('');
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  
  // PRO FEATURE: MY BIDS LOGIC
  const [myBids, setMyBids] = useState<string[]>([]); // Stores IDs of submitted bids
  const [showMyBidsOnly, setShowMyBidsOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- MOCK DATA ---
  const tenders: Tender[] = [
    {
      id: "NER-2026-001",
      title: "Supply of 50,000 MT High-Speed Diesel (HSD)",
      department: "Bangladesh Petroleum Corp (BPC)",
      method: "ICT",
      published: "2026-01-15",
      deadline: "2026-03-15",
      status: "Open",
      value: "BDT 450 Crore",
      category: "Oil & Gas",
      description: "International tender for the supply of High-Speed Diesel to Chittagong Port. Supplier must provide quality assurance certification ISO-9001.",
      location: "Chittagong Port",
      security: "BDT 5.0 Crore"
    },
    {
      id: "NER-2026-042",
      title: "Construction of LNG Floating Terminal at Matarbari",
      department: "Petrobangla",
      method: "ICT",
      published: "2026-01-20",
      deadline: "2026-04-10",
      status: "Closing Soon",
      value: "BDT 1,200 Crore",
      category: "Infrastructure",
      description: "EPC Contract for floating storage and regasification unit (FSRU). Requires deep-sea engineering experience.",
      location: "Matarbari, Cox's Bazar",
      security: "BDT 25.0 Crore"
    },
    {
      id: "NER-2026-089",
      title: "Maintenance of National Grid Transmission Lines (Zone 4)",
      department: "Power Grid Company (PGCB)",
      method: "NCT",
      published: "2026-02-01",
      deadline: "2026-02-28",
      status: "Evaluation",
      value: "BDT 85 Crore",
      category: "Maintenance",
      description: "Routine maintenance and emergency repair services for 400kV transmission lines in the Comilla zone.",
      location: "Comilla Zone",
      security: "BDT 1.5 Crore"
    },
    {
      id: "NER-2026-102",
      title: "Procurement of 500MW Solar Panel Modules",
      department: "SREDA",
      method: "ICT",
      published: "2026-02-10",
      deadline: "2026-05-20",
      status: "Open",
      value: "BDT 320 Crore",
      category: "Renewable Energy",
      description: "Supply of Tier-1 Monocrystalline Solar Panels for the Mongla Solar Park Project.",
      location: "Mongla",
      security: "BDT 8.0 Crore"
    },
    {
      id: "NER-2026-115",
      title: "Import of 200,000 Tons of Thermal Coal",
      department: "Coal Power Generation Company (CPGCBL)",
      method: "OTM",
      published: "2026-02-12",
      deadline: "2026-03-05",
      status: "Open",
      value: "BDT 550 Crore",
      category: "Coal",
      description: "High-grade thermal coal required for Matarbari Ultra Super Critical Coal-Fired Power Project.",
      location: "Matarbari Power Plant",
      security: "BDT 12.0 Crore"
    },
    {
      id: "NER-2026-120",
      title: "Digital Meter Installation for Dhaka North",
      department: "DESCO",
      method: "NCT",
      published: "2026-02-15",
      deadline: "2026-06-01",
      status: "Open",
      value: "BDT 120 Crore",
      category: "Electricity",
      description: "Supply and installation of 50,000 Smart Pre-paid Meters for residential customers.",
      location: "Dhaka North",
      security: "BDT 2.5 Crore"
    }
  ];

  // --- FILTER ENGINE ---
  const filteredTenders = tenders.filter(t => {
    // 1. Core Filters
    const matchSearch = t.title.toLowerCase().includes(inputSearch.toLowerCase()) || 
                        t.id.toLowerCase().includes(inputSearch.toLowerCase());
    const matchType = inputType === 'All' || t.category === inputType;
    const matchStatus = inputStatus === 'All' || t.status === inputStatus;
    
    // 2. My Bids Logic
    const matchMyBids = showMyBidsOnly ? myBids.includes(t.id) : true;

    return matchSearch && matchType && matchStatus && matchMyBids;
  });

  // --- ACTIONS ---
  const handleReset = () => {
    setInputType('All');
    setInputStatus('All');
    setInputSearch('');
    setShowMyBidsOnly(false);
  };

  const handleDownload = (id: string) => {
    alert(`Downloading Official Tender Schedule: ${id}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  // --- BID SUBMISSION LOGIC ---
  const handleSubmitBid = (id: string) => {
    if (myBids.includes(id)) {
      alert("You have already submitted a bid for this tender.");
      return;
    }

    setIsSubmitting(true);
    // Simulate API Call
    setTimeout(() => {
      setMyBids(prev => [...prev, id]);
      setIsSubmitting(false);
      setSelectedTender(null);
      alert(`Bid Successfully Submitted!\n\nTender ID: ${id}\nReference No: BID-${Math.floor(Math.random() * 90000) + 10000}`);
    }, 1500);
  };

  // --- HELPERS ---
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return 'bg-green-100 text-green-700 border-green-200';
      case 'Closing Soon': return 'bg-red-100 text-red-700 border-red-200 animate-pulse';
      case 'Evaluation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Awarded': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMethodBadge = (method: string) => {
    switch(method) {
      case 'ICT': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'NCT': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans print:bg-white">
      <Navbar />

      {/* 1. OFFICIAL HEADER */}
      <div className="bg-slate-900 text-white pt-10 pb-20 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-secondary" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Central Procurement Unit</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">e-Tendering Portal</h1>
              <p className="text-slate-400 mt-2 max-w-2xl text-sm">
                The official electronic government procurement (e-GP) system for energy sector tenders, notices, and awards.
              </p>
            </div>
            <div className="flex gap-3">
               <button onClick={handlePrint} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm font-medium flex items-center transition-colors">
                  <Printer className="h-4 w-4 mr-2" /> Print List
               </button>
               <button 
                onClick={() => setShowMyBidsOnly(!showMyBidsOnly)}
                className={`px-4 py-2 rounded text-sm font-bold shadow-lg flex items-center transition-colors ${
                  showMyBidsOnly 
                    ? 'bg-secondary text-primary-dark ring-2 ring-white' 
                    : 'bg-primary hover:bg-primary-dark text-white'
                }`}
               >
                  <Briefcase className="h-4 w-4 mr-2" /> 
                  {showMyBidsOnly ? "Show All Tenders" : `My Bids (${myBids.length})`}
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROL PANEL (Filters) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 mb-8 print:hidden">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-1">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
            
            {/* Search */}
            <div className="flex-1 p-3">
               <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Keyword / ID</label>
               <div className="relative">
                  <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search tenders..." 
                    className="w-full pl-8 pr-3 py-1.5 text-sm outline-none font-medium text-gray-700 placeholder-gray-300"
                    value={inputSearch}
                    onChange={(e) => setInputSearch(e.target.value)}
                  />
               </div>
            </div>

            {/* Category */}
            <div className="flex-1 p-3">
               <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Sector</label>
               <select 
                 className="w-full py-1.5 text-sm outline-none font-bold text-gray-700 bg-transparent cursor-pointer"
                 value={inputType}
                 onChange={(e) => setInputType(e.target.value)}
               >
                 <option value="All">All Sectors</option>
                 <option value="Oil & Gas">Oil & Gas</option>
                 <option value="Electricity">Electricity</option>
                 <option value="Coal">Coal</option>
                 <option value="Infrastructure">Infrastructure</option>
               </select>
            </div>

            {/* Status */}
            <div className="flex-1 p-3">
               <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Status</label>
               <select 
                 className="w-full py-1.5 text-sm outline-none font-bold text-gray-700 bg-transparent cursor-pointer"
                 value={inputStatus}
                 onChange={(e) => setInputStatus(e.target.value)}
               >
                 <option value="All">Any Status</option>
                 <option value="Open">Live Tenders</option>
                 <option value="Closing Soon">Closing Soon</option>
                 <option value="Evaluation">Under Evaluation</option>
               </select>
            </div>

            {/* View Toggle & Reset */}
            <div className="p-3 flex items-end gap-2">
               <button 
                 onClick={() => setViewMode('List')}
                 className={`p-2 rounded ${viewMode === 'List' ? 'bg-slate-100 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                 title="List View"
               >
                  <List className="h-5 w-5" />
               </button>
               <button 
                 onClick={() => setViewMode('Grid')}
                 className={`p-2 rounded ${viewMode === 'Grid' ? 'bg-slate-100 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                 title="Table View"
               >
                  <Grid className="h-5 w-5" />
               </button>
               <button 
                 onClick={handleReset}
                 className="p-2 text-red-500 hover:bg-red-50 rounded"
                 title="Reset Filters"
               >
                  <RefreshCw className="h-5 w-5" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TENDER LIST/GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex justify-between items-center mb-6">
           <h2 className="font-bold text-gray-700 flex items-center gap-2">
             {showMyBidsOnly ? (
                <>
                  <Briefcase className="h-5 w-5 text-secondary" /> 
                  My Active Bids ({filteredTenders.length})
                </>
             ) : (
                `Showing ${filteredTenders.length} Active Notice(s)`
             )}
           </h2>
           {!showMyBidsOnly && (
             <span className="text-xs font-bold text-secondary bg-primary-dark px-3 py-1 rounded">
               Fiscal Year 2025-26
             </span>
           )}
        </div>

        {/* --- VIEW MODE: CARD LIST --- */}
        {viewMode === 'List' && (
          <div className="space-y-4">
            {filteredTenders.map((tender) => (
              <div key={tender.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow group relative overflow-hidden">
                {myBids.includes(tender.id) && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">
                    BID SUBMITTED
                  </div>
                )}
                <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 group-hover:bg-secondary transition-colors"></div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Block */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                         {tender.id}
                       </span>
                       <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getStatusColor(tender.status)}`}>
                         {tender.status}
                       </span>
                       <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getMethodBadge(tender.method)}`}>
                         {tender.method}
                       </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                      {tender.title}
                    </h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                       <span className="flex items-center"><Activity className="h-4 w-4 mr-1.5 text-gray-400"/> {tender.department}</span>
                       <span className="flex items-center"><Calendar className="h-4 w-4 mr-1.5 text-gray-400"/> Deadline: <span className="text-red-600 font-medium ml-1">{tender.deadline}</span></span>
                       <span className="flex items-center"><DollarSign className="h-4 w-4 mr-1.5 text-gray-400"/> Value: <span className="text-gray-900 font-bold ml-1">{tender.value}</span></span>
                    </div>
                  </div>

                  {/* Right Block (Actions) */}
                  <div className="flex flex-col justify-center items-end gap-2 min-w-[140px]">
                     <button 
                       onClick={() => setSelectedTender(tender)}
                       className="w-full py-2 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold rounded text-sm transition-colors"
                     >
                       View Details
                     </button>
                     <button 
                       onClick={() => handleDownload(tender.id)}
                       className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium rounded flex items-center justify-center border border-gray-200"
                     >
                       <Download className="h-3 w-3 mr-2" /> Schedule
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- VIEW MODE: OFFICIAL TABLE --- */}
        {viewMode === 'Grid' && (
           <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs">
                       <tr>
                          <th className="px-6 py-4">Tender ID</th>
                          <th className="px-6 py-4">Title & Ministry</th>
                          <th className="px-6 py-4">Method</th>
                          <th className="px-6 py-4">Closing Date</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {filteredTenders.map((t) => (
                          <tr key={t.id} className="hover:bg-blue-50/50">
                             <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                                {t.id}
                                {myBids.includes(t.id) && <span className="block text-[9px] text-green-600 font-bold">APPLIED</span>}
                             </td>
                             <td className="px-6 py-4 max-w-md">
                                <div className="font-bold text-gray-800 truncate">{t.title}</div>
                                <div className="text-xs text-gray-500">{t.department}</div>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getMethodBadge(t.method)}`}>{t.method}</span>
                             </td>
                             <td className="px-6 py-4 font-mono text-red-600 font-medium">{t.deadline}</td>
                             <td className="px-6 py-4">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusColor(t.status)}`}>{t.status}</span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <button onClick={() => setSelectedTender(t)} className="text-primary hover:underline font-bold text-xs">View</button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {filteredTenders.length === 0 && (
           <div className="p-16 text-center bg-white rounded border border-dashed border-gray-300 text-gray-500">
              <Filter className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              {showMyBidsOnly ? (
                 <p>You haven't submitted any bids yet.</p>
              ) : (
                 <p>No tenders found matching your criteria.</p>
              )}
              <button onClick={handleReset} className="text-primary hover:underline text-sm font-bold mt-2">
                 {showMyBidsOnly ? "Browse All Tenders" : "Clear Filters"}
              </button>
           </div>
        )}
      </div>

      {/* 4. DETAIL MODAL (Official Document Style) */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-primary-dark text-white px-6 py-4 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <FileText className="h-4 w-4 text-secondary" />
                     <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300">Procurement Notice</span>
                  </div>
                  <h2 className="text-lg font-bold">{selectedTender.id}</h2>
               </div>
               <button onClick={() => setSelectedTender(null)} className="text-white/60 hover:text-white">
                  <X className="h-6 w-6" />
               </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-8 overflow-y-auto">
               <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 max-w-lg">{selectedTender.title}</h3>
                  <div className="text-right">
                     <p className="text-xs text-gray-500 uppercase">Closing Date</p>
                     <p className="text-xl font-bold text-red-600">{selectedTender.deadline}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Procuring Entity</p>
                     <p className="font-medium text-gray-800">{selectedTender.department}</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Procurement Method</p>
                     <p className="font-medium text-gray-800">{selectedTender.method} (e-GP)</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Official Estimate</p>
                     <p className="font-medium text-gray-800">{selectedTender.value}</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Tender Security</p>
                     <p className="font-medium text-gray-800">{selectedTender.security}</p>
                  </div>
               </div>

               <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-8">
                  <h4 className="font-bold text-gray-900 mb-2 text-sm flex items-center">
                     <Clock className="h-4 w-4 mr-2 text-gray-500" /> Scope of Work
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                     {selectedTender.description}
                  </p>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end gap-3">
               <button 
                 onClick={() => handleDownload(selectedTender.id)} 
                 className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded hover:bg-gray-100 transition-colors flex items-center"
               >
                 <Download className="h-4 w-4 mr-2" /> Download Schedule
               </button>
               
               {myBids.includes(selectedTender.id) ? (
                  <button 
                    disabled
                    className="px-5 py-2.5 bg-green-100 text-green-700 font-bold text-sm rounded border border-green-200 flex items-center cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Bid Submitted
                  </button>
               ) : (
                  <button 
                    onClick={() => handleSubmitBid(selectedTender.id)} 
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-secondary hover:bg-yellow-500 text-primary-dark font-bold text-sm rounded shadow flex items-center transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                       <>Processing...</>
                    ) : (
                       <>Purchase & Submit Bid <CheckCircle className="h-4 w-4 ml-2" /></>
                    )}
                  </button>
               )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Tenders;