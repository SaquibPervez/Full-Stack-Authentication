import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../utils/jwtHelpers.js';

export const authenticateToken = (req, res, next) => {
    const token = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];

    if (token) {
        try {
            const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user = verified;
            return next(); 
        } catch (error) {
        }
    }

    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
        return res.status(401).json({ message: 'Access Denied: Please Login' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        const newAccessToken = generateAccessToken({ id: decoded.id, role: decoded.role });

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 
        });

        req.user = decoded;
        next();

    } catch (error) {
        return res.status(403).json({ message: 'Session Expired' });
    }
};