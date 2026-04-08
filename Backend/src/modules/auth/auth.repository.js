// ══════════════════════════════════════════════════
// Auth Repository — Data Access Layer
// User lookup and creation queries via Prisma.
// ══════════════════════════════════════════════════

import prisma from '../../config/prisma.js';

class AuthRepository {
  /**
   * Find a user by email (for login and duplicate checks)
   */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by ID (for token refresh, profile)
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        designation: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  /**
   * Create a new user (registration)
   */
  async create(data) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        designation: true,
        createdAt: true,
      },
    });
  }
}

export default new AuthRepository();
