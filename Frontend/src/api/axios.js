import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor to handle global errors and match the new ApiError format
api.interceptors.response.use(
    (response) => {
        // Our backend returns { success: true, data: ..., message: ... }
        // Success data is already unwrapped if we want, but axios puts it in response.data
        return response;
    },
    (error) => {
        const status = error?.response?.status;
        const data = error?.response?.data;

        // Extract message from our new ApiError format: { success: false, message: "...", errors: [...] }
        const message = data?.message || error?.message || 'Something went wrong';
        
        // Handle unauthorized/session expiry
        if (status === 401) {
            // Optional: Redirect to login if not already there
            if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
                toast.error('Session expired. Please login again.');
                window.location.href = '/';
            }
        } else if (status === 403) {
            toast.error('You do not have permission to perform this action.');
        } else {
            // General error toast
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default api;
