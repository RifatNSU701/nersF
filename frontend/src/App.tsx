import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tenders from './pages/Tenders';
import Prices from './pages/Prices';
import Infrastructure from './pages/Infrastructure';
import ConsumerDashboard from './pages/consumer/ConsumerDashboard';
import HelpDesk from './pages/consumer/HelpDesk';
import VendorDashboard from './pages/vendor/VendorDashboard';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import ImportExport from './pages/admin/ImportExport';
import Stocks from './pages/admin/Stocks';
import Consumers from './pages/admin/Consumers';
import Vendors from './pages/admin/Vendors';
import Reports from './pages/admin/Reports';
import TenderEvaluation from './pages/admin/TenderEvaluation';
import SupportManagement from './pages/admin/SupportManagement';
import HelpDeskConsole from './pages/admin/HelpDeskConsole';

const getUser = () => { try { return JSON.parse(localStorage.getItem('nersf_user') || 'null'); } catch { return null; } };

function ProtectedRoute({ roles }: { roles: string[] }) {
  const token = localStorage.getItem('nersf_token');
  const user = getUser();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/tenders" element={<Tenders />} />
    <Route path="/prices" element={<Prices />} />
    <Route path="/infrastructure" element={<Infrastructure />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route element={<ProtectedRoute roles={['CITIZEN']} />}>
      <Route path="/consumer" element={<ConsumerDashboard />} />
      <Route path="/consumer/helpdesk" element={<HelpDesk />} />
    </Route>

    <Route element={<ProtectedRoute roles={['VENDOR']} />}>
      <Route path="/vendor" element={<VendorDashboard />} />
    </Route>

    <Route element={<ProtectedRoute roles={['ADMIN', 'OFFICER', 'AUDITOR', 'SUPER_ADMIN', 'TENDER_OFFICER', 'SUPPORT_AGENT']} />}>
      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="import-export" element={<ImportExport />} />
        <Route path="stocks" element={<Stocks />} />
        <Route path="consumers" element={<Consumers />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="reports" element={<Reports />} />
        <Route path="tender-evaluation" element={<TenderEvaluation />} />
        <Route path="support" element={<SupportManagement />} />
        <Route path="helpdesk" element={<HelpDeskConsole />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
export default App;