import { Bell, Search } from 'lucide-react';

const Header = ({ activeTab, user, searchTerm, onSearchChange, onViewAllTasks }) => (
  <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
    <div className="px-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
            {activeTab === 'dashboard' ? 'Dashboard Overview' : `${activeTab} Management`}
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, <span className="font-semibold text-gray-900">{user?.username}</span>!
            {activeTab === 'dashboard' && " Here's what's happening today."}
            {activeTab === 'users' && ' Manage all employees and their roles.'}
            {activeTab === 'tasks' && ' Create, assign, and track all tasks.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-64"
            />
          </div>

          {/* Notification Bell */}
          <button className="p-2.5 hover:bg-gray-100 rounded-xl relative cursor-pointer" onClick={onViewAllTasks}>
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
