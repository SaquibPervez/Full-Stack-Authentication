// ══════════════════════════════════════════════════
// Authentication Middleware (JWT)
// Replaces: middleware/authMiddleware.js
//
// Logic preserved: Check accessToken cookie first,
// if expired, silently refresh from refreshToken.
// ══════════════════════════════════════════════════

import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  // 1. Try accessToken from cookie or Authorization header
  const token = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];

  if (token) {
    try {
      const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = verified;
      return next();
    } catch {
      // Token expired or invalid — fall through to try refresh
    }
  }

  // 2. Try refreshToken for silent renewal
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Access Denied: Please Login' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    // Set new cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 15 * 60 * 1000,
    });

    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Session Expired' });
  }
};
