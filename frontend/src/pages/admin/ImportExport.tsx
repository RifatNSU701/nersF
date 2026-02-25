import React from 'react';
import { TrendingUp, AlertCircle, Ship, Zap } from 'lucide-react';

const ImportExport = () => {
  return (
    <div className="space-y-6">
      
      {/* 1. TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Electricity Metric */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-lg"><Zap className="h-6 w-6 text-blue-600" /></div>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">+12% YoY</span>
          </div>
          <p className="text-gray-500 text-xs uppercase font-bold">Total Electricity Import</p>
          <h3 className="text-3xl font-bold text-gray-900">1,160 MW</h3>
          <p className="text-xs text-gray-400 mt-2">Source: Adani Power & Tripura Grid</p>
        </div>

        {/* LNG Metric */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 rounded-lg"><Ship className="h-6 w-6 text-orange-600" /></div>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">-5% Vol</span>
          </div>
          <p className="text-gray-500 text-xs uppercase font-bold">LNG Import (Spot + Term)</p>
          <h3 className="text-3xl font-bold text-gray-900">550 MMCFD</h3>
          <p className="text-xs text-gray-400 mt-2">Terminals: Moheshkhali & Summit</p>
        </div>

        {/* Cost Metric */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-lg"><TrendingUp className="h-6 w-6 text-purple-600" /></div>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">Monthly</span>
          </div>
          <p className="text-gray-500 text-xs uppercase font-bold">Total Import Cost</p>
          <h3 className="text-3xl font-bold text-gray-900">$480.5M</h3>
          <p className="text-xs text-gray-400 mt-2">Fiscal Year 2025-26 (Feb)</p>
        </div>
      </div>

      {/* 2. REAL-TIME TRADE TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">Cross-Border Transmission & Cargo</h3>
          <button className="text-xs font-bold text-primary hover:underline">Download Manifest</button>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Source / Origin</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Volume / Load</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Settlement Price</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { source: "Adani Godda (Unit 1)", type: "Electricity", load: "750 MW", status: "Active", price: "BDT 14.02 / Unit", color: "green" },
              { source: "Tripura Grid Link", type: "Electricity", load: "160 MW", status: "Active", price: "BDT 8.50 / Unit", color: "green" },
              { source: "QatarEnergy (Ras Laffan)", type: "LNG Cargo", load: "138,000 m³", status: "Discharging", price: "$11.5 / MMBtu", color: "blue" },
              { source: "Oman Trading (Spot)", type: "LNG Cargo", load: "Pending", status: "Scheduled", price: "$13.2 / MMBtu", color: "orange" },
              { source: "Berhampur-Bheramara", type: "Electricity", load: "1000 MW", status: "Maintenance", price: "N/A", color: "red" },
            ].map((item, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-800">{item.source}</td>
                <td className="px-6 py-4 text-gray-600">{item.type}</td>
                <td className="px-6 py-4 font-mono font-medium">{item.load}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border bg-${item.color}-50 text-${item.color}-700 border-${item.color}-200`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-gray-600">{item.price}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-xs font-bold text-blue-600 hover:underline">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. ALERTS SECTION */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-red-800">LC Payment Warning</h4>
          <p className="text-sm text-red-700 mt-1">
            Letter of Credit (LC-4921) for "Summit LNG Terminal" is due for settlement on 28th Feb. 
            Current Forex Reserve allocation is pending approval from Bangladesh Bank.
          </p>
          <button className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold px-4 py-2 rounded transition-colors">
            View Financial Clearance
          </button>
        </div>
      </div>

    </div>
  );
};

export default ImportExport;