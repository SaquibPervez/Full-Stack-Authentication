import { LayoutDashboard, Users, ClipboardList, ChevronRight, LogOut, Menu, X } from 'lucide-react';

const Sidebar = ({
  sidebarOpen,
  onToggle,
  onClose,
  activeTab,
  onTabChange,
  user,
  onLogout,
}) => (
  <>
    {/* Mobile Sidebar Toggle */}
    <button
      onClick={onToggle}
      className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
    >
      {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
    </button>

    {/* Sidebar Overlay */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 opacity-100 cursor-pointer"
        onClick={onClose}
      />
    )}

    {/* Sidebar */}
    <aside className={`
      fixed lg:static w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white
      flex flex-col h-full transform-gpu transition-transform duration-500 ease-out z-50
      ${sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo & Brand */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Saquib<span className="text-blue-400">Dev</span></h1>
            <p className="text-xs text-slate-400 mt-0.5">Administrator Panel</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold text-white">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-white">{user?.username || 'Admin'}</p>
            <p className="text-xs text-slate-400 mt-0.5">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {/* Dashboard */}
          <button
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </div>
            {activeTab === 'dashboard' && <ChevronRight size={16} />}
          </button>

          {/* Users */}
          <button
            onClick={() => onTabChange('users')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mt-1 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={20} />
              <span className="font-medium">Users</span>
            </div>
            {activeTab === 'users' && <ChevronRight size={16} />}
          </button>

          {/* Tasks */}
          <button
            onClick={() => onTabChange('tasks')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mt-1 cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <ClipboardList size={20} />
              <span className="font-medium">Tasks</span>
            </div>
            {activeTab === 'tasks' && <ChevronRight size={16} />}
          </button>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl w-full transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  </>
);

export default Sidebar;
