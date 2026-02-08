import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, ChevronDown, BarChart3, Database, Globe, FileText } from 'lucide-react';

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
            className="flex items-center cursor-pointer space-x-3"
          >
            <Shield className="h-8 w-8 text-secondary" />
            <div className="flex flex-col">
              <span className="font-bold text-2xl tracking-tight">NERSF</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-300">
                Govt. of Bangladesh
              </span>
            </div>
          </div>

          {/* 2. Desktop Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="hover:text-secondary transition-colors font-medium text-sm uppercase">
              Home
            </Link>
            
            {/* Market Data Dropdown */}
            <div className="group relative cursor-pointer h-20 flex items-center">
              <span className="flex items-center hover:text-secondary transition-colors font-medium text-sm uppercase gap-1">
                <BarChart3 className="w-4 h-4" /> Market Data <ChevronDown className="w-4 h-4" />
              </span>
              <div className="absolute top-20 left-0 w-56 bg-primary-dark shadow-xl hidden group-hover:block border-t-4 border-secondary">
                <Link to="/prices" className="block px-4 py-3 hover:bg-blue-800 text-sm border-b border-blue-900">
                  Energy Prices
                </Link>
                <Link to="/stocks" className="block px-4 py-3 hover:bg-blue-800 text-sm">
                  Stock Levels
                </Link>
              </div>
            </div>

            {/* Infrastructure Dropdown */}
            <div className="group relative cursor-pointer h-20 flex items-center">
              <span className="flex items-center hover:text-secondary transition-colors font-medium text-sm uppercase gap-1">
                <Database className="w-4 h-4" /> Infrastructure <ChevronDown className="w-4 h-4" />
              </span>
              <div className="absolute top-20 left-0 w-56 bg-primary-dark shadow-xl hidden group-hover:block border-t-4 border-secondary">
                <Link to="/storage" className="block px-4 py-3 hover:bg-blue-800 text-sm border-b border-blue-900">
                  National Storage
                </Link>
                <Link to="/trade" className="flex items-center px-4 py-3 hover:bg-blue-800 text-sm gap-2">
                  <Globe className="w-4 h-4" /> Import / Export
                </Link>
              </div>
            </div>

            <Link to="/tenders" className="flex items-center hover:text-secondary transition-colors font-medium text-sm uppercase gap-1">
              <FileText className="w-4 h-4" /> Tenders
            </Link>

            {/* Auth Buttons (UPDATED DESIGN) */}
            <div className="flex items-center space-x-4 ml-4">
              <button 
                onClick={() => navigate('/register')}
                className="border border-white/30 hover:bg-white/10 text-white font-medium py-2 px-6 rounded text-sm transition-all uppercase tracking-wide"
              >
                Register
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="bg-secondary hover:bg-yellow-500 text-primary-dark font-bold py-2 px-6 rounded text-sm transition-all shadow-md uppercase tracking-wide"
              >
                LOGIN
              </button>
            </div>
          </div>

          {/* 3. Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-secondary">
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden bg-primary-dark border-t border-blue-900 absolute w-full left-0 z-50 shadow-xl">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link to="/" className="block px-3 py-2 rounded-md hover:bg-blue-900 font-medium">Home</Link>
            <div className="border-t border-blue-900 my-2"></div>
            <p className="text-xs text-gray-400 px-3 uppercase mt-2">Market Data</p>
            <Link to="/prices" className="block px-3 py-2 rounded-md hover:bg-blue-900 pl-6">Energy Prices</Link>
            <Link to="/stocks" className="block px-3 py-2 rounded-md hover:bg-blue-900 pl-6">Stock Levels</Link>
            
            <div className="border-t border-blue-900 my-2"></div>
            <p className="text-xs text-gray-400 px-3 uppercase mt-2">Infrastructure</p>
            <Link to="/storage" className="block px-3 py-2 rounded-md hover:bg-blue-900 pl-6">National Storage</Link>
            <Link to="/trade" className="block px-3 py-2 rounded-md hover:bg-blue-900 pl-6">Import / Export</Link>
            
            <div className="border-t border-blue-900 my-2"></div>
            <Link to="/tenders" className="block px-3 py-2 rounded-md hover:bg-blue-900 font-medium">Tenders & Bids</Link>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button 
                onClick={() => navigate('/register')}
                className="text-center text-white border border-white/20 hover:bg-white/10 py-3 rounded font-medium"
              >
                REGISTER
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="text-center bg-secondary text-primary-dark font-bold py-3 rounded shadow-lg"
              >
                LOGIN
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;