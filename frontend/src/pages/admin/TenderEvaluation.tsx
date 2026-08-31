import React, { useEffect, useState } from 'react';
import { RefreshCw, Gavel, CheckCircle2, XCircle, Trophy, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
interface Tender { id:string; title:string; reference_no:string; closing_date:string; status:string; }
interface Bid { id:string; tender_id:string; vendor_name:string; email:string; price_per_mt:number; delivery_days:number; status:string; }

const TenderEvaluation = () => {
  const token=localStorage.getItem('nersf_token')||'';
  const [tenders,setTenders]=useState<Tender[]>([]);
  const [selected,setSelected]=useState('');
  const [bids,setBids]=useState<Bid[]>([]);
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);

  const headers={Authorization:'Bearer '+token,'Content-Type':'application/json'};
  const loadTenders=async()=>{setLoading(true);try{const r=await fetch(API_BASE+'/tenders');const d=await r.json();if(!r.ok)throw new Error(d.message);setTenders(d);}catch(e:any){setMessage(e.message||'Unable to load tenders.');}finally{setLoading(false);}};
  const loadBids=async(id:string)=>{setSelected(id);setLoading(true);try{const r=await fetch(API_BASE+'/bids/'+id,{headers:{Authorization:'Bearer '+token}});const d=await r.json();if(!r.ok)throw new Error(d.message);setBids(d);}catch(e:any){setMessage(e.message||'Unable to load bids.');}finally{setLoading(false);}};
  useEffect(()=>{loadTenders();},[]);

  const evaluate=async(id:string,decision:string)=>{try{const r=await fetch(API_BASE+'/bids/'+id+'/evaluate',{method:'PATCH',headers,body:JSON.stringify({decision})});const d=await r.json();if(!r.ok)throw new Error(d.message);setMessage(d.message);if(selected)loadBids(selected);}catch(e:any){setMessage(e.message||'Evaluation failed.');}};
  const award=async(bid:Bid)=>{if(!window.confirm('Award this tender to the selected vendor? This will reject competing pending bids.'))return;try{const r=await fetch(API_BASE+'/bids/'+bid.tender_id+'/award/'+bid.id,{method:'POST',headers});const d=await r.json();if(!r.ok)throw new Error(d.message);setMessage(d.message);loadTenders();loadBids(bid.tender_id);}catch(e:any){setMessage(e.message||'Award operation failed.');}};

  return <div className="max-w-7xl mx-auto"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold text-slate-900">Tender Evaluation</h1><p className="text-sm text-slate-500">Review vendor proposals and manage procurement decisions.</p></div><button onClick={loadTenders} className="px-4 py-2 border rounded-lg font-bold flex gap-2"><RefreshCw className="h-4 w-4"/>Refresh</button></div>
  {message&&<div className="mb-5 p-4 rounded-xl border bg-blue-50 text-blue-800 flex justify-between">{message}<button onClick={()=>setMessage('')}>×</button></div>}
  <div className="grid lg:grid-cols-3 gap-6"><div className="bg-white border rounded-xl p-5"><h2 className="font-bold mb-4">Tenders</h2><div className="space-y-3">{tenders.map(t=><button key={t.id} onClick={()=>loadBids(t.id)} className={'w-full text-left border rounded-lg p-4 '+(selected===t.id?'border-blue-600 bg-blue-50':'hover:bg-slate-50')}><p className="font-bold text-sm">{t.reference_no}</p><p className="text-xs text-slate-500 mt-1">{t.title}</p><span className="text-xs font-bold">{t.status}</span></button>)}{!tenders.length&&!loading&&<p className="text-sm text-slate-500">No tenders available.</p>}</div></div>
  <div className="lg:col-span-2 bg-white border rounded-xl p-5"><h2 className="font-bold mb-4">Vendor Bids</h2>{loading?<p className="text-slate-500">Loading...</p>:!selected?<div className="text-slate-500 py-12 text-center">Select a tender to review submitted bids.</div>:<div className="space-y-4">{bids.map(b=><div key={b.id} className="border rounded-xl p-5"><div className="flex flex-col md:flex-row justify-between gap-4"><div><h3 className="font-bold">{b.vendor_name}</h3><p className="text-sm text-slate-500">{b.email}</p><div className="flex gap-5 mt-3 text-sm"><span>Price: <b>{b.price_per_mt}</b></span><span>Delivery: <b>{b.delivery_days} days</b></span></div><p className="mt-2 text-xs font-bold">Status: {b.status}</p></div><div className="flex gap-2 flex-wrap">{b.status==='PENDING'&&<><button onClick={()=>evaluate(b.id,'SHORTLISTED')} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex gap-1"><CheckCircle2 className="h-4 w-4"/>Shortlist</button><button onClick={()=>evaluate(b.id,'REJECTED')} className="px-3 py-2 border text-red-600 rounded-lg text-sm font-bold flex gap-1"><XCircle className="h-4 w-4"/>Reject</button></>}{b.status==='SHORTLISTED'&&<button onClick={()=>award(b)} className="px-3 py-2 bg-emerald-700 text-white rounded-lg text-sm font-bold flex gap-1"><Trophy className="h-4 w-4"/>Award Tender</button>}</div></div></div>)}{!bids.length&&<p className="text-slate-500 py-10 text-center">No bids submitted for this tender.</p>}</div>}</div></div></div>;
};
export default TenderEvaluation;