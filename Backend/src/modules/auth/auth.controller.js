// ══════════════════════════════════════════════════
// Auth Controller — Thin HTTP Layer
// ══════════════════════════════════════════════════

import authService from './auth.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import { catchAsync } from '../../shared/catchAsync.js';

/**
 * POST /api/auth/signup
 */
export const register = catchAsync(async (req, res) => {
  const user = await authService.register(req.body);
  ApiResponse.created(res, user, 'User created successfully');
});

/**
 * POST /api/auth/login
 */
export const login = catchAsync(async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.login(req.body);

  // Set HTTP-only cookies
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 15 * 60 * 1000, // 15 min
  });

  ApiResponse.success(res, { accessToken, refreshToken, user }, 'Login successful');
});

/**
 * POST /api/auth/refresh-token
 */
export const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }
  const result = authService.refreshAccessToken(token);

  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 15 * 60 * 1000,
  });

  ApiResponse.success(res, result);
});

/**
 * POST /api/auth/logout
 */
export const logout = catchAsync(async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
  ApiResponse.success(res, null, 'Logged out');
});
