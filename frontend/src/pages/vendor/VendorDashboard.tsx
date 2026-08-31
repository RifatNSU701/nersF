import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileText, Gavel, Clock, RefreshCw, Send, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
interface Tender { id:string; title:string; reference_no:string; description?:string; closing_date:string; status:string; }
interface Bid { id:string; title:string; reference_no:string; price_per_mt:number; delivery_days:number; status:string; closing_date:string; }

const VendorDashboard = () => {
  const user = JSON.parse(localStorage.getItem('nersf_user') || '{}');
  const token = localStorage.getItem('nersf_token') || '';
  const [tenders,setTenders]=useState<Tender[]>([]);
  const [bids,setBids]=useState<Bid[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [selected,setSelected]=useState<Tender|null>(null);
  const [price,setPrice]=useState('');
  const [days,setDays]=useState('');
  const [message,setMessage]=useState('');

  const authHeaders={Authorization:'Bearer '+token,'Content-Type':'application/json'};
  const load=async()=>{
    setLoading(true); setError('');
    try{
      const [t,b]=await Promise.all([fetch(API_BASE+'/tenders'),fetch(API_BASE+'/bids/my',{headers:{Authorization:'Bearer '+token}})]);
      const td=await t.json(); const bd=await b.json();
      if(!t.ok) throw new Error(td.message||'Unable to load tenders.');
      if(!b.ok) throw new Error(bd.message||'Unable to load bid history.');
      setTenders(Array.isArray(td)?td:[]); setBids(Array.isArray(bd)?bd:[]);
    }catch(e:any){setError(e.message||'Unable to load vendor services.');}
    finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);

  const submitBid=async(e:React.FormEvent)=>{
    e.preventDefault(); if(!selected)return;
    setMessage('');
    try{
      const response=await fetch(API_BASE+'/bids',{method:'POST',headers:authHeaders,body:JSON.stringify({tender_id:selected.id,price_per_mt:Number(price),delivery_days:Number(days)})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.message||'Bid submission failed.');
      setMessage('Bid submitted successfully.'); setSelected(null); setPrice(''); setDays(''); load();
    }catch(e:any){setMessage(e.message||'Bid submission failed.');}
  };

  const alreadyBid=(id:string)=>bids.some(b=>(b as any).tender_id===id);
  return <div className="min-h-screen bg-slate-50 p-6 md:p-10">
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div><p className="text-sm font-semibold text-emerald-700">NERSF VENDOR & BIDDER PORTAL</p><h1 className="text-3xl font-bold text-slate-900">{user.name||'Organization'} Dashboard</h1><p className="text-slate-500 mt-2">Secure access to national procurement opportunities.</p></div>
        <div className="flex gap-3"><button onClick={load} className="px-4 py-2 bg-white border rounded-lg font-bold flex gap-2"><RefreshCw className="h-4 w-4"/>Refresh</button><Link to="/" className="px-4 py-2 text-sm font-bold text-blue-700">Public Portal</Link></div>
      </header>
      {message&&<div className={'mb-5 rounded-xl p-4 flex gap-2 '+(message.includes('successfully')?'bg-green-50 text-green-700 border border-green-200':'bg-red-50 text-red-700 border border-red-200')}><CheckCircle2 className="h-5 w-5"/>{message}</div>}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3"><Clock className="text-amber-600"/><div><p className="font-bold text-amber-900">Verification-controlled procurement</p><p className="text-sm text-amber-800">Only approved vendor accounts can submit and track bids.</p></div></div>
      {error&&<div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex gap-2"><AlertCircle/> {error}</div>}
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border rounded-2xl p-6"><div className="flex justify-between mb-5"><h2 className="text-xl font-bold">Available Tenders</h2><span className="text-sm text-slate-500">{tenders.length} active</span></div>
        {loading?<p className="text-slate-500">Loading tenders...</p>:<div className="space-y-4">{tenders.map(t=><div key={t.id} className="border rounded-xl p-5"><div className="flex justify-between gap-4"><div><p className="text-xs font-mono text-slate-500">{t.reference_no}</p><h3 className="font-bold text-lg">{t.title}</h3><p className="text-sm text-slate-500 mt-1">{t.description||'Official procurement opportunity.'}</p><p className="text-xs mt-3">Closing: <b className="text-red-600">{new Date(t.closing_date).toLocaleDateString()}</b></p></div><button disabled={alreadyBid(t.id)} onClick={()=>setSelected(t)} className="h-fit px-4 py-2 bg-emerald-700 text-white rounded-lg font-bold disabled:bg-slate-300">{alreadyBid(t.id)?'Bid Submitted':'Submit Bid'}</button></div></div>)}{!tenders.length&&<p className="text-slate-500">No active tenders available.</p>}</div>}</div>
        <div className="bg-white border rounded-2xl p-6"><Gavel className="h-7 w-7 text-emerald-700 mb-3"/><h2 className="text-xl font-bold">My Bids</h2><p className="text-sm text-slate-500 mb-5">Submitted procurement proposals.</p><div className="space-y-3">{bids.slice(0,5).map(b=><div key={b.id} className="border rounded-lg p-3"><p className="font-bold text-sm">{b.reference_no}</p><p className="text-xs text-slate-500">{b.status} • {b.delivery_days} days</p></div>)}{!loading&&!bids.length&&<p className="text-sm text-slate-500">No bids submitted yet.</p>}</div></div>
      </section>
    </div>
    {selected&&<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-lg p-7"><div className="flex justify-between"><div><p className="text-xs font-mono text-slate-500">{selected.reference_no}</p><h2 className="text-xl font-bold">{selected.title}</h2></div><button onClick={()=>setSelected(null)}><X/></button></div><form onSubmit={submitBid} className="mt-6 space-y-4"><div><label className="block text-sm font-bold mb-1">Bid Price per MT</label><input type="number" min="0.01" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required className="w-full border rounded-lg p-3"/></div><div><label className="block text-sm font-bold mb-1">Delivery Days</label><input type="number" min="1" value={days} onChange={e=>setDays(e.target.value)} required className="w-full border rounded-lg p-3"/></div><button className="w-full bg-emerald-700 text-white py-3 rounded-lg font-bold flex justify-center gap-2"><Send className="h-5 w-5"/>Submit Secure Bid</button></form></div></div>}
  </div>;
};
export default VendorDashboard;