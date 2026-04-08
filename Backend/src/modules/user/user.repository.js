// ══════════════════════════════════════════════════
// User Repository — Data Access Layer
// ══════════════════════════════════════════════════

import prisma from '../../config/prisma.js';

class UserRepository {
  async findAll(orderBy = { createdAt: 'desc' }) {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        designation: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy,
    });
  }

  async findByRole(role) {
    return prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        username: true,
        email: true,
        designation: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

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

  async delete(id) {
    return prisma.user.delete({ where: { id } });
  }

  async count(where = {}) {
    return prisma.user.count({ where });
  }
}

export default new UserRepository();
