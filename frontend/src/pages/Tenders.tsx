import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { Search, Filter, Calendar, FileText, X, RefreshCw, Clock, Shield, Printer, Briefcase, AlertCircle } from 'lucide-react';

interface Tender {
  id: string; title: string; reference_no: string; description?: string;
  opening_date?: string; closing_date: string; status: string;
  budget_min?: number; budget_max?: number; attachment_url?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Tenders = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

  const loadTenders = async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(API_BASE + '/tenders');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load tenders.');
      setTenders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the tender service.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadTenders(); }, []);

  const filtered = useMemo(() => tenders.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.reference_no.toLowerCase().includes(search.toLowerCase())
  ), [tenders, search]);

  const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString() : '—';

  return <div className="min-h-screen bg-gray-50 font-sans">
    <Navbar />
    <div className="bg-slate-900 text-white pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-5">
          <div><div className="flex gap-2 items-center mb-2"><Shield className="h-5 w-5 text-secondary"/><span className="text-xs uppercase tracking-widest text-slate-300 font-bold">Central Procurement Unit</span></div>
          <h1 className="text-4xl font-bold">e-Tendering Portal</h1><p className="text-slate-400 mt-2 max-w-2xl">Official procurement notices for the Bangladesh national energy and resource framework.</p></div>
          <button onClick={() => window.print()} className="self-start px-4 py-2 border border-slate-600 rounded text-sm font-bold flex gap-2"><Printer className="h-4 w-4"/>Print</button>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
      <div className="bg-white shadow-xl border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative"><Search className="absolute left-3 top-3 text-gray-400 h-5 w-5"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by tender title or reference number..." className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none"/></div>
        <button onClick={loadTenders} className="px-5 py-3 bg-slate-100 font-bold rounded-lg flex justify-center gap-2"><RefreshCw className="h-5 w-5"/>Refresh</button>
      </div>

      <div className="flex justify-between items-center mt-8 mb-5"><h2 className="font-bold text-gray-700">Active Tenders ({filtered.length})</h2></div>

      {loading && <div className="bg-white p-12 text-center rounded-xl border">Loading official tenders...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl flex gap-3"><AlertCircle/> <div>{error}<button onClick={loadTenders} className="block font-bold underline mt-1">Try again</button></div></div>}

      {!loading && !error && <div className="space-y-4">
        {filtered.map(t => <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex flex-col md:flex-row gap-5 justify-between">
            <div className="flex-1"><div className="flex flex-wrap gap-2 mb-3"><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{t.reference_no}</span><span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">{t.status}</span></div>
            <h3 className="text-xl font-bold text-gray-900">{t.title}</h3><p className="text-gray-500 text-sm mt-2 line-clamp-2">{t.description || 'Official tender notice. Open the details for complete information.'}</p>
            <div className="flex gap-5 mt-4 text-sm text-gray-500"><span className="flex gap-1 items-center"><Calendar className="h-4 w-4"/>Closes: <b className="text-red-600">{formatDate(t.closing_date)}</b></span></div></div>
            <button onClick={()=>setSelectedTender(t)} className="self-center px-5 py-3 border-2 border-primary text-primary font-bold rounded-lg">View Details</button>
          </div>
        </div>)}
        {!filtered.length && <div className="bg-white p-14 text-center rounded-xl border"><Filter className="h-10 w-10 mx-auto text-gray-300 mb-3"/><p className="text-gray-500">No active tenders found.</p></div>}
      </div>}
    </div>

    {selectedTender && <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="bg-slate-900 text-white p-6 flex justify-between"><div><div className="flex gap-2 text-slate-300 text-xs uppercase"><FileText className="h-4 w-4"/>Official Procurement Notice</div><h2 className="text-xl font-bold mt-2">{selectedTender.reference_no}</h2></div><button onClick={()=>setSelectedTender(null)}><X/></button></div>
        <div className="p-7"><h3 className="text-2xl font-bold">{selectedTender.title}</h3><div className="grid md:grid-cols-2 gap-5 my-6 text-sm"><div><b>Opening:</b><br/>{formatDate(selectedTender.opening_date)}</div><div><b>Closing:</b><br/><span className="text-red-600 font-bold">{formatDate(selectedTender.closing_date)}</span></div></div>
        <p className="text-gray-600 leading-relaxed">{selectedTender.description || 'No additional description provided.'}</p>
        {selectedTender.attachment_url && <a href={selectedTender.attachment_url} target="_blank" rel="noreferrer" className="inline-flex mt-6 gap-2 font-bold text-primary"><Briefcase className="h-4 w-4"/>Open Tender Document</a>}
        <div className="mt-7 pt-5 border-t flex justify-between"><span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-4 w-4"/>Status: {selectedTender.status}</span><button onClick={()=>setSelectedTender(null)} className="px-5 py-2 bg-gray-100 rounded font-bold">Close</button></div></div>
      </div>
    </div>}
  </div>;
};
export default Tenders;