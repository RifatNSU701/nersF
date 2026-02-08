import React from 'react';
import Navbar from '../components/Navbar';
import { ArrowRight, Droplet, Zap, Activity, AlertCircle } from 'lucide-react';

// 1. Define Strict Types
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  sub: string;
}

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* 2. Live Energy Ticker */}
      <div className="bg-black text-green-400 text-xs py-2 overflow-hidden border-b border-gray-800 tracking-wider">
        <div className="flex space-x-8 whitespace-nowrap container mx-auto px-4 overflow-x-auto scrollbar-hide">
          <span className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span> LIVE FEED</span>
          <span>CRUDE OIL: $78.45 <span className="text-green-500">▲ 1.2%</span></span>
          <span className="text-gray-600">|</span>
          <span>NATURAL GAS: $2.30 <span className="text-red-500">▼ 0.5%</span></span>
          <span className="text-gray-600">|</span>
          <span>DHAKA GRID LOAD: 8,450 MW (STABLE)</span>
          <span className="text-gray-600">|</span>
          <span>CHITTAGONG REFINERY: <span className="text-blue-400">ONLINE</span></span>
        </div>
      </div>

      {/* 3. Hero Section (FIXED: Increased height and padding) */}
      <div className="relative h-[700px] w-full bg-primary-dark overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary to-transparent opacity-95 z-10"></div>
        
        {/* Background Image */}
        <img 
          src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=2070" 
          alt="Bangladesh Energy Infrastructure" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
        
        {/* Content Container - Added pb-40 to push content UP away from cards */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 h-full flex flex-col justify-center pb-40">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 mb-6">
              <span className="h-1 w-12 bg-secondary"></span>
              <span className="text-secondary font-bold tracking-widest text-sm uppercase">
                Official Transparency Portal
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              National Energy & <br/>
              Resource Supply Framework
            </h1>
            
            <p className="text-xl text-gray-200 mb-10 max-w-2xl leading-relaxed border-l-4 border-secondary pl-6">
              Securing Bangladesh's future through real-time resource tracking, 
              transparent tendering, and strategic reserve management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-secondary hover:bg-yellow-500 text-primary-dark font-bold py-4 px-8 rounded flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                View Active Tenders <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="border-2 border-gray-300 text-white hover:bg-white hover:text-primary-dark font-bold py-4 px-8 rounded transition-all hover:-translate-y-1">
                Download Annual Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Key Indicators (Cards) */}
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-30 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={<Droplet className="h-8 w-8 text-blue-600"/>} 
            label="Strategic Oil Reserves" 
            value="12.5M Barrels" 
            trend="+2.4%" 
            sub="Sufficient for 45 Days"
          />
          <StatCard 
            icon={<Zap className="h-8 w-8 text-yellow-500"/>} 
            label="National Grid Load" 
            value="14,200 MW" 
            trend="+0.8%" 
            sub="Peak Time: 19:00 - 23:00"
          />
          <StatCard 
            icon={<Activity className="h-8 w-8 text-green-600"/>} 
            label="Renewable Contribution" 
            value="8.5%" 
            trend="+1.2%" 
            sub="Target: 40% by 2041"
          />
        </div>
      </div>
      
      {/* 5. Alert Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-l-4 border-red-500 bg-red-50 p-6 flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-800">Urgent Tender Notice</h3>
              <p className="text-red-700 mt-1">
                The submission deadline for <strong>LNG Terminal Construction (Tender ID: NERSF-2026-042)</strong> has been extended to 15th March 2026.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Stats Component
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, sub }) => (
  <div className="bg-white p-8 rounded shadow-xl border-t-4 border-secondary hover:shadow-2xl transition-shadow group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">{icon}</div>
      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">{trend}</span>
    </div>
    <div>
      <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
      <p className="text-xs text-gray-400 border-t border-gray-100 pt-2 mt-2">{sub}</p>
    </div>
  </div>
);

export default Home;