import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ email: '', password: '' });

    const mutation = useMutation({
        mutationFn: async (data) => {
            return await login(data);
        },
        onSuccess: (userData) => { 
            toast.success('Logged in successfully');

            if (userData.role === 'admin') {
                navigate('/admin-dashboard', { replace: true });
            } else if (userData.role === 'manager') {
                navigate('/manager-dashboard', { replace: true });
            } else {
                navigate('/employee-dashboard', { replace: true });
            }
        },
        onError: (error) => {
            const message = error?.response?.data?.error || 'Login failed';
            console.log('Login error:', error);
            toast.error(message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl mb-4 font-bold">Login</h2>

                <input 
                    type="email" 
                    placeholder="Email"
                    className="w-full border p-2 mb-4 rounded"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                />
                <input 
                    type="password" 
                    placeholder="Password"
                    className="w-full border p-2 mb-4 rounded"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                />

                <button 
                    type="submit" 
                    disabled={mutation.isPending} // Loading ke waqt button disable
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300 flex justify-center items-center cursor-pointer"
                >
                    {mutation.isPending ? "Signing in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;