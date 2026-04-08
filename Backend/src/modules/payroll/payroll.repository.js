import prisma from '../../config/prisma.js';

class PayrollRepository {
  async findByUserMonth(userId, month, year) {
    return prisma.payroll.findUnique({
      where: {
        userId_month_year: { userId, month: month.toString(), year: parseInt(year) }
      }
    });
  }

  async upsert(data) {
    const { userId, month, year, ...rest } = data;
    return prisma.payroll.upsert({
      where: {
        userId_month_year: { userId, month: month.toString(), year: parseInt(year) }
      },
      update: rest,
      create: data,
    });
  }

  async getTeamPayroll(month, year) {
    return prisma.user.findMany({
      where: { role: 'employee' },
      select: {
        id: true,
        username: true,
        email: true,
        designation: true,
        payroll: {
          where: { month: month.toString(), year: parseInt(year) },
          take: 1
        },
        attendance: {
          where: {
            date: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0)
            }
          }
        }
      }
    });
  }

  async getMyPayroll(userId) {
    return prisma.payroll.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default new PayrollRepository();
