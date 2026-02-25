import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertTriangle, ArrowLeft, UserCheck, Briefcase } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'official' | 'public'>('public');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation of API call
    setTimeout(() => {
      setIsLoading(false);
      
      if (loginType === 'official') {
        // GOVT OFFICIAL -> ADMIN DASHBOARD
        navigate('/admin'); 
      } else {
        // CITIZEN/VENDOR -> HOME PAGE
        navigate('/'); 
      }
      
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* 1. Left Side - Official Warning */}
      <div className="hidden lg:flex w-5/12 bg-slate-900 flex-col justify-between px-12 py-12 relative overflow-hidden text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
             <Shield className="h-10 w-10 text-secondary" />
             <div>
                <h1 className="text-2xl font-bold tracking-tight">NERSF</h1>
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Govt. of Bangladesh</p>
             </div>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 leading-tight">Secure Access <br/><span className="text-secondary">Gateway</span></h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Welcome to the National Energy & Resource Supply Framework. This system is monitored 24/7.
          </p>

          <div className="space-y-6">
             <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                   <UserCheck className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                   <h3 className="font-bold text-white">Verified Identity</h3>
                   <p className="text-sm text-gray-500">Multi-factor authentication required for officials.</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                   <Briefcase className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                   <h3 className="font-bold text-white">Vendor Portal</h3>
                   <p className="text-sm text-gray-500">Secure bidding and contract management.</p>
                </div>
             </div>
          </div>
        </div>

        <div className="relative z-10">
           <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-xs">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p>Unauthorized access is a punishable offense under the ICT Act of 2006.</p>
           </div>
           <p className="mt-4 text-[10px] text-gray-600 text-center">System ID: NERSF-GATE-01 | IP Logged</p>
        </div>
      </div>

      {/* 2. Right Side - Login Form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-8 bg-white relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 right-8 flex items-center text-sm font-bold text-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </button>

        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Portal Login</h2>
            <p className="text-gray-500">Select your access level to continue</p>
          </div>

          {/* Login Type Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
            <button
              onClick={() => setLoginType('public')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                loginType === 'public' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Citizen / Vendor
            </button>
            <button
              onClick={() => setLoginType('official')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                loginType === 'official' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Official Staff
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                 {loginType === 'official' ? 'Official Government Email' : 'Email Address'}
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                placeholder={loginType === 'official' ? "name@energy.gov.bd" : "name@company.com"}
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600">
                <input type="checkbox" className="mr-2 rounded border-gray-300 text-primary focus:ring-primary" />
                Remember me
              </label>
              <a href="#" className="text-primary hover:text-primary-dark font-bold text-xs">Forgot Password?</a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center ${
                 loginType === 'official' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                loginType === 'official' ? "SECURE GOVT LOGIN" : "LOGIN TO PORTAL"
              )}
            </button>

            {loginType === 'public' && (
               <div className="mt-6 text-center">
                 <p className="text-sm text-gray-600">
                   New Vendor or Citizen?{' '}
                   <span 
                     onClick={() => navigate('/register')}
                     className="font-bold text-primary hover:text-primary-dark cursor-pointer underline decoration-2 underline-offset-2"
                   >
                     Register Here
                   </span>
                 </p>
               </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;