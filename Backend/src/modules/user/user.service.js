// ══════════════════════════════════════════════════
// User Service — Business Logic
// Migrated from: adminController.js
// ══════════════════════════════════════════════════

import bcrypt from 'bcryptjs';
import userRepository from './user.repository.js';
import { ApiError } from '../../shared/ApiError.js';

class UserService {
  async createUser({ username, email, password, role, designation }) {
    const allowedRoles = ['manager', 'employee'];
    if (!allowedRoles.includes(role)) {
      throw ApiError.badRequest("Invalid Role. Can only create 'manager' or 'employee'.");
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw ApiError.conflict('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return userRepository.create({
      username,
      email,
      password: hashedPassword,
      role,
      designation: designation || 'General Staff',
    });
  }

  async deleteUser(userId) {
    return userRepository.delete(userId);
  }

  async getAllUsers() {
    return userRepository.findAll();
  }

  async getEmployees() {
    return userRepository.findByRole('employee');
  }
}

export default new UserService();
