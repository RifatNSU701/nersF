import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, MessageSquare, Bell, FileText, Gauge, ArrowRight } from 'lucide-react';

const ConsumerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('nersf_user') || '{}');
  const cards = [
    { title: 'Electricity Services', text: 'View service information and submit requests.', icon: Zap },
    { title: 'Complaints & Requests', text: 'Track your submitted service cases.', icon: FileText },
    { title: 'Help Desk', text: 'Get assistance and create support tickets.', icon: MessageSquare },
  ];
  return <div className="min-h-screen bg-slate-50 p-6 md:p-10">
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div><p className="text-sm font-semibold text-blue-700">NERSF CONSUMER PORTAL</p><h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name || 'Consumer'}</h1><p className="text-slate-500 mt-2">Your national energy and resource service dashboard.</p></div>
        <Link to="/" className="text-sm font-bold text-blue-700">Back to Public Portal</Link>
      </header>
      <section className="grid md:grid-cols-3 gap-5 mb-8">{cards.map(({title,text,icon:Icon})=><div key={title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><Icon className="h-8 w-8 text-blue-700 mb-4"/><h2 className="font-bold text-slate-900">{title}</h2><p className="text-sm text-slate-500 mt-2">{text}</p><button className="mt-5 text-sm font-bold text-blue-700 flex items-center gap-1">Open <ArrowRight className="h-4 w-4"/></button></div>)}</section>
      <section className="grid md:grid-cols-2 gap-5">
        <div className="bg-slate-900 text-white rounded-2xl p-6"><Gauge className="h-7 w-7 text-blue-300 mb-4"/><h2 className="font-bold text-xl">Service Overview</h2><p className="text-slate-300 mt-2">Energy consumption and account integrations will appear here when connected to verified service-provider data.</p></div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6"><Bell className="h-7 w-7 text-amber-500 mb-4"/><h2 className="font-bold text-xl text-slate-900">Notifications</h2><p className="text-slate-500 mt-2">No new verified notifications.</p></div>
      </section>
    </div>
  </div>;
};
export default ConsumerDashboard;