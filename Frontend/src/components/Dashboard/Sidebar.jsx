import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';

import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import Users from 'lucide-react/dist/esm/icons/users';
import ClipboardList from 'lucide-react/dist/esm/icons/clipboard-list';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import X from 'lucide-react/dist/esm/icons/x';
import Timer from 'lucide-react/dist/esm/icons/timer';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import UserCircle from 'lucide-react/dist/esm/icons/user-circle';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import Settings from 'lucide-react/dist/esm/icons/settings';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import BadgeDollarSign from 'lucide-react/dist/esm/icons/badge-dollar-sign';

const NAVIGATION_CONFIG = {
  admin: [
    {
      category: 'OVERVIEW',
      links: [
        { path: '/admin-dashboard', label: 'System Overview', icon: LayoutDashboard },
      ],
    },
    {
      category: 'WORKSPACE',
      links: [
        { path: '/admin-dashboard/directory', label: 'Personnel Directory', icon: Users },
        { path: '/admin-dashboard/operations', label: 'Operations Tracker', icon: ClipboardList },
      ],
    }
  ],
  manager: [
    {
      category: 'OVERVIEW',
      links: [
        { path: '/manager-dashboard', label: 'Team Overview', icon: LayoutDashboard },
      ],
    },
    {
      category: 'WORKSPACE',
      links: [
        { path: '/manager-dashboard/missions', label: 'Active Missions', icon: ClipboardList },
        { path: '/manager-dashboard/communications', label: 'Tactical Comms', icon: MessageSquare },
        { path: '/manager-dashboard/reports', label: 'Performance Reports', icon: BarChart3 },
      ],
    },
    {
      category: 'FINANCE',
      links: [
        { path: '/manager-dashboard/payroll', label: 'Payroll & Salaries', icon: BadgeDollarSign },
      ],
    },
  ],
  employee: [
    {
      category: 'WORKSPACE',
      links: [
        { path: '/employee-dashboard', label: 'My Tasks', icon: ClipboardList },
        { path: '/employee-dashboard/activity', label: 'Activity Log', icon: Timer },
      ],
    },
  ],
};  

const Sidebar = ({ user, userRole, sidebarOpen, onClose, onLogout }) => {
  const role = userRole || user?.role || 'employee';
  const sections = NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG.employee;

  return (
    <>
      {/* ─── Mobile Backdrop ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* ─── Sidebar Shell ─── */}
      <aside
        className={`
          fixed lg:static w-[250px] bg-white border-r border-slate-200/60
          flex flex-col h-full z-50 overflow-hidden
          transform-gpu transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* ─── Brand ─── */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 leading-none tracking-tight">
                ProFlow
              </h1>
              <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 mt-1">
                Enterprise v4
              </p>
            </div>
          </div>
        </div>

        {/* ─── Navigation Area ─── */}
        <nav className="flex-1 px-3 space-y-7 overflow-y-auto no-scrollbar pt-2">
          {sections.map((section, idx) => (
            <div key={section.category || idx}>
              <h3 className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 mb-3 px-3">
                {section.category}
              </h3>
              <div className="space-y-1">
                {section.links.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path.endsWith('dashboard')}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group relative
                      ${isActive 
                        ? 'bg-slate-50 text-slate-900 border-l-[3px] border-indigo-600 font-medium pl-2.5 shadow-sm shadow-slate-200/50' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 border-l-[3px] border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          size={18}
                          className={`flex-shrink-0 transition-colors duration-200 ${
                            isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                            <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-500/20" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ─── Footer: User Profile & Logout ─── */}
        <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-slate-200/60 hover:bg-white transition-all duration-200 group relative">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center font-semibold text-slate-700 uppercase">
                    {user?.username?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate leading-none mb-1">
                        {user?.username || 'System User'}
                    </p>
                    <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 truncate">
                        {role}
                    </p>
                </div>
                
                {/* Minimal Logout Action beside profile */}
                <button
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all duration-150 active:scale-90"
                    title="Log out"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </div>
      </aside>

      {/* ─── Mobile Close Override ─── */}
      {sidebarOpen && (
        <button
          onClick={onClose}
          className="lg:hidden fixed top-6 right-6 z-[60] p-2 bg-white text-slate-900 rounded-full shadow-lg border border-slate-200 active:scale-90 transition-all"
        >
          <X size={18} />
        </button>
      )}
    </>
  );
};

// Use memo to prevent parent re-renders from triggering expensive DOM reconciliation
export default memo(Sidebar);
