import React, { useState, useCallback, Suspense, lazy } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Menu from 'lucide-react/dist/esm/icons/menu';

// Lazy loading the sidebar to reduce initial bundle size (bundle-dynamic-imports)
const Sidebar = lazy(() => import('../Dashboard/Sidebar'));

const DashboardLayout = () => {
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Callbacks for stable props (rerender-functional-setstate)
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // ─── Loading State (Refined ProFlow Spec) ───
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center bg-slate-50">
        <div className="relative">
            <div className="w-12 h-12 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
            </div>
        </div>
        <p className="mt-6 text-[10px] tracking-[0.2em] uppercase font-bold text-slate-400 animate-pulse">
          Synchronizing Core
        </p>
      </div>
    );
  }

  // ─── Auth Guard ───
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      {/* ─── Global Shell Shell (Mobile FAB) ─── */}
      <button
        onClick={openSidebar}
        className="lg:hidden fixed bottom-8 right-8 z-[45] w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center active:scale-95 transition-all duration-200"
        aria-label="Open mission control"
      >
        <Menu size={20} />
      </button>

      {/* ─── Sidebar Layer ─── */}
      <Suspense fallback={<div className="w-[250px] bg-white border-r border-slate-200 animate-pulse" />}>
        <Sidebar
            user={user}
            userRole={user.role}
            sidebarOpen={sidebarOpen}
            onClose={closeSidebar}
            onLogout={logout}
        />
      </Suspense>

      {/* ─── Main Content Canvas ─── */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden h-full relative">
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar relative">
             {/* 
                Outlet wrapper to ensure clean entry animations for dashboard content.
                We use w-full and h-full to allow internal content to manage its container.
             */}
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
