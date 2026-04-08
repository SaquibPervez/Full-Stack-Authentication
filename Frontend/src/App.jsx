import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import PersonnelDirectory from './pages/admin/PersonnelDirectory.jsx';
import OperationsTracker from './pages/admin/OperationsTracker.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import ManagerMissions from './pages/manager/ManagerMissions.jsx';
import ManagerReports from './pages/manager/ManagerReports.jsx';
import ManagerCommunications from './pages/manager/ManagerCommunications.jsx';
import PayrollManager from './pages/manager/PayrollManager.jsx';
import EmployeeDashboard from './pages/EmployeeDashboard.jsx';
import EmployeeActivity from './pages/employee/EmployeeActivity.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './components/Layouts/DashboardLayout.jsx';
import useAuth from './hooks/useAuth';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-slate-50">
        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="mt-5 text-[10px] tracking-wider uppercase font-semibold text-slate-400">Loading</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          !user ? <Login /> : <Navigate to={`/${user.role}-dashboard`} replace />
        } 
      />
      <Route 
        path="/register" 
        element={
          !user ? <Register /> : <Navigate to={`/${user.role}-dashboard`} replace />
        } 
      />

      {/* Admin Routes wrapped in DashboardLayout */}
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
             <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        {/* Full View Workspace Modules */}
        <Route path="directory" element={<PersonnelDirectory />} />
        <Route path="operations" element={<OperationsTracker />} />
        <Route path="settings" element={<div className="max-w-7xl mx-auto px-6 py-10"><h1 className="text-xl font-semibold text-slate-900">Settings</h1><p className="text-sm text-slate-500 mt-1">Global system configuration</p></div>} />
      </Route>

      {/* Manager Routes wrapped in DashboardLayout */}
      <Route 
        path="/manager-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
             <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManagerDashboard />} />
        <Route path="missions" element={<ManagerMissions />} />
        <Route path="reports" element={<ManagerReports />} />
        <Route path="communications" element={<ManagerCommunications />} />
        <Route path="payroll" element={<PayrollManager />} />
      </Route>

      {/* Employee Routes wrapped in DashboardLayout */}
      <Route 
        path="/employee-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
             <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeeDashboard />} />
        <Route path="activity" element={<EmployeeActivity />} />
      </Route>
      
      {/* 404 Page */}
      <Route path="*" element={<div className="h-screen flex flex-col items-center justify-center bg-slate-50"><h1 className="text-xl font-semibold text-slate-900">404</h1><p className="text-sm text-slate-500 mt-1">Page not found</p></div>} />
    </Routes>
  );
}