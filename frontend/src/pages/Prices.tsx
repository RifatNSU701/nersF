import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { 
  TrendingUp, TrendingDown, Zap, Droplet, Flame, 
  Download, FileText, Factory, Leaf, Printer
} from 'lucide-react';

// --- TYPES ---
interface PriceItem {
  id: string;
  name: string;
  unit: string;
  price: string;
  prevPrice: string;
  trend: 'up' | 'down' | 'stable';
  category: 'Fuel' | 'Electricity' | 'Renewable' | 'Industrial';
  status: 'Regulated' | 'Market Adj.' | 'Subsidized' | 'Lifeline' | 'Commercial' | 'Incentivized' | 'Unregulated';
  lastUpdated: string;
}

const Prices = () => {
  const [activeTab, setActiveTab] = useState('All');

  // --- MOCK DATA: GLOBAL INDICES ---
  const globalMarket = [
    { name: "Brent Crude", price: "$82.50", change: "+1.2%", trend: "up" },
    { name: "LNG (Spot/JKM)", price: "$12.40", change: "-0.5%", trend: "down" },
    { name: "Newcastle Coal", price: "$130.00", change: "+0.1%", trend: "up" },
    { name: "Carbon Credits", price: "€65.20", change: "-0.8%", trend: "down" },
  ];

  // --- MOCK DATA: NATIONAL RATES ---
  const nationalRates: PriceItem[] = [
    // FUELS
    { id: "F-01", name: "High Speed Diesel (HSD)", unit: "Ltr", price: "109.00", prevPrice: "109.00", trend: 'stable', category: 'Fuel', status: 'Regulated', lastUpdated: 'Mar 01, 2026' },
    { id: "F-02", name: "Octane (HOBC)", unit: "Ltr", price: "130.00", prevPrice: "130.00", trend: 'stable', category: 'Fuel', status: 'Regulated', lastUpdated: 'Mar 01, 2026' },
    { id: "F-03", name: "LPG (12kg Cyl)", unit: "Cyl", price: "1,482.00", prevPrice: "1,442.00", trend: 'up', category: 'Fuel', status: 'Market Adj.', lastUpdated: 'Mar 03, 2026' },
    { id: "F-04", name: "Furnace Oil (HFO)", unit: "Ltr", price: "85.00", prevPrice: "88.00", trend: 'down', category: 'Fuel', status: 'Subsidized', lastUpdated: 'Feb 15, 2026' },
    { id: "F-05", name: "CNG (Feed Gas)", unit: "m³", price: "43.00", prevPrice: "43.00", trend: 'stable', category: 'Fuel', status: 'Regulated', lastUpdated: 'Jan 01, 2026' },
    
    // ELECTRICITY
    { id: "E-01", name: "Res. Electricity (Tier 1)", unit: "kWh", price: "4.63", prevPrice: "4.35", trend: 'up', category: 'Electricity', status: 'Lifeline', lastUpdated: 'Jan 01, 2026' },
    { id: "E-02", name: "Res. Electricity (Tier 3)", unit: "kWh", price: "8.95", prevPrice: "8.95", trend: 'stable', category: 'Electricity', status: 'Regulated', lastUpdated: 'Jan 01, 2026' },
    { id: "E-03", name: "Industrial (Med Voltage)", unit: "kWh", price: "9.72", prevPrice: "9.40", trend: 'up', category: 'Electricity', status: 'Commercial', lastUpdated: 'Jan 01, 2026' },

    // RENEWABLES & COAL
    { id: "R-01", name: "Imp. Thermal Coal", unit: "Ton", price: "18,500", prevPrice: "19,200", trend: 'down', category: 'Renewable', status: 'Market Adj.', lastUpdated: 'Mar 05, 2026' },
    { id: "R-02", name: "Solar Net Metering", unit: "kWh", price: "5.50", prevPrice: "5.00", trend: 'up', category: 'Renewable', status: 'Incentivized', lastUpdated: 'Jan 01, 2026' },
    { id: "R-03", name: "Biomass Pellets", unit: "kg", price: "22.00", prevPrice: "22.00", trend: 'stable', category: 'Renewable', status: 'Unregulated', lastUpdated: 'Feb 20, 2026' },
  ];

  // --- FILTER LOGIC ---
  const filteredRates = activeTab === 'All' 
    ? nationalRates 
    : nationalRates.filter(item => {
        if(activeTab === 'Fuels') return item.category === 'Fuel';
        if(activeTab === 'Power') return item.category === 'Electricity';
        if(activeTab === 'Energy Mix') return item.category === 'Renewable';
        return true;
      });

  const handleDownload = (docName: string) => {
    alert(`Downloading: ${docName}_v2026.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  // --- HELPER: CATEGORY ICON ---
  const getIcon = (cat: string) => {
    switch(cat) {
      case 'Fuel': return <Droplet className="h-5 w-5 text-blue-600" />;
      case 'Electricity': return <Zap className="h-5 w-5 text-yellow-600" />;
      case 'Renewable': return <Leaf className="h-5 w-5 text-green-600" />;
      default: return <Flame className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans print:bg-white">
      <Navbar />

      {/* 1. Live Market Ticker */}
      <div className="bg-slate-900 text-white py-2 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs md:text-sm gap-2">
          <span className="font-bold text-secondary uppercase tracking-wider flex items-center">
             <TrendingUp className="h-3 w-3 mr-2" /> Global Markets (Live)
          </span>
          <div className="flex space-x-6 overflow-x-auto w-full md:w-auto scrollbar-hide">
            {globalMarket.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 whitespace-nowrap">
                <span className="text-slate-400">{item.name}:</span>
                <span className="font-mono font-bold text-white">{item.price}</span>
                <span className={`flex items-center ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Official Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-widest rounded border border-blue-200">BERC Official Data</span>
                 <span className="text-gray-400 text-xs">|</span>
                 <span className="text-gray-500 text-xs">Updated: Today, 09:30 AM</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-800">National Energy Tariff</h1>
              <p className="text-gray-500 text-sm mt-1 max-w-2xl">
                The centralized database for government-regulated energy prices, subsidies, and market adjustments for the fiscal year 2025-26.
              </p>
            </div>
            <div className="flex gap-3 print:hidden">
               <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded transition-colors">
                  <Printer className="h-4 w-4 mr-2" /> Print
               </button>
               <button onClick={() => handleDownload("Full_Report")} className="flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded shadow-sm transition-colors">
                  <Download className="h-4 w-4 mr-2" /> Download Report
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TABS */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto print:hidden">
          {['All', 'Fuels', 'Power', 'Energy Mix'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'All' ? 'All Rates' : tab}
            </button>
          ))}
        </div>

        {/* RATES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredRates.map((item) => (
            <div key={item.id} className="bg-white rounded border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                item.category === 'Fuel' ? 'bg-blue-500' : 
                item.category === 'Electricity' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>

              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${
                    item.category === 'Fuel' ? 'bg-blue-50 text-blue-600' : 
                    item.category === 'Electricity' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {getIcon(item.category)}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                   item.status === 'Regulated' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                   item.status === 'Subsidized' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                   'bg-orange-50 text-orange-700 border-orange-100'
                }`}>
                  {item.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 h-10 flex items-center">
                {item.name}
              </h3>

              <div className="flex items-end justify-between border-t border-gray-50 pt-3">
                <div>
                   <p className="text-xs text-gray-400 mb-0.5">Current Rate</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-900">৳ {item.price}</span>
                      <span className="text-xs font-medium text-gray-500">/ {item.unit}</span>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-xs text-gray-400 mb-0.5">Prev. Month</p>
                   <div className={`text-xs font-bold flex items-center justify-end ${
                      item.trend === 'up' ? 'text-red-500' : 
                      item.trend === 'down' ? 'text-green-500' : 'text-gray-400'
                   }`}>
                      {item.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1"/> : 
                       item.trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1"/> : null}
                      {item.prevPrice}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 4. DOWNLOAD CENTER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Industrial Table */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <Factory className="h-5 w-5 text-gray-500" />
                <h3 className="font-bold text-gray-800 text-sm uppercase">Industrial Voltage Tariffs</h3>
             </div>
             <table className="min-w-full text-sm">
                <thead className="bg-white">
                   <tr className="border-b border-gray-100">
                      <th className="px-6 py-3 text-left font-bold text-gray-500">Category</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-500">Voltage</th>
                      <th className="px-6 py-3 text-right font-bold text-gray-500">Rate (BDT)</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   <tr className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-800">Small Industry</td>
                      <td className="px-6 py-3 text-gray-500">LT (400V)</td>
                      <td className="px-6 py-3 text-right font-mono font-bold">9.88</td>
                   </tr>
                   <tr className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-800">Heavy Industry</td>
                      <td className="px-6 py-3 text-gray-500">HT (33kV)</td>
                      <td className="px-6 py-3 text-right font-mono font-bold">9.61</td>
                   </tr>
                   <tr className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-800">Super Heavy</td>
                      <td className="px-6 py-3 text-gray-500">EHT (132kV)</td>
                      <td className="px-6 py-3 text-right font-mono font-bold">9.52</td>
                   </tr>
                </tbody>
             </table>
          </div>

          {/* Quick Downloads */}
          <div className="bg-slate-800 rounded-lg p-6 text-white">
             <h3 className="font-bold text-lg mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-secondary" /> 
                Official Documents
             </h3>
             <ul className="space-y-3">
                <li>
                   <button onClick={() => handleDownload("BERC_Tariff_Schedule_2026")} className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded transition-colors text-sm">
                      <span>BERC Tariff Schedule 2026</span>
                      <Download className="h-4 w-4 text-gray-300" />
                   </button>
                </li>
                <li>
                   <button onClick={() => handleDownload("Renewable_Energy_Policy")} className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded transition-colors text-sm">
                      <span>Renewable Energy Policy</span>
                      <Download className="h-4 w-4 text-gray-300" />
                   </button>
                </li>
                <li>
                   <button onClick={() => handleDownload("Monthly_Market_Analysis")} className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded transition-colors text-sm">
                      <span>Monthly Market Analysis</span>
                      <Download className="h-4 w-4 text-gray-300" />
                   </button>
                </li>
             </ul>
             <div className="mt-6 text-xs text-gray-400 border-t border-gray-700 pt-4">
                * All documents are digitally signed by the Ministry of Power, Energy & Mineral Resources.
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Prices;