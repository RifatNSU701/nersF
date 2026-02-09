import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Search, Filter, Download, Calendar, FileText, ChevronRight, X, Copy, CheckCircle, RefreshCw, DollarSign, Activity } from 'lucide-react';

// 1. Define Types
interface Tender {
  id: string;
  title: string;
  department: string;
  deadline: string;
  status: 'Open' | 'Closing Soon' | 'Evaluation' | 'Closed';
  value: string;     // Display String: "BDT 450 Crore"
  valueNum: number;  // Number for Logic: 450
  category: string;
  description: string;
  location: string;
}

const Tenders = () => {
  // --- STATE: USER INPUTS ---
  const [inputType, setInputType] = useState('All');
  const [inputStatus, setInputStatus] = useState('All');
  // Removed inputMaxBudget state
  const [inputDate, setInputDate] = useState('');
  const [inputSearch, setInputSearch] = useState('');

  // --- STATE: APPLIED FILTERS ---
  const [filters, setFilters] = useState({
    type: 'All',
    status: 'All',
    minDate: '',
    search: ''
  });

  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

  // 2. Data (Kept valueNum for future use/sorting)
  const tenders: Tender[] = [
    {
      id: "NER-2026-001",
      title: "Supply of 50,000 MT High-Speed Diesel (HSD)",
      department: "Bangladesh Petroleum Corp (BPC)",
      deadline: "2026-03-15",
      status: "Open",
      value: "BDT 450 Crore",
      valueNum: 450,
      category: "Oil & Gas",
      description: "International tender for the supply of High-Speed Diesel to Chittagong Port. Supplier must provide quality assurance certification ISO-9001.",
      location: "Chittagong Port"
    },
    {
      id: "NER-2026-042",
      title: "Construction of LNG Floating Terminal at Matarbari",
      department: "Petrobangla",
      deadline: "2026-04-10",
      status: "Closing Soon",
      value: "BDT 1,200 Crore",
      valueNum: 1200,
      category: "Infrastructure",
      description: "EPC Contract for floating storage and regasification unit (FSRU). Requires deep-sea engineering experience.",
      location: "Matarbari, Cox's Bazar"
    },
    {
      id: "NER-2026-089",
      title: "Maintenance of National Grid Transmission Lines (Zone 4)",
      department: "Power Grid Company (PGCB)",
      deadline: "2026-02-28",
      status: "Evaluation",
      value: "BDT 85 Crore",
      valueNum: 85,
      category: "Maintenance",
      description: "Routine maintenance and emergency repair services for 400kV transmission lines in the Comilla zone.",
      location: "Comilla Zone"
    },
    {
      id: "NER-2026-102",
      title: "Procurement of 500MW Solar Panel Modules",
      department: "SREDA",
      deadline: "2026-05-20",
      status: "Open",
      value: "BDT 320 Crore",
      valueNum: 320,
      category: "Renewable Energy",
      description: "Supply of Tier-1 Monocrystalline Solar Panels for the Mongla Solar Park Project.",
      location: "Mongla"
    },
    {
      id: "NER-2026-115",
      title: "Import of 200,000 Tons of Thermal Coal",
      department: "Coal Power Generation Company (CPGCBL)",
      deadline: "2026-03-05",
      status: "Open",
      value: "BDT 550 Crore",
      valueNum: 550,
      category: "Coal",
      description: "High-grade thermal coal required for Matarbari Ultra Super Critical Coal-Fired Power Project.",
      location: "Matarbari Power Plant"
    },
    {
      id: "NER-2026-120",
      title: "Digital Meter Installation for Dhaka North",
      department: "DESCO",
      deadline: "2026-06-01",
      status: "Open",
      value: "BDT 120 Crore",
      valueNum: 120,
      category: "Electricity",
      description: "Supply and installation of 50,000 Smart Pre-paid Meters for residential customers.",
      location: "Dhaka North"
    }
  ];

  // 3. APPLY FILTER LOGIC
  const handleApplyFilters = () => {
    setFilters({
      type: inputType,
      status: inputStatus,
      minDate: inputDate,
      search: inputSearch
    });
  };

  // 4. RESET LOGIC
  const handleReset = () => {
    setInputType('All');
    setInputStatus('All');
    setInputDate('');
    setInputSearch('');
    
    setFilters({
      type: 'All',
      status: 'All',
      minDate: '',
      search: ''
    });
  };

  // 5. THE FILTER ENGINE
  const filteredTenders = tenders.filter(t => {
    // A. Search Text
    const matchSearch = t.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                        t.id.toLowerCase().includes(filters.search.toLowerCase());
    
    // B. Category/Type
    const matchType = filters.type === 'All' || t.category === filters.type;

    // C. Status
    const matchStatus = filters.status === 'All' || t.status === filters.status;

    // D. Date (Deadline >= Selected Date)
    const matchDate = filters.minDate === '' || new Date(t.deadline) >= new Date(filters.minDate);

    // Removed MatchBudget logic

    return matchSearch && matchType && matchStatus && matchDate;
  });

  const handleDownload = (id: string) => {
    alert(`Downloading: ${id}.pdf`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ID: ${text}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* Header Section */}
      <div className="bg-primary-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">e-Tendering Portal</h1>
          <p className="text-blue-200 text-sm">
            Official Procurement Gateway: Filter by Deadline, Status, and Type.
          </p>
        </div>
      </div>

      {/* --- ADVANCED FILTER BAR --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-secondary">
          
          {/* Changed layout to 5 equal columns for perfect alignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            
            {/* 1. Search */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="ID or Keyword..." 
                  value={inputSearch}
                  onChange={(e) => setInputSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>

            {/* 2. Type/Category */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Energy Type</label>
              <select 
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary outline-none bg-white"
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Oil & Gas">Oil & Gas</option>
                <option value="Coal">Coal</option>
                <option value="Electricity">Electricity</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* 3. Status */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Tender Status</label>
              <select 
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary outline-none bg-white"
                value={inputStatus}
                onChange={(e) => setInputStatus(e.target.value)}
              >
                <option value="All">Any Status</option>
                <option value="Open">Open</option>
                <option value="Closing Soon">Closing Soon</option>
                <option value="Evaluation">Evaluation</option>
              </select>
            </div>

            {/* 4. Deadline (Now takes full column width) */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Deadline After</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                <input 
                  type="date" 
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary outline-none text-gray-600"
                />
              </div>
            </div>

            {/* 5. Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={handleApplyFilters}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 rounded text-sm font-bold flex items-center justify-center transition-colors shadow-sm"
              >
                <Filter className="h-4 w-4 mr-1" /> Filter
              </button>
              <button 
                onClick={handleReset}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded text-sm border border-gray-300 transition-colors"
                title="Reset"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Tenders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-700 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" /> Search Results ({filteredTenders.length})
            </h3>
            <span className="text-xs text-gray-500">Last updated: Today, 14:00 PM</span>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredTenders.map((tender) => (
              <div key={tender.id} className="p-6 hover:bg-blue-50 transition-colors group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button 
                        onClick={() => copyToClipboard(tender.id)}
                        className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-mono rounded border border-gray-200 transition-colors"
                      >
                        {tender.id} <Copy className="h-3 w-3 ml-1 opacity-50" />
                      </button>

                      <span className={`px-2 py-1 text-xs font-bold rounded-full border ${
                        tender.status === 'Open' ? 'bg-green-100 text-green-700 border-green-200' :
                        tender.status === 'Closing Soon' ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' :
                        'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {tender.status}
                      </span>
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                        {tender.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-1">
                      {tender.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                      <span className="flex items-center">
                        <Activity className="h-4 w-4 mr-1 text-gray-400" />
                        {tender.department}
                      </span>
                      <span className="flex items-center text-red-600 font-medium">
                        <Calendar className="h-4 w-4 mr-1" />
                        Deadline: {tender.deadline}
                      </span>
                      <span className="flex items-center text-green-700 font-bold bg-green-50 px-2 rounded">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {tender.value}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button 
                      onClick={() => handleDownload(tender.id)}
                      className="flex-1 md:flex-none border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center text-sm font-medium"
                    >
                      <Download className="h-4 w-4 mr-2" /> PDF
                    </button>
                    <button 
                      onClick={() => setSelectedTender(tender)}
                      className="flex-1 md:flex-none bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded shadow-sm hover:shadow-md transition-all flex items-center justify-center text-sm font-bold"
                    >
                      View Details <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {filteredTenders.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <Filter className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No tenders found matching these filters.</p>
                <button 
                  onClick={handleReset}
                  className="text-primary hover:underline mt-2 text-sm font-medium"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-primary text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Tender Details</h2>
                <p className="text-xs text-blue-200 uppercase tracking-widest">{selectedTender.id}</p>
              </div>
              <button 
                onClick={() => setSelectedTender(null)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">{selectedTender.title}</h3>
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500 uppercase mb-1">Department</p>
                  <p className="font-bold">{selectedTender.department}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500 uppercase mb-1">Value</p>
                  <p className="font-bold text-green-700">{selectedTender.value}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500 uppercase mb-1">Location</p>
                  <p className="font-bold">{selectedTender.location}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500 uppercase mb-1">Deadline</p>
                  <p className="font-bold text-red-600">{selectedTender.deadline}</p>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-bold mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedTender.description}</p>
              </div>
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button onClick={() => handleDownload(selectedTender.id)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded text-sm flex items-center justify-center">
                  <Download className="h-4 w-4 mr-2" /> Docs
                </button>
                <button className="flex-1 bg-secondary text-primary-dark font-bold py-3 rounded text-sm flex items-center justify-center" onClick={() => alert("Go to Bid")}>
                  Submit Bid <CheckCircle className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenders;