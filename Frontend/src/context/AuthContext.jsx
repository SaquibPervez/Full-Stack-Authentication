import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api, { setAccessToken } from '../apis/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Initial Load ke liye

    // 1. Restore session from cookies (no refresh call on reload)
    useEffect(() => {
        try {
            const storedUser = Cookies.get('auth_user');
            setAccessToken(null);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Login Action (Sirf call karega, state update component karega)
    const login = async (credentials) => {
        const { data } = await api.post('/auth/login', credentials);
        // Treat 200 with { error } as failure so UI shows correct toast
        if (data?.error) {
            const err = new Error(data.error);
            err.response = { data };
            throw err;
        }
        setAccessToken(data.accessToken);
        setUser(data.user);
        // Persist for reload via cookies
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        Cookies.set('auth_user', JSON.stringify(data.user), { sameSite: 'lax', secure: isHttps, expires: 7 });
        return data;
    };

    // 3. Logout Action
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error(error);
        } finally {
            setAccessToken(null);
            setUser(null);
            Cookies.remove('auth_access_token');
            Cookies.remove('auth_user');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;