import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import api from '../apis/axios';
import { useNavigate } from 'react-router-dom';

// Icons & Components
import StatCard from '../components/Dashboard/StatCard';
import EmployeeTable from '../components/Dashboard/EmployeeTable';
import TaskTable from '../components/Dashboard/TaskTable';
import {
  Users,
  UserCheck,
  ClipboardList,
  LogOut,
  LayoutDashboard,
  TrendingUp,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  PieChart,
  PlusCircle,
  Download,
  UserCog,
  Clock,
  CheckSquare,
  Activity,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  SquareChartGantt
} from 'lucide-react';
import AddEmployeeModal from '../components/Dashboard/AddEmployeeModal';
import CreateTaskModel from '../components/Dashboard/CreateTaskModel';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openModal, setOpenModal] = useState(false);
  // Fetch Data
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['adminStats'], // Refetch if user changes
    queryFn: async () => {
      const res = await api.get('/dashboard/admin');
      return res.data;

    },
    retry: 2,
    staleTime: 30000,
  });

  const handleLogout = () => {
    logout();
    // navigate('/login');
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="mt-6 text-lg font-medium text-gray-700">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to load data</h3>
          <p className="text-gray-600 mb-6">Please try refreshing the page or contact support.</p>
          <button 
            onClick={handleRefresh}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Destructure Data
  const { 
    users = 0, 
    managers = 0, 
    tasks = 0, 
    taskDistribution = [], 
    employees = []
  } = dashboardData || {};

  // Calculate completion rate
  const completedTasks = taskDistribution?.find(t => t.status === 'completed')?.count || 0;
  const completionRate = tasks > 0 ? ((completedTasks / tasks) * 100).toFixed(1) : 0;

  // Employees data comes directly from API

  // Render content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'users':
        return (
          <div className="space-y-6">
            {/* Users Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Employees" 
                value={users} 
                icon={Users} 
                color="from-blue-600 to-blue-700"
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
                trend="+12%"
              />
              <StatCard 
                title="Active Managers" 
                value={managers} 
                icon={UserCheck} 
                color="from-purple-600 to-purple-700"
                bgColor="bg-purple-100"
                iconColor="text-purple-600"
                trend="+5%"
              />
              <StatCard 
                title="Active Users" 
                value={users} 
                icon={CheckSquare} 
                color="from-green-600 to-green-700"
                bgColor="bg-green-100"
                iconColor="text-green-600"
                trend="91%"
              />
              <StatCard 
                title="Pending" 
                value={taskDistribution?.find(t => t.status === 'pending')?.count || 0} 
                icon={Clock} 
                color="from-orange-600 to-orange-700"
                bgColor="bg-orange-100"
                iconColor="text-orange-600"
              />
            </div>

            {/* Employee Table - Full Page */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">All Employees</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage employees, roles and permissions</p>
                </div>
                <div className="flex gap-2">
                  <button
                  onClick={() => setOpenModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                    <PlusCircle size={18} />
                    Add Employee
                  </button>
                </div>
              </div>
              {openModal && <AddEmployeeModal onClose={() => setOpenModal(false)} />}
              {/* Employee  Table Component */}
              <EmployeeTable employees={employees}  />
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6">
            {/* Tasks Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Tasks" 
                value={tasks} 
                icon={ClipboardList} 
                color="from-blue-600 to-blue-700"
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
                trend="+23%"
              />
              <StatCard 
                title="In Progress" 
                value={taskDistribution?.find(t => t.status === 'in_progress')?.count || 0} 
                icon={Activity} 
                color="from-purple-600 to-purple-700"
                bgColor="bg-purple-100"
                iconColor="text-purple-600"
              />
              <StatCard 
                title="Completed" 
                value={completedTasks} 
                icon={CheckSquare} 
                color="from-green-600 to-green-700"
                bgColor="bg-green-100"
                iconColor="text-green-600"
              />
              <StatCard 
                title="Overdue" 
                value={taskDistribution?.find(t => t.status === 'overdue')?.count || 0} 
                icon={Clock} 
                color="from-red-600 to-red-700"
                bgColor="bg-red-100"
                iconColor="text-red-600"
              />
            </div>

            {/* Task Table - Full Page */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">All Tasks</h2>
                  <p className="text-sm text-gray-600 mt-1">Create, assign and track all tasks</p>
                </div>
                <div className="flex gap-2">  
                <button
                  onClick={() => setOpenModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                    <PlusCircle size={18} />
                    Create Task
                  </button>
                </div>
              </div>
              {openModal && <CreateTaskModel onClose={() => setOpenModal(false)} employees={employees} />}
              {/* Task Table Component */}
              <TaskTable />
            </div>

            {/* Task Distribution Summary */}
            {taskDistribution?.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Task Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {taskDistribution.map((item) => (
                    <div key={item.status} className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 capitalize mb-1">{item.status.replace('_', ' ')}</p>
                      <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {tasks > 0 ? ((item.count / tasks) * 100).toFixed(1) : 0}% of total
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default: // dashboard
        return (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Employees" 
                value={users} 
                icon={Users} 
                color="from-blue-600 to-blue-700"
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
                trend="+12%"
              />
              <StatCard 
                title="Active Managers" 
                value={managers} 
                icon={UserCheck} 
                color="from-purple-600 to-purple-700"
                bgColor="bg-purple-100"
                iconColor="text-purple-600"
                trend="+5%"
              />
              <StatCard 
                title="Total Tasks" 
                value={tasks} 
                icon={ClipboardList} 
                color="from-orange-600 to-orange-700"
                bgColor="bg-orange-100"
                iconColor="text-orange-600"
                trend="+23%"
              />
              <StatCard 
                title="Completion Rate" 
                value={`${completionRate}%`} 
                icon={TrendingUp} 
                color="from-green-600 to-green-700"
                bgColor="bg-green-100"
                iconColor="text-green-600"
                trend={`${completedTasks}/${tasks} tasks`}
              />
            </div>

            {/* Task Distribution & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Distribution Card */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Task Status Overview</h2>
                    <p className="text-sm text-gray-600 mt-1">Distribution across all tasks</p>
                  </div>
                  <button 
                    onClick={() => handleTabChange('tasks')}
                    className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    View All Tasks
                  </button>
                </div>
                
                <div className="space-y-5">
                  {taskDistribution?.length > 0 ? taskDistribution.map((item) => {
                    const percentage = tasks > 0 ? ((parseInt(item.count) / parseInt(tasks)) * 100).toFixed(1) : 0;
                    return (
                      <div key={item.status}>
                        <div className="flex justify-between mb-1">
                          <span className="capitalize text-gray-700 font-medium">
                            {item.status.replace('_', ' ')}
                          </span>
                          <span className="text-gray-900 font-bold">{percentage}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              item.status === 'completed' ? 'bg-green-500' :
                              item.status === 'in_progress' ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8 text-gray-500">
                      No task data available
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <PieChart size={24} />
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">Quick Actions</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Dashboard Tools</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleTabChange('users')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <Users size={18} />
                    <span>Manage Users</span>
                  </button>
                  <button 
                    onClick={() => handleTabChange('tasks')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <ClipboardList size={18} />
                    <span>Manage Tasks</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Tasks Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Tasks</h2>
                  <p className="text-sm text-gray-600 mt-1">Latest tasks and their status</p>
                </div>
                <button 
                  onClick={() => handleTabChange('tasks')}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-medium"
                >
                  View All
                </button>
              </div>
              <TaskTable />
            </div>

            {/* Team Members Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
                  <p className="text-sm text-gray-600 mt-1">Active employees and their roles</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleTabChange('users')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <UserCog size={18} />
                    Manage Users
                  </button>
                </div>
              </div>
              <EmployeeTable employees={employees} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg text-gray-700 hover:bg-gray-50"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white 
        flex flex-col h-full transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Brand */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <SquareChartGantt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Project<span className="text-blue-400"> Manager </span></h1>
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

        {/* Navigation - Only Dashboard, Users, Tasks */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {/* Dashboard */}
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
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

            {/* Users - Shows EmployeeTable */}
            <button
              onClick={() => handleTabChange('users')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mt-1 ${
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

            {/* Tasks - Shows TaskTable */}
            <button
              onClick={() => handleTabChange('tasks')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mt-1 ${
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
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl w-full transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Header */}
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
                  {activeTab === 'users' && " Manage all employees and their roles."}
                  {activeTab === 'tasks' && " Create, assign, and track all tasks."}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;