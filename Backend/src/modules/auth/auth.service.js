// ══════════════════════════════════════════════════
// Auth Service — Business Logic Layer
// Login, Register, JWT generation, Auto-attendance.
//
// Migrated from: authController.js
// Key improvement: attendance side-effect is now
// an explicit service call, not hidden in login.
// ══════════════════════════════════════════════════

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRepository from './auth.repository.js';
import { ApiError } from '../../shared/ApiError.js';
import prisma from '../../config/prisma.js';

class AuthService {
  /**
   * Register a new user.
   * Default role is 'employee', designation is 'General Staff'.
   */
  async register({ username, email, password }) {
    // Check for duplicate email
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw ApiError.conflict('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authRepository.create({
      username,
      email,
      password: hashedPassword,
      role: 'employee',
      designation: 'General Staff',
    });

    return user;
  }

  /**
   * Login with email + password.
   * Returns user payload + JWT tokens.
   * Also handles auto-attendance punch-in for employees.
   */
  async login({ email, password }) {
    // Find user (need password for comparison, so query directly)
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.#generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = this.#generateRefreshToken({ id: user.id, role: user.role, email: user.email });

    // Auto-attendance: punch-in for employees on login (fire-and-forget)
    if (user.role === 'employee') {
      this.#autoAttendancePunchIn(user.id);
    }

    // Build safe user payload (no password)
    const userPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return { accessToken, refreshToken, user: userPayload };
  }

  /**
   * Refresh an expired access token using a valid refresh token.
   */
  refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const newAccessToken = this.#generateAccessToken({ id: decoded.id, role: decoded.role });
      return { accessToken: newAccessToken, user: { id: decoded.id, email: decoded.email } };
    } catch {
      throw ApiError.forbidden('Invalid or expired refresh token');
    }
  }

  // ─── Private Helpers ───

  #generateAccessToken(payload) {
    return jwt.sign(
      { id: payload.id, role: payload.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
  }

  #generateRefreshToken(payload) {
    return jwt.sign(
      { id: payload.id, email: payload.email, role: payload.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Auto punch-in attendance on login (fire-and-forget).
   * Previously was a raw pool.query inside authController.login().
   * Now isolated and uses Prisma upsert for idempotency.
   */
  async #autoAttendancePunchIn(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.attendance.upsert({
        where: {
          userId_date: { userId, date: today },
        },
        update: {}, // Do nothing if already exists
        create: {
          userId,
          date: today,
          punchIn: new Date(),
          status: 'present',
        },
      });
    } catch (err) {
      console.error('[Auth] Auto-attendance error:', err.message);
      // Never let attendance failure block login
    }
  }
}

export default new AuthService();
