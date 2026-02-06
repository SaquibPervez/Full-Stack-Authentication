import axios from 'axios';
import toast from 'react-hot-toast';

// 1. Access Token ko Memory mein rakhna (Securest way)
let accessToken = null;

// Helper taake hum bahar se token set kar sakein
export const setAccessToken = (token) => {
    accessToken = token;
};
// Prefer Vite proxy in local dev to ensure same-site cookies
const baseURL = import.meta.env.DEV ? '/api' : 'http://localhost:5000/api';
// 2. Axios Instance
const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Decode JWT expiry for logging (no token contents logged)
const getJwtExpiryISO = (token) => {
    try {
        const parts = token?.split?.('.') || [];
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (!payload?.exp) return null;
        return new Date(payload.exp * 1000).toISOString();
    } catch {
        return null;
    }
};

// 3. Request Interceptor (Token Injection)
api.interceptors.request.use(
    (config) => {
        // Prefer cookie-based auth; still attach header if we have an in-memory token
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 4. Response Interceptor (Silent Refresh Logic)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config || {};

        const isRefreshCall = typeof originalRequest.url === 'string' 
            && originalRequest.url.includes('/auth/refresh-token');
        const isAuthCall = typeof originalRequest.url === 'string'
            && originalRequest.url.startsWith('/auth/');

        // Agar 401 (Unauthorized) aaya aur humne retry nahi kiya
        // Stop calling refresh endpoint; rely on backend middleware to auto-refresh using cookie.
        // Do NOT retry auth endpoints like /auth/login to avoid double-submission.
        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall && !isAuthCall) {
            originalRequest._retry = true;

            try {
                const method = (originalRequest.method || '').toUpperCase();
                console.log(`🔒 401 for ${method} ${originalRequest.url}. Backend will auto-refresh from cookie; retrying once.`);

                // Simply retry the original request; backend middleware will mint a new access cookie if refresh cookie is valid
                return api(originalRequest);

            } catch (refreshError) {
                console.error('Session expired. User needs to login.');
                toast.error('Session expired. Please log in again.');
                setAccessToken(null);
                // Agar refresh bhi fail, to Login page par bhejo
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

                // No explicit refresh endpoint, so no special-case for refresh call

                // Non-401 errors or when not retried → show toast
        const message = error?.response?.data?.error
          || error?.response?.data?.message
          || error?.message
          || 'Request failed';
        toast.error(message);
        return Promise.reject(error);
    }
);

export default api;