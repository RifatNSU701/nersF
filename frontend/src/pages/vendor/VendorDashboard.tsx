import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileText, Gavel, Upload, Clock } from 'lucide-react';

const VendorDashboard = () => {
  const user = JSON.parse(localStorage.getItem('nersf_user') || '{}');
  return <div className="min-h-screen bg-slate-50 p-6 md:p-10">
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div><p className="text-sm font-semibold text-emerald-700">NERSF VENDOR & BIDDER PORTAL</p><h1 className="text-3xl font-bold text-slate-900">{user.name || 'Organization'} Dashboard</h1><p className="text-slate-500 mt-2">Manage verification, tenders, bids and organization documents.</p></div>
        <Link to="/" className="text-sm font-bold text-blue-700">Back to Public Portal</Link>
      </header>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3"><Clock className="text-amber-600"/><div><p className="font-bold text-amber-900">Verification workflow</p><p className="text-sm text-amber-800">Vendor access is activated after authorized government verification.</p></div></div>
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[['Organization Profile',Building2],['Documents',Upload],['Available Tenders',FileText],['My Bids',Gavel]].map(([title,Icon]:any)=><div key={title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><Icon className="h-7 w-7 text-emerald-700 mb-4"/><h2 className="font-bold text-slate-900">{title}</h2><p className="text-sm text-slate-500 mt-2">Module foundation ready for API integration.</p></div>)}
      </section>
    </div>
  </div>;
};
export default VendorDashboard;