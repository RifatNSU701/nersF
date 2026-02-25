import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tenders from './pages/Tenders'; 
import Prices from './pages/Prices'; 
import Infrastructure from './pages/Infrastructure';

// ADMIN IMPORTS
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/admin/DashboardOverview'; // <--- NEW
import ImportExport from './pages/admin/ImportExport';
import Stocks from './pages/admin/Stocks';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/tenders" element={<Tenders />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/infrastructure" element={<Infrastructure />} />

        {/* AUTHENTICATION ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN ROUTES (Protected) */}
        <Route path="/admin" element={<DashboardLayout />}>
           {/* DEFAULT LANDING: The Main Dashboard Overview */}
           <Route index element={<DashboardOverview />} /> 
           
           {/* SUB-MODULES */}
           <Route path="dashboard" element={<DashboardOverview />} />
           <Route path="import-export" element={<ImportExport />} />
           <Route path="stocks" element={<Stocks />} />
           
           {/* PLACEHOLDERS (Coming Soon) */}
           <Route path="consumers" element={<div className="p-10 text-2xl font-bold text-gray-500">Consumer Distribution Data (Coming Soon)</div>} />
           <Route path="vendors" element={<div className="p-10 text-2xl font-bold text-gray-500">Vendor Registry (Coming Soon)</div>} />
           <Route path="reports" element={<div className="p-10 text-2xl font-bold text-gray-500">Audit Reports (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;