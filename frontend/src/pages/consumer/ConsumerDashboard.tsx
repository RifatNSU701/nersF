import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, MessageSquare, Bell, FileText, Gauge, ArrowRight, Plus, Send, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE=import.meta.env.VITE_API_URL||'http://localhost:5000/api/v1';
interface Complaint { id:string; subject:string; description:string; status:string; admin_reply?:string; created_at:string; }

const ConsumerDashboard=()=>{
  const user=JSON.parse(localStorage.getItem('nersf_user')||'{}');
  const token=localStorage.getItem('nersf_token')||'';
  const [complaints,setComplaints]=useState<Complaint[]>([]);
  const [subject,setSubject]=useState('');
  const [description,setDescription]=useState('');
  const [showForm,setShowForm]=useState(false);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState('');

  const load=async()=>{setLoading(true);try{const r=await fetch(API_BASE+'/crm/complaints',{headers:{Authorization:'Bearer '+token}});const d=await r.json();if(!r.ok)throw new Error(d.message);setComplaints(Array.isArray(d)?d:[]);}catch(e:any){setMessage(e.message||'Unable to load service cases.');}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);

  const submit=async(e:React.FormEvent)=>{e.preventDefault();setMessage('');try{const r=await fetch(API_BASE+'/crm/complaints',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({subject,description})});const d=await r.json();if(!r.ok)throw new Error(d.message);setSubject('');setDescription('');setShowForm(false);setMessage('Complaint submitted successfully.');load();}catch(e:any){setMessage(e.message||'Unable to submit complaint.');}};

  const statusClass=(s:string)=>s==='RESOLVED'||s==='CLOSED'?'text-green-700 bg-green-50':s==='IN_PROGRESS'?'text-blue-700 bg-blue-50':'text-amber-700 bg-amber-50';

  return <div className="min-h-screen bg-slate-50 p-6 md:p-10"><div className="max-w-7xl mx-auto">
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"><div><p className="text-sm font-semibold text-blue-700">NERSF CONSUMER PORTAL</p><h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name||'Consumer'}</h1><p className="text-slate-500 mt-2">Manage your national energy and resource service cases.</p></div><div className="flex gap-3"><button onClick={load} className="px-4 py-2 bg-white border rounded-lg font-bold flex gap-2"><RefreshCw className="h-4 w-4"/>Refresh</button><Link to="/" className="text-sm font-bold text-blue-700 self-center">Public Portal</Link></div></header>

    {message&&<div className="mb-6 border rounded-xl p-4 bg-blue-50 text-blue-800 flex justify-between"><span className="flex gap-2"><AlertCircle className="h-5 w-5"/>{message}</span><button onClick={()=>setMessage('')}>×</button></div>}

    <section className="grid md:grid-cols-3 gap-5 mb-8">
      <div className="bg-white border rounded-2xl p-6 shadow-sm"><Zap className="h-8 w-8 text-blue-700 mb-4"/><h2 className="font-bold">Energy Services</h2><p className="text-sm text-slate-500 mt-2">Verified electricity, gas and energy service information.</p></div>
      <button onClick={()=>setShowForm(true)} className="bg-white border rounded-2xl p-6 shadow-sm text-left hover:shadow-md"><FileText className="h-8 w-8 text-blue-700 mb-4"/><h2 className="font-bold">Complaints & Requests</h2><p className="text-sm text-slate-500 mt-2">Submit and track your service cases.</p><span className="mt-5 text-sm font-bold text-blue-700 flex items-center gap-1">Create Case <ArrowRight className="h-4 w-4"/></span></button>
      <div className="bg-white border rounded-2xl p-6 shadow-sm"><MessageSquare className="h-8 w-8 text-blue-700 mb-4"/><h2 className="font-bold">Help Desk</h2><p className="text-sm text-slate-500 mt-2">24/7 support ticket and live chat integration foundation.</p></div>
    </section>

    <section className="grid lg:grid-cols-3 gap-6"><div className="lg:col-span-2 bg-white border rounded-2xl p-6"><div className="flex justify-between items-center mb-5"><div><h2 className="font-bold text-xl">My Service Cases</h2><p className="text-sm text-slate-500">Track complaints and official responses.</p></div><button onClick={()=>setShowForm(true)} className="px-4 py-2 bg-blue-700 text-white rounded-lg font-bold flex gap-2"><Plus className="h-4 w-4"/>New Case</button></div>
    {loading?<p className="text-slate-500">Loading cases...</p>:<div className="space-y-4">{complaints.map(c=><div key={c.id} className="border rounded-xl p-5"><div className="flex justify-between gap-4"><div><h3 className="font-bold">{c.subject}</h3><p className="text-sm text-slate-500 mt-1">{c.description}</p></div><span className={'h-fit px-3 py-1 rounded-full text-xs font-bold '+statusClass(c.status)}>{c.status.replace('_',' ')}</span></div>{c.admin_reply&&<div className="mt-4 bg-slate-50 border-l-4 border-blue-600 p-3 text-sm"><b>Official Response:</b> {c.admin_reply}</div>}<p className="text-xs text-slate-400 mt-3">{new Date(c.created_at).toLocaleString()}</p></div>)}{!complaints.length&&<div className="text-center py-12 text-slate-500">No service cases submitted yet.</div>}</div>}</div>
    <div className="space-y-5"><div className="bg-slate-900 text-white rounded-2xl p-6"><Gauge className="h-7 w-7 text-blue-300 mb-4"/><h2 className="font-bold text-xl">Service Overview</h2><p className="text-slate-300 mt-2">Verified provider integrations will appear here.</p></div><div className="bg-white border rounded-2xl p-6"><Bell className="h-7 w-7 text-amber-500 mb-4"/><h2 className="font-bold text-xl">Notifications</h2><p className="text-slate-500 mt-2">Complaint updates will be reflected in your case history.</p></div></div></section>

    {showForm&&<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-7 w-full max-w-lg"><div className="flex justify-between mb-5"><div><h2 className="text-xl font-bold">Submit Service Case</h2><p className="text-sm text-slate-500">Provide accurate information for faster processing.</p></div><button onClick={()=>setShowForm(false)}>×</button></div><form onSubmit={submit} className="space-y-4"><div><label className="block text-sm font-bold mb-1">Subject</label><input value={subject} onChange={e=>setSubject(e.target.value)} required maxLength={200} className="w-full border rounded-lg p-3"/></div><div><label className="block text-sm font-bold mb-1">Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} required rows={5} className="w-full border rounded-lg p-3"/></div><button className="w-full bg-blue-700 text-white rounded-lg py-3 font-bold flex justify-center gap-2"><Send className="h-5 w-5"/>Submit Case</button></form></div></div>}
  </div></div>;
};
export default ConsumerDashboard;