import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulation of API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Login functionality will be connected to Backend in Phase 2");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* 1. Left Side - Official Warning (Government Style) */}
      <div className="hidden lg:flex w-1/2 bg-primary-dark flex-col justify-center px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 text-white">
          <Shield className="h-16 w-16 text-secondary mb-6" />
          <h1 className="text-4xl font-bold mb-4">Official Access Only</h1>
          <p className="text-lg text-blue-200 mb-8 leading-relaxed">
            This system contains classified data regarding National Energy Infrastructure.
            Unauthorized access is a punishable offense under the <span className="text-white font-bold">ICT Act of Bangladesh</span>.
          </p>
          <div className="flex items-center space-x-4 bg-blue-900/50 p-4 rounded-lg border border-blue-800">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <p className="text-sm text-gray-300">
              All activities are monitored and logged. IP Address: 103.25.x.x
            </p>
          </div>
        </div>
      </div>

      {/* 2. Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-500 hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Public Portal
          </button>

          <div className="text-center mb-10">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">Portal Login</h2>
            <p className="text-gray-500 mt-2">Enter your official credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="name@energy.gov.bd"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600">
                <input type="checkbox" className="mr-2 rounded border-gray-300 text-primary focus:ring-primary" />
                Remember this device
              </label>
              <a href="#" className="text-primary hover:text-primary-dark font-medium">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "SECURE LOGIN"
              )}
            </button>

            {/* Added: Create Account Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <span 
                  onClick={() => navigate('/register')}
                  className="font-bold text-primary hover:text-primary-dark cursor-pointer underline decoration-1 underline-offset-4"
                >
                  Create one here
                </span>
              </p>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            System Version 6.0 | Engineered for NERSF
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;