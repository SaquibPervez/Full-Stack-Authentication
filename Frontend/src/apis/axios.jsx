import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

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

// 4. Response Interceptor (Silent Refresh + Global Session Handling)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config || {};

        const status = error?.response?.status;
        const isRefreshCall = typeof originalRequest.url === 'string' 
            && originalRequest.url.includes('/auth/refresh-token');
        const isAuthCall = typeof originalRequest.url === 'string'
            && originalRequest.url.startsWith('/auth/');

        // 1) For non-auth routes: on first 401, retry once so backend can
        //    auto-refresh the access token using the refresh cookie.
        if (status === 401 && !originalRequest._retry && !isRefreshCall && !isAuthCall) {
            originalRequest._retry = true;
            const method = (originalRequest.method || '').toUpperCase();
            console.log(`🔒 401 for ${method} ${originalRequest.url}. Backend will auto-refresh from cookie; retrying once.`);
            return api(originalRequest);
        }

        // 2) If we still get 401/403 on any non-auth call, treat it as a
        //    hard session expiry: clear client auth state and send user home.
        if (!isAuthCall && !isRefreshCall && (status === 401 || status === 403)) {
            console.error('Session expired. Redirecting to home.');
            toast.error('Session expired. Please log in again.');
            // Clear in-memory token and any persisted user cookie so
            // AuthContext no longer sees the user as logged in.
            setAccessToken(null);
            Cookies.remove('auth_user');
            // Send user back to root; App route at "/" will decide what to show.
            window.location.href = '/';
            return Promise.reject(error);
        }

        // 3) For all other errors (including /auth/* calls), just surface
        //    the backend message.
        const message = error?.response?.data?.error
          || error?.response?.data?.message
          || error?.message
          || 'Request failed';
        toast.error(message);
        return Promise.reject(error);
    }
);

export default api;