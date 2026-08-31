import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Globe, Package, Users, 
  Briefcase, FileText, Gavel, LogOut, Shield 
} from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin/dashboard' },
    { icon: <Globe size={20} />, label: 'Import / Export', path: '/admin/import-export' },
    { icon: <Package size={20} />, label: 'National Stocks', path: '/admin/stocks' },
    { icon: <Users size={20} />, label: 'Consumers (Dist)', path: '/admin/consumers' },
    { icon: <Briefcase size={20} />, label: 'Vendor Registry', path: '/admin/vendors' },
    { icon: <Gavel size={20} />, label: 'Tender Evaluation', path: '/admin/tender-evaluation' },
    { icon: <FileText size={20} />, label: 'Audit Reports', path: '/admin/reports' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* 1. SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        {/* Branding */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <Shield className="h-8 w-8 text-secondary mr-3" />
          <div>
            <h1 className="font-bold text-xl tracking-tight">NERSF</h1>
            <span className="text-[10px] uppercase text-gray-400 tracking-widest">Admin Console</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Operations</p>
          {menuItems.map((item) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center px-3 py-3 rounded-lg cursor-pointer transition-all group ${
                location.pathname === item.path 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`mr-3 ${location.pathname === item.path ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary-dark font-bold text-xs">
              AD
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Admin User</p>
              <p className="text-xs text-gray-500">Ministry of Power</p>
            </div>
            <button onClick={() => navigate('/')} title="Logout">
              <LogOut size={16} className="text-gray-500 hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 overflow-auto relative">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800">
            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-gray-500 uppercase">Secure Connection • TLS 1.3</span>
          </div>
        </header>

        {/* Page Content (Where child routes render) */}
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;