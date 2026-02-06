import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../utils/jwtHelpers.js';

export const authenticateToken = (req, res, next) => {
    const cookieAccess = req.cookies?.accessToken;
    const authHeader = req.headers['authorization'];
    const headerAccess = authHeader && authHeader.split(' ')[1];
    const access = cookieAccess || headerAccess;

    if (access) {
        try {
            const user = jwt.verify(access, process.env.ACCESS_TOKEN_SECRET);
            req.user = user;
            return next();
        } catch (err) {
        }
    }

    const refresh = req.cookies?.refreshToken;
    if (!refresh) {
        return res.status(401).json({ error: 'Access Denied: No Token Provided' });
    }

    try {
        const user = jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET);
        // Mint new access and set cookie
        const newAccess = generateAccessToken(user);
        res.cookie('accessToken', newAccess, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 2 * 60 * 1000, // keep in sync with '2m'
        });
        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid Token' });
    }
};