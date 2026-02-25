import React, { useState } from 'react';
import { 
  Database, AlertTriangle, TrendingDown, Droplet, Package, 
  Ship, Truck, RefreshCw, Calendar, Download, 
  ArrowRight, Thermometer, Activity, Anchor
} from 'lucide-react';

// 1. Define the exact types for the tabs
type TabType = 'Overview' | 'Depot Status' | 'Logistics';

const Stocks = () => {
  // 2. State Management
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [isExporting, setIsExporting] = useState(false);

  // 3. Define tabs constant
  const TABS: TabType[] = ['Overview', 'Depot Status', 'Logistics'];

  // 4. Functional Handlers
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Report Generation Complete.\nDownloading: NERSF_National_Stock_Report_FEB2026.pdf");
    }, 1500);
  };

  const handleDrillDown = (depotName: string) => {
    alert(`Opening SCADA Interface for: ${depotName}\nConnecting to secure gateway...`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* COMMAND BAR */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded border border-green-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wide">SCADA Live Feed</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 border-l pl-4 border-gray-300">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>Fiscal Period: </span>
            <span className="font-mono text-gray-900 font-bold">FEB 2026</span>
          </div>
        </div>

        <div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors disabled:opacity-70 disabled:cursor-wait"
          >
            {isExporting ? (
              <>Generating...</>
            ) : (
              <><Download className="h-4 w-4 mr-2" /> Export Report</>
            )}
          </button>
        </div>
      </div>

      {/* STRATEGIC RESERVE KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "High Speed Diesel (HSD)", days: 42, burn: "14.2k", stock: "450,000 MT", status: "Optimal", color: "blue" },
          { label: "Furnace Oil (HFO)", days: 28, burn: "5.1k", stock: "142,000 MT", status: "Moderate", color: "yellow" },
          { label: "Jet A-1 Fuel", days: 65, burn: "1.2k", stock: "85,000 MT", status: "Surplus", color: "green" },
          { label: "Motor Spirit (Octane)", days: 14, burn: "3.5k", stock: "32,000 MT", status: "Critical", color: "red" },
        ].map((item, idx) => (
          <div key={idx} className={`relative overflow-hidden bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group`}>
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10 bg-${item.color}-500 group-hover:scale-150 transition-transform duration-700`}></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</p>
                {item.status === 'Critical' && <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />}
              </div>
              
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-slate-800">{item.days}</h3>
                <span className="text-sm text-gray-500 font-medium">Days Cover</span>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Current Stock</p>
                  <p className="text-sm font-bold text-gray-700 font-mono">{item.stock}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase flex items-center justify-end">
                    Burn Rate <TrendingDown className="h-3 w-3 ml-1" />
                  </p>
                  <p className="text-sm font-bold text-red-600 font-mono">-{item.burn}</p>
                </div>
              </div>

              <div className="w-full bg-gray-100 h-1.5 mt-3 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full bg-${item.color}-500`} 
                  style={{ width: `${Math.min((item.days / 60) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TAB NAVIGATION */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors
                ${activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB CONTENT: DEPOT VISUALIZER */}
      {activeTab === 'Depot Status' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center">
                <Database className="h-5 w-5 mr-2 text-primary" /> Active Storage Terminals
              </h3>
              <button 
                onClick={() => alert("Navigating to Full Depot Inventory List...")}
                className="text-xs font-bold text-primary flex items-center hover:underline"
              >
                View All Depots <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            </div>
            
            <div className="space-y-6">
              {[
                { name: "Eastern Refinery Ltd (ERL)", loc: "Chittagong", cap: 1200000, curr: 980000, temp: "28°C", pressure: "14 PSI", status: "Receiving" },
                { name: "Godenail Main Depot", loc: "Narayanganj", cap: 450000, curr: 125000, temp: "31°C", pressure: "12 PSI", status: "Critical Low" },
                { name: "Baghabari River Terminal", loc: "Sirajganj", cap: 250000, curr: 210000, temp: "29°C", pressure: "13 PSI", status: "Stable" },
              ].map((depot, idx) => {
                const fillPercent = Math.round((depot.curr / depot.cap) * 100);
                return (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded border border-gray-200">
                          <Droplet className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{depot.name}</h4>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span> {depot.loc}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                        depot.status === 'Critical Low' ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' :
                        depot.status === 'Receiving' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-green-50 text-green-600 border-green-200'
                      }`}>
                        {depot.status}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-1">
                         <div className="flex justify-between text-xs mb-1 font-mono">
                           <span>{fillPercent}% Filled</span>
                           <span className="text-gray-400">{depot.curr.toLocaleString()} / {depot.cap.toLocaleString()} MT</span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${fillPercent < 30 ? 'bg-red-500' : 'bg-primary'}`} 
                              style={{ width: `${fillPercent}%` }}
                            ></div>
                         </div>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                      <span className="flex items-center"><Thermometer className="h-3 w-3 mr-1" /> {depot.temp}</span>
                      <span className="flex items-center"><Activity className="h-3 w-3 mr-1" /> {depot.pressure}</span>
                      <button 
                        onClick={() => handleDrillDown(depot.name)}
                        className="ml-auto font-bold text-blue-600 cursor-pointer hover:underline"
                      >
                        View Tank Array &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center text-sm uppercase tracking-wide">
              <Package className="h-4 w-4 mr-2 text-purple-500" /> Critical Spares
            </h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center p-3 bg-purple-50 rounded border border-purple-100">
                  <div>
                     <p className="text-xs font-bold text-gray-700">Pipeline Valves (DN-500)</p>
                     <p className="text-[10px] text-gray-500">Stock: 12 Units</p>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-white px-2 py-1 rounded">OK</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-100">
                  <div>
                     <p className="text-xs font-bold text-gray-700">Turbine Seals (GE-9F)</p>
                     <p className="text-[10px] text-red-500">Stock: 0 Units</p>
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-white px-2 py-1 rounded">ORDER</span>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LOGISTICS */}
      {(activeTab === 'Logistics' || activeTab === 'Overview') && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-slate-900 text-white rounded-xl shadow-lg overflow-hidden border border-slate-700">
             <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
               <h3 className="font-bold flex items-center">
                 <Anchor className="h-5 w-5 mr-2 text-secondary" /> Inbound Marine Traffic
               </h3>
               <span className="text-xs font-mono text-green-400 flex items-center">
                 Satellite Active <Ship className="h-4 w-4 ml-2" />
               </span>
             </div>
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-gray-400 uppercase bg-slate-800">
                 <tr>
                   <th className="px-6 py-3">Vessel</th>
                   <th className="px-6 py-3">Cargo</th>
                   <th className="px-6 py-3">Vol (MT)</th>
                   <th className="px-6 py-3">Origin</th>
                   <th className="px-6 py-3">ETA</th>
                   <th className="px-6 py-3">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                 {[
                   { name: "MT Torm Helvig", type: "Crude Oil", vol: "145k", origin: "Saudi Arabia", eta: "14 Feb", status: "Anchored" },
                   { name: "MT Jag Leela", type: "Diesel", vol: "65k", origin: "Singapore", eta: "16 Feb", status: "En Route" },
                   { name: "LNG Al Thakhira", type: "LNG", vol: "138k", origin: "Qatar", eta: "18 Feb", status: "En Route" },
                 ].map((ship, idx) => (
                   <tr key={idx} className="hover:bg-slate-800/50">
                     <td className="px-6 py-4 font-bold text-secondary">{ship.name}</td>
                     <td className="px-6 py-4">{ship.type}</td>
                     <td className="px-6 py-4 font-mono">{ship.vol}</td>
                     <td className="px-6 py-4 text-gray-400">{ship.origin}</td>
                     <td className="px-6 py-4 text-white font-medium">{ship.eta}</td>
                     <td className="px-6 py-4 text-blue-400 text-xs font-bold uppercase">{ship.status}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-primary" /> Inland Distribution Fleet
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Tanker Lorries Active</p>
                     <h4 className="text-2xl font-bold text-blue-700">1,240</h4>
                  </div>
                  <Truck className="h-8 w-8 text-blue-200" />
               </div>
               <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Rail Wagons Loaded</p>
                     <h4 className="text-2xl font-bold text-green-700">68</h4>
                  </div>
                  <div className="h-8 w-8 rounded bg-green-200 flex items-center justify-center text-green-700 font-bold text-xs">RL</div>
               </div>
               <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 flex items-center justify-between">
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Fleet Maintenance</p>
                     <h4 className="text-2xl font-bold text-orange-700">12%</h4>
                  </div>
                  <RefreshCw className="h-8 w-8 text-orange-200" />
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Stocks;