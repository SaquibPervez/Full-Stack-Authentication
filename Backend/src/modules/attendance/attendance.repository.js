// ══════════════════════════════════════════════════
// Attendance Repository — Data Access Layer
// ══════════════════════════════════════════════════

import prisma from '../../config/prisma.js';

class AttendanceRepository {
  async findTodayByUser(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });
  }

  async createPunchIn(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.attendance.create({
      data: {
        userId,
        date: today,
        punchIn: new Date(),
        status: 'present',
      },
    });
  }

  async updatePunchOut(id, punchIn) {
    const now = new Date();
    const totalHours = (now.getTime() - new Date(punchIn).getTime()) / (1000 * 60 * 60);
    return prisma.attendance.update({
      where: { id },
      data: {
        punchOut: now,
        totalHours: parseFloat(totalHours.toFixed(2)),
      },
    });
  }

  async getWeeklyByUser(userId) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    return prisma.attendance.findMany({
      where: {
        userId,
        date: { gte: weekAgo },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getTeamToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.user.findMany({
      where: { role: 'employee' },
      select: {
        id: true,
        username: true,
        email: true,
        designation: true,
        attendance: {
          where: { date: today },
          take: 1,
        },
      },
      orderBy: { username: 'asc' },
    });
  }

  /**
   * Mark absent employees who have no attendance record today.
   * Used by the cron job.
   */
  async markAbsentees() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find employees who already have records today
    const presentUserIds = await prisma.attendance.findMany({
      where: { date: today },
      select: { userId: true },
    });
    const presentIds = presentUserIds.map((a) => a.userId);

    // Find employees without records
    const absentees = await prisma.user.findMany({
      where: {
        role: 'employee',
        id: { notIn: presentIds.length > 0 ? presentIds : [0] },
      },
      select: { id: true },
    });

    // Create absent records
    if (absentees.length > 0) {
      await prisma.attendance.createMany({
        data: absentees.map((emp) => ({
          userId: emp.id,
          date: today,
          status: 'absent',
        })),
        skipDuplicates: true,
      });
    }

    return absentees.length;
  }

  /**
   * Count present/absent for a user in a specific month/year
   */
  async countByMonthForUser(userId, month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    const [present, absent] = await Promise.all([
      prisma.attendance.count({
        where: {
          userId,
          status: 'present',
          date: { gte: startDate, lte: endDate },
        },
      }),
      prisma.attendance.count({
        where: {
          userId,
          status: 'absent',
          date: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    return { present, absent };
  }
}

export default new AttendanceRepository();
