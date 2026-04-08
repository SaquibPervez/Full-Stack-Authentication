import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios'; // New Axios instance
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial session restore from a safe "auth_user" cookie
    // Access and Refresh tokens are handled by HTTP-only cookies on the backend
    useEffect(() => {
        const storedUser = Cookies.get('auth_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    // Set user and sync with a non-HttpOnly cookie for the UI (never the sensitive token!)
    const setAuth = (userData) => {
        setUser(userData);
        if (userData) {
            const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
            Cookies.set('auth_user', JSON.stringify(userData), { 
                sameSite: 'lax', 
                secure: isHttps, 
                expires: 7 
            });
        } else {
            Cookies.remove('auth_user');
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            setAuth(null);
            // Full refresh to clear memory-based states if needed
            window.location.href = '/';
        }
    };

    return (
        <AuthContext.Provider value={{ user, setAuth, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;