import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tenders from './pages/Tenders'; 
import Prices from './pages/Prices'; 
import Infrastructure from './pages/Infrastructure';

// ADMIN IMPORTS
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/admin/DashboardOverview'; 
import ImportExport from './pages/admin/ImportExport';
import Stocks from './pages/admin/Stocks';
import Consumers from './pages/admin/Consumers';
import Vendors from './pages/admin/Vendors'; // <--- NEW IMPORT ADDED

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
           <Route path="consumers" element={<Consumers />} />
           <Route path="vendors" element={<Vendors />} /> {/* <--- CONNECTED HERE */}
           
           {/* PLACEHOLDERS (Coming Soon) */}
           <Route path="reports" element={<div className="p-10 text-2xl font-bold text-gray-500">Audit Reports (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;