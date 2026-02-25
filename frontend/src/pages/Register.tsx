import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowLeft, User, Mail, FileText, Building2, Phone, CreditCard } from 'lucide-react';

type UserRole = 'public' | 'vendor';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('public');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Application Submitted Successfully.\n\nType: ${role === 'vendor' ? 'Vendor License' : 'Citizen Account'}\nStatus: Pending Verification`);
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* 1. LEFT SIDE - Form Section */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-8 bg-white text-gray-900 relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 flex items-center text-sm font-bold text-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </button>

        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Account Registration</h2>
            <p className="text-gray-500 mt-2">Create a verified account to access national services</p>
          </div>

          {/* ROLE SWITCHER TABS */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
            <button
              onClick={() => setRole('public')}
              className={`flex-1 py-3 text-sm font-bold rounded-md transition-all flex items-center justify-center ${
                role === 'public' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="h-4 w-4 mr-2" /> Private Citizen
            </button>
            <button
              onClick={() => setRole('vendor')}
              className={`flex-1 py-3 text-sm font-bold rounded-md transition-all flex items-center justify-center ${
                role === 'vendor' 
                  ? 'bg-white text-secondary shadow-sm text-yellow-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="h-4 w-4 mr-2" /> Contractor / Vendor
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               {/* --- SHARED FIELDS --- */}
               <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Legal Name / Company Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm font-medium" placeholder={role === 'public' ? "Mr. Citizen" : "Acme Engineering Ltd."} required />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="email" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm font-medium" placeholder="mail@example.com" required />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="tel" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm font-medium" placeholder="+880 1XXX..." required />
                  </div>
               </div>
            </div>

            {/* --- ROLE SPECIFIC FIELDS (GOVT GRADE) --- */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
               <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 border-b border-gray-200 pb-2">Identity Verification</h3>
               
               {role === 'public' && (
                 <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">National ID (NID)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm font-medium" placeholder="10-17 Digit Smart NID" required />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Your NID will be verified against the EC Database.</p>
                 </div>
               )}

               {role === 'vendor' && (
                 <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Trade License Number</label>
                       <div className="relative">
                         <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                         <input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none text-sm font-medium" placeholder="TRD-XXXX-YYYY" required />
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tax ID (TIN/BIN)</label>
                       <div className="relative">
                         <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                         <input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none text-sm font-medium" placeholder="BIN-XXXX-YYYY" required />
                       </div>
                    </div>
                 </div>
               )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Set Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input type="password" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm font-medium" placeholder="••••••••" required />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full text-white font-bold py-4 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex justify-center items-center text-sm tracking-wide ${
                role === 'vendor' ? 'bg-secondary hover:bg-yellow-600 text-primary-dark' : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {isLoading ? "VERIFYING DATA..." : role === 'vendor' ? "SUBMIT VENDOR APPLICATION" : "CREATE CITIZEN ACCOUNT"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} className="font-bold text-primary hover:underline cursor-pointer">Login here</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. RIGHT SIDE - Dynamic Visual Section */}
      <div className={`hidden lg:flex w-5/12 flex-col justify-center px-12 relative overflow-hidden text-white transition-colors duration-700 ${
        role === 'vendor' ? 'bg-slate-900' : 'bg-primary-dark'
      }`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="relative z-10">
          <Shield className={`h-16 w-16 mb-6 ${role === 'vendor' ? 'text-secondary' : 'text-blue-400'}`} />
          
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            {role === 'vendor' ? 'Empowering National' : 'Transparent Energy'} <br/>
            <span className={role === 'vendor' ? 'text-secondary' : 'text-blue-300'}>
               {role === 'vendor' ? 'Infrastructure' : 'For Everyone'}
            </span>
          </h1>
          
          <p className="text-lg text-blue-100 mb-8 leading-relaxed opacity-80">
            {role === 'vendor' 
              ? "Join the elite network of certified suppliers fueling Bangladesh's growth. Access exclusive government tenders and manage contracts securely."
              : "Access real-time grid data, download tariff reports, and participate in the national energy dialogue."
            }
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/10">
             <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">
               {role === 'vendor' ? 'Vendor Prerequisites' : 'Citizen Privileges'}
             </h3>
             <ul className="space-y-3 text-sm text-gray-300">
               <li className="flex items-center"><span className="text-green-400 mr-3">✓</span> {role === 'vendor' ? 'Valid Trade License & TIN' : 'Live Grid Monitoring'}</li>
               <li className="flex items-center"><span className="text-green-400 mr-3">✓</span> {role === 'vendor' ? '3-Year Audited Financials' : 'Tariff & Subsidy Alerts'}</li>
               <li className="flex items-center"><span className="text-green-400 mr-3">✓</span> {role === 'vendor' ? 'e-GP Registration' : 'Public Feedback Portal'}</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;