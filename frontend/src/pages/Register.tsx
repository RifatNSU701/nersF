import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowLeft, User, Mail, FileText, Building2, Phone } from 'lucide-react';

type UserRole = 'public' | 'vendor';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('public'); // Default to Public
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Logic would differ here based on role in real backend
      alert(`Registration submitted for ${role === 'vendor' ? 'Vendor Approval' : 'Public Account'}.`);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* 1. LEFT SIDE - Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white text-gray-900 shadow-xl z-10">
        <div className="w-full max-w-md">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Portal
          </button>

          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-500 mt-2">Select your account type to proceed</p>
          </div>

          {/* ROLE SWITCHER TABS */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
            <button
              onClick={() => setRole('public')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                role === 'public' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Public Citizen
            </button>
            <button
              onClick={() => setRole('vendor')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                role === 'vendor' 
                  ? 'bg-white text-secondary shadow-sm text-yellow-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Vendor / Supplier
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* --- FORM FIELDS FOR PUBLIC --- */}
            {role === 'public' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Mr. Citizen" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="tel" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="+880 1XXX XXXXXX" required />
                  </div>
                </div>
              </>
            )}

            {/* --- FORM FIELDS FOR VENDOR --- */}
            {role === 'vendor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none" placeholder="Acme Energy Ltd." required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trade License No.</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none" placeholder="TRD-2026-XXXX" required />
                  </div>
                </div>
              </>
            )}

            {/* --- COMMON FIELDS --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input type="email" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="user@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Set Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input type="password" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="••••••••" required />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex justify-center items-center ${
                role === 'vendor' ? 'bg-secondary hover:bg-yellow-600 text-primary-dark' : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {isLoading ? "PROCESSING..." : role === 'vendor' ? "SUBMIT LICENSE APPLICATION" : "CREATE PUBLIC ACCOUNT"}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already registered?{' '}
              <span onClick={() => navigate('/login')} className="font-bold text-primary hover:underline cursor-pointer">Login here</span>
            </p>
            
            {/* Government Official Note */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                <strong>Note for Government Officials:</strong><br/>
                You cannot self-register. Please contact the Ministry IT Cell for your credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RIGHT SIDE - Dynamic Visual Section */}
      <div className={`hidden lg:flex w-1/2 flex-col justify-center px-12 relative overflow-hidden text-white transition-colors duration-500 ${
        role === 'vendor' ? 'bg-slate-900' : 'bg-primary-dark'
      }`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        {/* Content changes based on Role */}
        <div className="relative z-10">
          <Shield className={`h-16 w-16 mb-6 ${role === 'vendor' ? 'text-secondary' : 'text-blue-400'}`} />
          
          <h1 className="text-4xl font-bold mb-4">
            {role === 'vendor' ? 'Grow with the Nation' : 'Your Voice Matters'}
          </h1>
          
          <p className="text-lg text-blue-100 mb-8 leading-relaxed">
            {role === 'vendor' 
              ? "Join the network of certified suppliers fueling Bangladesh's growth. Bid on national tenders and manage energy contracts."
              : "Access public reports, submit complaints, and provide valuable feedback on energy distribution in your area."
            }
          </p>
          
          <h3 className="font-bold text-white mb-3 uppercase tracking-wider text-sm">
            {role === 'vendor' ? 'Vendor Requirements:' : 'Citizen Features:'}
          </h3>
          
          <ul className="space-y-3 text-gray-300">
            {role === 'vendor' ? (
              <>
                <li className="flex items-center"><span className="text-secondary mr-2">✓</span> Valid Trade License & TIN</li>
                <li className="flex items-center"><span className="text-secondary mr-2">✓</span> 3-Year Financial Audit</li>
                <li className="flex items-center"><span className="text-secondary mr-2">✓</span> ISO Certification (Preferred)</li>
              </>
            ) : (
              <>
                <li className="flex items-center"><span className="text-blue-400 mr-2">✓</span> View Live Grid Status</li>
                <li className="flex items-center"><span className="text-blue-400 mr-2">✓</span> Submit Load Shedding Complaints</li>
                <li className="flex items-center"><span className="text-blue-400 mr-2">✓</span> Download Public Energy Reports</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;