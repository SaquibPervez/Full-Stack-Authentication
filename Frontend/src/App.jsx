import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import EmployeeDashboard from './pages/EmployeeDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import useAuth from './hooks/useAuth';

export default function App() {
  const { user, loading } = useAuth();

  // 🔄 1. Jab tak Auth check ho raha hai, Loading dikhao
  if (loading) {
    return <div className="h-screen flex justify-center items-center text-xl">Loading System...</div>;
  }

  return (
    <Routes>
      // Root par: Agar user hai toh uske dashboard par bhejo, nahi toh login page dikhao
      <Route 
        path="/" 
        element={
          !user ? <Login /> : <Navigate to={`/${user.role}-dashboard`} replace />
        } 
      />

      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/manager-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <ManagerDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/employee-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* 404 Page */}
      <Route path="*" element={<div className="p-10 text-center">404 - Page Not Found</div>} />
    </Routes>
  );
}