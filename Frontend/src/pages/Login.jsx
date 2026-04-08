import { useState, useContext } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, LayoutDashboard, Users, CheckCircle2 } from 'lucide-react';

const Login = () => {
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const mutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/auth/login', data);
            return response.data;
        },
        onSuccess: (responseData) => { 
            const user = responseData.data.user;
            toast.success('Welcome back to ProFlow!');
            setAuth(user);
            
            // Navigate based on role
            const role = user.role.toLowerCase();
            if (role === 'admin') {
                navigate('/admin-dashboard', { replace: true });
            } else if (role === 'manager') {
                navigate('/manager-dashboard', { replace: true });
            } else {
                navigate('/employee-dashboard', { replace: true });
            }
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Column: Product Showcase */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-16">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 dot-pattern" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">ProFlow</span>
                    </div>

                    <h1 className="text-6xl font-extrabold text-white leading-[1.1] mb-8">
                        Master your <br />
                        <span className="text-blue-500">Projects</span> with ease.
                    </h1>
                    <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                        The unified workspace for high-performing teams to plan, track, and deliver exceptional work.
                    </p>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-md">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Users className="text-blue-400 w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white font-semibold">Team Collaboration</p>
                            <p className="text-slate-400 text-sm">Stay synced with your team in real-time across all boards.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Authentication Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-slate-50 lg:bg-white">
                <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-6 text-white text-white">
                            <LayoutDashboard className="w-7 h-7" />
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight text-center lg:text-left">Sign In</h2>
                        <p className="mt-3 text-slate-500 font-medium text-center lg:text-left">
                            Welcome back! Please enter your details to access your dashboard.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid gap-4">
                            <button className="premium-btn-outline flex items-center justify-center gap-3 py-3 group">
                                <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                                </svg>
                                <span className="text-sm font-bold">Sign in with Google</span>
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-bold tracking-widest leading-none">Or Workspace Login</span></div>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            required
                                            className="premium-input pl-11"
                                            placeholder="you@company.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-sm font-bold text-slate-700">Password</label>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="premium-input pl-11 pr-11"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="premium-btn flex items-center justify-center gap-2 group shadow-xl shadow-slate-900/10"
                            >
                                {mutation.isPending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Enter Dashboard</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;