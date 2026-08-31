import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowLeft, User, Mail, Building2, Phone } from 'lucide-react';

type UserRole = 'public' | 'vendor';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('public');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_BASE + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone_number: form.phone,
          role: role === 'vendor' ? 'VENDOR' : 'CITIZEN'
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      setSuccess(data.message || 'Registration submitted successfully.');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: any) {
      setError(err.message || 'Unable to complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-8 bg-white text-gray-900 relative">
        <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center text-sm font-bold text-gray-400 hover:text-primary">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </button>

        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Account Registration</h2>
            <p className="text-gray-500 mt-2">Create a NERSF consumer account or submit a vendor application</p>
          </div>

          <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
            <button type="button" onClick={() => setRole('public')} className={'flex-1 py-3 text-sm font-bold rounded-md ' + (role === 'public' ? 'bg-white text-primary shadow-sm' : 'text-gray-500')}>
              <User className="inline h-4 w-4 mr-2" /> Consumer
            </button>
            <button type="button" onClick={() => setRole('vendor')} className={'flex-1 py-3 text-sm font-bold rounded-md ' + (role === 'vendor' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500')}>
              <Building2 className="inline h-4 w-4 mr-2" /> Vendor / Bidder
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{role === 'vendor' ? 'Company / Organization Name' : 'Full Legal Name'}</label>
              <div className="relative"><User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" /><input value={form.name} onChange={(e) => update('name', e.target.value)} type="text" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg" required /></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
              <div className="relative"><Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" /><input value={form.email} onChange={(e) => update('email', e.target.value)} type="email" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg" required /></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mobile Number</label>
              <div className="relative"><Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" /><input value={form.phone} onChange={(e) => update('phone', e.target.value)} type="tel" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg" required /></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Set Password</label>
              <div className="relative"><Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" /><input value={form.password} onChange={(e) => update('password', e.target.value)} type="password" minLength={8} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg" required /></div>
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters.</p>
            </div>

            <button type="submit" disabled={isLoading} className={'w-full text-white font-bold py-4 rounded-lg disabled:opacity-50 ' + (role === 'vendor' ? 'bg-secondary' : 'bg-primary')}>
              {isLoading ? 'SUBMITTING...' : role === 'vendor' ? 'SUBMIT VENDOR APPLICATION' : 'CREATE CONSUMER ACCOUNT'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <button onClick={() => navigate('/login')} className="font-bold text-primary hover:underline">Login here</button>
          </div>
        </div>
      </div>

      <div className={'hidden lg:flex w-5/12 flex-col justify-center px-12 relative overflow-hidden text-white ' + (role === 'vendor' ? 'bg-slate-900' : 'bg-primary-dark')}>
        <div className="relative z-10">
          <Shield className="h-16 w-16 mb-6 text-secondary" />
          <h1 className="text-4xl font-bold mb-4">{role === 'vendor' ? 'Join National Infrastructure' : 'Energy Services for Everyone'}</h1>
          <p className="text-lg text-blue-100 leading-relaxed opacity-80">
            {role === 'vendor' ? 'Vendor applications require government verification before tender and bidding access is granted.' : 'Create an account to access consumer-focused NERSF services and support.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;