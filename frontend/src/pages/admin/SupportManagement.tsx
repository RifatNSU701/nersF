import React, { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, MessageSquare, Send, Filter, User, Clock, CheckCircle2 } from 'lucide-react';

const API_BASE=import.meta.env.VITE_API_URL||'http://localhost:5000/api/v1';
interface Complaint { id:string; subject:string; description:string; status:string; admin_reply?:string; created_at:string; full_name:string; email:string; }

const SupportManagement=()=>{
 const token=localStorage.getItem('nersf_token')||'';
 const [items,setItems]=useState<Complaint[]>([]);
 const [selected,setSelected]=useState<Complaint|null>(null);
 const [status,setStatus]=useState('PENDING');
 const [reply,setReply]=useState('');
 const [filter,setFilter]=useState('ALL');
 const [search,setSearch]=useState('');
 const [message,setMessage]=useState('');
 const [loading,setLoading]=useState(true);

 const load=async()=>{setLoading(true);try{const r=await fetch(API_BASE+'/crm/complaints/all',{headers:{Authorization:'Bearer '+token}});const d=await r.json();if(!r.ok)throw new Error(d.message||'Unable to load complaints.');setItems(Array.isArray(d)?d:[]);}catch(e:any){setMessage(e.message||'Unable to load support cases.');}finally{setLoading(false);}};
 useEffect(()=>{load();},[]);
 const filtered=useMemo(()=>items.filter(c=>(filter==='ALL'||c.status===filter)&&((c.subject+' '+c.full_name+' '+c.email).toLowerCase().includes(search.toLowerCase()))),[items,filter,search]);
 const open=(c:Complaint)=>{setSelected(c);setStatus(c.status);setReply(c.admin_reply||'');};
 const save=async()=>{if(!selected)return;try{const r=await fetch(API_BASE+'/crm/complaints/'+selected.id,{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({status,admin_reply:reply})});const d=await r.json();if(!r.ok)throw new Error(d.message||'Unable to update case.');setMessage('Service case updated successfully.');setSelected(null);load();}catch(e:any){setMessage(e.message||'Update failed.');}};

 const badge=(s:string)=>s==='RESOLVED'||s==='CLOSED'?'bg-green-100 text-green-700':s==='IN_PROGRESS'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700';
 return <div className="max-w-7xl mx-auto"><div className="flex flex-col md:flex-row justify-between gap-4 mb-7"><div><h1 className="text-2xl font-bold text-slate-900">Consumer Support Management</h1><p className="text-sm text-slate-500">Review, respond to and manage national energy service cases.</p></div><button onClick={load} className="px-4 py-2 border bg-white rounded-lg font-bold flex gap-2"><RefreshCw className="h-4 w-4"/>Refresh</button></div>
 {message&&<div className="mb-5 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl">{message}</div>}
 <div className="grid md:grid-cols-4 gap-4 mb-6">{['ALL','PENDING','IN_PROGRESS','RESOLVED'].map(s=><button key={s} onClick={()=>setFilter(s)} className={'p-4 rounded-xl border bg-white text-left '+(filter===s?'border-blue-600 ring-1 ring-blue-600':'')}><p className="text-xs text-slate-500">{s.replace('_',' ')}</p><p className="text-2xl font-bold">{s==='ALL'?items.length:items.filter(i=>i.status===s).length}</p></button>)}</div>
 <div className="bg-white border rounded-2xl overflow-hidden"><div className="p-5 border-b flex flex-col md:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search consumer, email or subject..." className="w-full border rounded-lg pl-9 p-2.5"/></div><div className="flex gap-2"><Filter className="mt-2.5 text-slate-400 h-4 w-4"/><span className="text-sm self-center text-slate-500">{filtered.length} cases</span></div></div>
 {loading?<div className="p-12 text-center text-slate-500">Loading support cases...</div>:<div className="divide-y">{filtered.map(c=><button key={c.id} onClick={()=>open(c)} className="w-full text-left p-5 hover:bg-slate-50"><div className="flex justify-between gap-4"><div><div className="flex gap-2 items-center"><User className="h-4 w-4 text-slate-400"/><span className="font-bold text-sm">{c.full_name}</span><span className="text-xs text-slate-400">{c.email}</span></div><h3 className="font-bold mt-2">{c.subject}</h3><p className="text-sm text-slate-500 mt-1 line-clamp-1">{c.description}</p><p className="text-xs text-slate-400 mt-2 flex gap-1"><Clock className="h-3 w-3"/>{new Date(c.created_at).toLocaleString()}</p></div><span className={'h-fit px-3 py-1 rounded-full text-xs font-bold '+badge(c.status)}>{c.status.replace('_',' ')}</span></div></button>)}{!filtered.length&&<div className="p-12 text-center text-slate-500">No support cases found.</div>}</div>}</div>
 {selected&&<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"><div className="bg-white w-full max-w-2xl rounded-2xl p-7 max-h-[90vh] overflow-auto"><div className="flex justify-between gap-4"><div><p className="text-xs text-slate-500">{selected.full_name} • {selected.email}</p><h2 className="text-xl font-bold mt-1">{selected.subject}</h2></div><button onClick={()=>setSelected(null)}>×</button></div><div className="mt-5 bg-slate-50 border rounded-xl p-4 text-slate-700">{selected.description}</div><div className="grid md:grid-cols-2 gap-4 mt-5"><div><label className="block text-sm font-bold mb-1">Case Status</label><select value={status} onChange={e=>setStatus(e.target.value)} className="w-full border rounded-lg p-3">{['PENDING','IN_PROGRESS','RESOLVED','CLOSED'].map(s=><option key={s}>{s}</option>)}</select></div><div className="text-sm text-slate-500 self-end">Keep case updates accurate for audit and service transparency.</div></div><div className="mt-5"><label className="block text-sm font-bold mb-1">Official Response</label><textarea value={reply} onChange={e=>setReply(e.target.value)} rows={6} placeholder="Write the official response to the consumer..." className="w-full border rounded-lg p-3"/></div><div className="mt-6 flex justify-end gap-3"><button onClick={()=>setSelected(null)} className="px-4 py-2 border rounded-lg font-bold">Cancel</button><button onClick={save} className="px-5 py-2 bg-blue-700 text-white rounded-lg font-bold flex gap-2"><Send className="h-4 w-4"/>Save Update</button></div></div></div>}
 </div>;
};
export default SupportManagement;