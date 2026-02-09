import React from 'react';
import Navbar from '../components/Navbar';
import { ArrowRight, Droplet, Zap, Activity, AlertCircle, FileText, Database, TrendingUp, Users, ChevronRight, Phone, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Types
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  sub: string;
}

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* 1. Live Energy Ticker */}
      <div className="bg-black text-green-400 text-xs py-2.5 overflow-hidden border-b border-gray-800 tracking-wider font-mono">
        <div className="flex space-x-12 whitespace-nowrap container mx-auto px-4 overflow-x-auto scrollbar-hide items-center">
          <span className="flex items-center text-red-500 font-bold"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span> SYSTEM STATUS: ACTIVE</span>
          <span>BRENT CRUDE: $82.50 <span className="text-green-500">▲ 1.2%</span></span>
          <span className="text-gray-700">|</span>
          <span>LNG (SPOT): $12.40 <span className="text-red-500">▼ 0.5%</span></span>
          <span className="text-gray-700">|</span>
          <span>GRID FREQUENCY: 50.02 HZ</span>
          <span className="text-gray-700">|</span>
          <span>DHAKA LOAD: 8,450 MW</span>
        </div>
      </div>

      {/* 2. Hero Section */}
      <div className="relative h-[650px] w-full bg-primary-dark overflow-hidden">
        {/* Gradients & Image */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary/90 to-primary/60 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=2070" 
          alt="Energy Grid" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        
        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 h-full flex flex-col justify-center pb-20">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-3 mb-6">
              <span className="h-0.5 w-12 bg-secondary"></span>
              <span className="text-secondary font-bold tracking-[0.2em] text-xs uppercase">
                Ministry of Power, Energy & Mineral Resources
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              National Energy <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Security Framework</span>
            </h1>
            
            <p className="text-lg text-gray-300 mb-10 max-w-2xl leading-relaxed border-l-4 border-secondary pl-6">
              The centralized digital platform for monitoring national reserves, 
              managing infrastructure, and ensuring transparent public procurement.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/infrastructure')}
                className="bg-secondary hover:bg-yellow-500 text-primary-dark font-bold py-4 px-8 rounded flex items-center transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Check Grid Status <ChevronRight className="ml-2 h-5 w-5" />
              </button>
              <button 
                onClick={() => navigate('/tenders')}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-primary-dark font-bold py-4 px-8 rounded transition-all flex items-center"
              >
                Browse Tenders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Key Stats (Floating Cards) */}
      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-30 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={<Droplet className="h-8 w-8 text-blue-600"/>} 
            label="Strategic Oil Reserves" 
            value="12.5M BBL" 
            trend="+2.4%" 
            sub="45 Days Coverage"
          />
          <StatCard 
            icon={<Zap className="h-8 w-8 text-yellow-500"/>} 
            label="Daily Generation" 
            value="24,200 MW" 
            trend="+0.8%" 
            sub="98% of Demand Met"
          />
          <StatCard 
            icon={<Activity className="h-8 w-8 text-green-600"/>} 
            label="Renewable Mix" 
            value="8.5%" 
            trend="+1.2%" 
            sub="Target: 40% by 2041"
          />
        </div>
      </div>

      {/* 4. DIGITAL SERVICES (NEW PRO SECTION) */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Digital Services</h2>
            <p className="text-gray-500 text-sm mt-1">Access government services and public records.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Service 1: Tenders */}
          <Link to="/tenders" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-secondary transition-all group">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
              <FileText className="h-6 w-6 text-blue-600 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 group-hover:text-primary">e-Tendering</h3>
            <p className="text-xs text-gray-500 mb-4">View and apply for government procurement tenders.</p>
            <span className="text-xs font-bold text-blue-600 flex items-center">Browse <ArrowRight className="ml-1 h-3 w-3" /></span>
          </Link>

          {/* Service 2: Infrastructure */}
          <Link to="/infrastructure" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-secondary transition-all group">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
              <Database className="h-6 w-6 text-purple-600 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 group-hover:text-primary">Grid Dashboard</h3>
            <p className="text-xs text-gray-500 mb-4">Real-time status of power plants and transmission lines.</p>
            <span className="text-xs font-bold text-purple-600 flex items-center">View Map <ArrowRight className="ml-1 h-3 w-3" /></span>
          </Link>

          {/* Service 3: Rates */}
          <Link to="/prices" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-secondary transition-all group">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500 transition-colors">
              <TrendingUp className="h-6 w-6 text-yellow-600 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 group-hover:text-primary">Tariff Rates</h3>
            <p className="text-xs text-gray-500 mb-4">Check today's regulated Oil, Gas, and Electricity prices.</p>
            <span className="text-xs font-bold text-yellow-600 flex items-center">Check Rates <ArrowRight className="ml-1 h-3 w-3" /></span>
          </Link>

          {/* Service 4: Vendor Reg */}
          <Link to="/register" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-secondary transition-all group">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
              <Users className="h-6 w-6 text-green-600 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 group-hover:text-primary">Vendor Reg.</h3>
            <p className="text-xs text-gray-500 mb-4">Register your company to participate in national bids.</p>
            <span className="text-xs font-bold text-green-600 flex items-center">Sign Up <ArrowRight className="ml-1 h-3 w-3" /></span>
          </Link>
        </div>
      </div>
      
      {/* 5. Alert Section */}
      <div className="bg-white border-t border-b border-gray-200 py-12 mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                 <AlertCircle className="h-5 w-5 text-red-600" />
                 <span className="text-sm font-bold text-red-600 uppercase tracking-wide">Regulatory Notice</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Extension of Tender Submission Deadline</h3>
              <p className="text-gray-600 text-sm">
                The Ministry has extended the submission deadline for the "Matarbari LNG Terminal Construction" 
                (Ref: NERSF-2026-042) to March 15, 2026, due to revised technical specifications.
              </p>
            </div>
            <button 
              onClick={() => navigate('/tenders')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded text-sm whitespace-nowrap"
            >
              View Notice Details
            </button>
          </div>
        </div>
      </div>

      {/* 6. Footer (New Government Standard) */}
      <footer className="bg-primary-dark text-white pt-16 pb-8 mt-auto border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">NERSF</h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                The National Energy & Resource Supply Framework is the official digital gateway for 
                energy security monitoring and public procurement in Bangladesh.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-secondary mb-4 uppercase text-xs tracking-widest">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/tenders" className="hover:text-white transition-colors">Tenders</Link></li>
                <li><Link to="/infrastructure" className="hover:text-white transition-colors">Infrastructure</Link></li>
                <li><Link to="/prices" className="hover:text-white transition-colors">Market Rates</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-secondary mb-4 uppercase text-xs tracking-widest">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center"><Phone className="h-4 w-4 mr-2"/> +880 2 951 3333</li>
                <li className="flex items-center"><Mail className="h-4 w-4 mr-2"/> info@emrd.gov.bd</li>
                <li className="mt-4 text-xs text-gray-500">Bangladesh Secretariat, Dhaka-1000</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>© 2026 Ministry of Power, Energy & Mineral Resources. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
              <span className="hover:text-white cursor-pointer">Accessibility</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Reusable Stats Component
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, sub }) => (
  <div className="bg-white p-6 rounded shadow-lg border-t-4 border-secondary hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        {/* FIX: We added <{ className?: string }> to the cast below */}
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-6 w-6" })
          : icon
        }
      </div>
      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">{trend}</span>
    </div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
      <div className="flex items-center text-xs text-gray-400 border-t border-gray-100 pt-3 mt-2">
        <Activity className="h-3 w-3 mr-1" />
        {sub}
      </div>
    </div>
  </div>
);

export default Home;