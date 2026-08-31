import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertTriangle, ArrowLeft, UserCheck, Briefcase } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'official' | 'public'>('public');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      const governmentRoles = ['ADMIN', 'OFFICER', 'AUDITOR', 'SUPER_ADMIN', 'TENDER_OFFICER', 'SUPPORT_AGENT'];
      const isGovernmentUser = governmentRoles.includes(data.user.role);

      if (loginType === 'official' && !isGovernmentUser) {
        throw new Error('This account is not authorized for the Government Portal.');
      }

      localStorage.setItem('nersf_token', data.token);
      localStorage.setItem('nersf_user', JSON.stringify(data.user));

      if (isGovernmentUser) navigate('/admin');
      else if (data.user.role === 'CITIZEN') navigate('/consumer');
      else if (data.user.role === 'VENDOR') navigate('/vendor');
      else navigate('/');
    } catch (err: any) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <div className="hidden lg:flex w-5/12 bg-slate-900 flex-col justify-between px-12 py-12 relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-10 w-10 text-secondary" />
            <div><h1 className="text-2xl font-bold">NERSF</h1><p className="text-[10px] uppercase tracking-widest text-gray-400">Bangladesh Energy Framework</p></div>
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">Secure Access <br/><span className="text-secondary">Gateway</span></h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">A secure digital gateway for national energy, resources and public services.</p>
          <div className="space-y-6">
            <div className="flex items-start gap-4"><div className="p-2 bg-blue-500/20 rounded-lg"><UserCheck className="h-6 w-6 text-blue-400" /></div><div><h3 className="font-bold">Verified Identity</h3><p className="text-gray-400 text-sm">Role-based access for authorized users.</p></div></div>
            <div className="flex items-start gap-4"><div className="p-2 bg-blue-500/20 rounded-lg"><Briefcase className="h-6 w-6 text-blue-400" /></div><div><h3 className="font-bold">Government Services</h3><p className="text-gray-400 text-sm">Protected access to official NERSF services.</p></div></div>
          </div>
        </div>
        <div className="relative z-10 flex gap-2 text-xs text-gray-500"><AlertTriangle className="h-4 w-4" /> Authorized use only. Activity may be logged.</div>
      </div>

      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-8 bg-white relative">
        <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center text-sm font-bold text-gray-400 hover:text-primary"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</button>
        <div className="w-full max-w-md">
          <div className="text-center mb-10"><h2 className="text-3xl font-bold text-gray-900 mb-2">Portal Login</h2><p className="text-gray-500">Select your access level to continue</p></div>
          <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
            <button type="button" onClick={() => setLoginType('public')} className={`flex-1 py-2 text-sm font-bold rounded-md ${loginType === 'public' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>Citizen / Vendor</button>
            <button type="button" onClick={() => setLoginType('official')} className={`flex-1 py-2 text-sm font-bold rounded-md ${loginType === 'official' ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-500'}`}>Official Staff</button>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">{loginType === 'official' ? 'Official Government Email' : 'Email Address'}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label><div className="relative"><Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary" required /></div></div>
            <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 rounded-lg disabled:opacity-50 ${loginType === 'official' ? 'bg-slate-800' : 'bg-primary'}`}>{isLoading ? 'SIGNING IN...' : loginType === 'official' ? 'SECURE GOVT LOGIN' : 'LOGIN TO PORTAL'}</button>
            {loginType === 'public' && <div className="text-center text-sm text-gray-600">New Vendor or Consumer? <button type="button" onClick={() => navigate('/register')} className="font-bold text-primary hover:underline">Register Here</button></div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
