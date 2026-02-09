import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, ChevronDown, BarChart3, Database, FileText } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* 1. Logo Section */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center cursor-pointer space-x-3 group"
          >
            <Shield className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="font-bold text-2xl tracking-tight leading-none">NERSF</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors">
                Govt. of Bangladesh
              </span>
            </div>
          </div>

          {/* 2. Desktop Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="hover:text-secondary transition-colors font-medium text-sm uppercase tracking-wide">
              Home
            </Link>
            
            {/* Market Data Dropdown */}
            <div className="group relative cursor-pointer h-20 flex items-center">
              <span 
                onClick={() => navigate('/prices')}
                className="flex items-center hover:text-secondary transition-colors font-medium text-sm uppercase gap-1 tracking-wide"
              >
                <BarChart3 className="w-4 h-4" /> Market Data <ChevronDown className="w-4 h-4 opacity-50" />
              </span>
              <div className="absolute top-20 left-0 w-60 bg-primary-dark shadow-xl hidden group-hover:block border-t-4 border-secondary">
                <Link to="/prices" className="block px-6 py-4 hover:bg-white/5 text-sm border-b border-white/10 transition-colors">
                  <span className="font-bold block text-secondary">Energy Prices</span>
                  <span className="text-xs text-gray-400">Daily regulated rates</span>
                </Link>
                <Link to="/prices" className="block px-6 py-4 hover:bg-white/5 text-sm transition-colors">
                  <span className="font-bold block text-secondary">Stock Levels</span>
                  <span className="text-xs text-gray-400">National reserve status</span>
                </Link>
              </div>
            </div>

            {/* Infrastructure Dropdown (FIXED) */}
            <div className="group relative cursor-pointer h-20 flex items-center">
              <span 
                onClick={() => navigate('/infrastructure')}
                className="flex items-center hover:text-secondary transition-colors font-medium text-sm uppercase gap-1 tracking-wide"
              >
                <Database className="w-4 h-4" /> Infrastructure <ChevronDown className="w-4 h-4 opacity-50" />
              </span>
              <div className="absolute top-20 left-0 w-60 bg-primary-dark shadow-xl hidden group-hover:block border-t-4 border-secondary">
                <Link to="/infrastructure" className="block px-6 py-4 hover:bg-white/5 text-sm border-b border-white/10 transition-colors">
                  <span className="font-bold block text-secondary">National Dashboard</span>
                  <span className="text-xs text-gray-400">Real-time grid status</span>
                </Link>
                <Link to="/infrastructure" className="block px-6 py-4 hover:bg-white/5 text-sm transition-colors">
                  <span className="font-bold block text-secondary">Import / Export</span>
                  <span className="text-xs text-gray-400">Transmission flow</span>
                </Link>
              </div>
            </div>

            <Link to="/tenders" className="flex items-center hover:text-secondary transition-colors font-medium text-sm uppercase gap-1 tracking-wide">
              <FileText className="w-4 h-4" /> Tenders
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4 ml-6 border-l border-white/20 pl-6 h-10">
              <button 
                onClick={() => navigate('/register')}
                className="text-white/80 hover:text-white font-medium text-sm transition-all uppercase tracking-wide"
              >
                Register
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="bg-secondary hover:bg-yellow-500 text-primary-dark font-bold py-2.5 px-6 rounded shadow-md uppercase tracking-wide text-xs transform transition-all hover:-translate-y-0.5"
              >
                Login
              </button>
            </div>
          </div>

          {/* 3. Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-secondary p-2">
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden bg-primary-dark border-t border-white/10 absolute w-full left-0 z-50 shadow-2xl">
          <div className="px-4 pt-4 pb-8 space-y-1">
            <Link to="/" className="block px-4 py-3 rounded-lg hover:bg-white/5 font-medium border-l-4 border-transparent hover:border-secondary">Home</Link>
            
            <p className="text-[10px] font-bold text-gray-500 px-4 uppercase tracking-widest mt-4 mb-2">Services</p>
            <Link to="/prices" className="block px-4 py-3 rounded-lg hover:bg-white/5 pl-8 border-l-4 border-transparent hover:border-secondary">Market Rates</Link>
            <Link to="/infrastructure" className="block px-4 py-3 rounded-lg hover:bg-white/5 pl-8 border-l-4 border-transparent hover:border-secondary">Infrastructure Map</Link>
            <Link to="/tenders" className="block px-4 py-3 rounded-lg hover:bg-white/5 pl-8 border-l-4 border-transparent hover:border-secondary">e-Tenders</Link>
            
            <div className="grid grid-cols-2 gap-4 mt-8 px-2">
              <button 
                onClick={() => navigate('/register')}
                className="text-center text-white border border-white/20 hover:bg-white/10 py-3 rounded font-bold text-sm uppercase"
              >
                Register
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="text-center bg-secondary text-primary-dark font-bold py-3 rounded shadow-lg text-sm uppercase"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;