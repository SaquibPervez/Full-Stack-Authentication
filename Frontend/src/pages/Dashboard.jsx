import { useQuery } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import api from '../apis/axios';
import { LogOut, LayoutDashboard, Wallet, Users, Activity } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth(); // Context se user aur logout nikala

    const { data: dashboardData, isLoading, isError, error } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => {
            const res = await api.get('/dashboard/stats');
            return res.data;
        },
        refetchOnWindowFocus: false, 
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-600">
                Error: {error.response?.data?.error || "Something went wrong"}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                    <LayoutDashboard size={28} />
                    <span>Advisyn Admin</span>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-gray-800">{user?.username || "User"}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button 
                        onClick={logout} 
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </nav>

            <main className="p-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard 
                        title="Total Revenue" 
                        value={dashboardData?.stats?.revenue} 
                        icon={<Wallet className="text-green-600" />} 
                        bg="bg-green-50"
                    />
                    <StatCard 
                        title="Active Users" 
                        value={dashboardData?.stats?.totalUsers} 
                        icon={<Users className="text-blue-600" />} 
                        bg="bg-blue-50"
                    />
                    <StatCard 
                        title="Active Sessions" 
                        value={dashboardData?.stats?.activeSessions} 
                        icon={<Activity className="text-purple-600" />} 
                        bg="bg-purple-50"
                    />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-2">Server Message</h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded border border-dashed border-gray-300">
                        {dashboardData?.message}
                    </p>
                </div>
            </main>
        </div>
    );
};

// Simple Reusable Card Component
const StatCard = ({ title, value, icon, bg }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${bg}`}>
                {icon}
            </div>
        </div>
    </div>
);

export default Dashboard;