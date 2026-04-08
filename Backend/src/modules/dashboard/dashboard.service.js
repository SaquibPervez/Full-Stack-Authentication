import prisma from '../../config/prisma.js';

class DashboardService {
  async getAdminStats() {
    const [userCount, taskStats, payrollStats] = await Promise.all([
      prisma.user.count(),
      prisma.task.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.payroll.aggregate({ _sum: { netPayable: true } })
    ]);

    return {
      totalUsers: userCount,
      tasks: taskStats,
      totalPayout: payrollStats._sum.netPayable || 0
    };
  }

  async getManagerStats(managerId) {
    const tasks = await prisma.task.groupBy({
      by: ['status'],
      where: { createdById: managerId },
      _count: { id: true }
    });
    return { workload: tasks };
  }

  async getEmployeeStats(userId) {
    const [tasks, taskList, attendance] = await Promise.all([
      prisma.task.count({ where: { assignedToId: userId } }),
      prisma.task.findMany({ 
        where: { assignedToId: userId },
        orderBy: { createdAt: 'desc' },
        include: { comments: true }
      }),
      prisma.attendance.count({ where: { userId, status: 'present' } })
    ]);
    return { 
        assignedTasks: tasks, 
        daysPresent: attendance,
        tasks: taskList,
        pendingTasks: taskList.filter(t => t.status === 'pending').length,
        completedTasks: taskList.filter(t => t.status === 'completed').length
    };
  }
}

export default new DashboardService();
