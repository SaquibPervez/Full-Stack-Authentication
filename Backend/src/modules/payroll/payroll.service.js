import payrollRepository from './payroll.repository.js';
import attendanceRepository from '../attendance/attendance.repository.js';
import prisma from '../../config/prisma.js';
import { ApiError } from '../../shared/ApiError.js';

class PayrollService {
  async processSalary(data) {
    const { userId, month, year, basicSalary, allowances, deductions, status } = data;

    // Calculate Attendance Statistics
    const stats = await attendanceRepository.countByMonthForUser(userId, month, year);
    
    // Per-day calculation (Assuming 30-day billing cycle)
    const perDay = basicSalary / 30;
    const netPayable = (perDay * stats.present) + parseFloat(allowances) - parseFloat(deductions);

    return payrollRepository.upsert({
      userId,
      month: month.toString(),
      year: parseInt(year),
      basicSalary,
      allowances: parseFloat(allowances || 0),
      deductions: parseFloat(deductions || 0),
      netPayable: parseFloat(netPayable.toFixed(2)),
      status: status || 'pending'
    });
  }

  async getPayrollPreview(userId, month, year) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { baseSalary: true, username: true, designation: true }
    });

    if (!user) throw new ApiError(404, 'User not found');

    const stats = await attendanceRepository.countByMonthForUser(userId, month, year);
    
    // (Base Salary / 30) * Days Present
    const dailyRate = parseFloat(user.baseSalary) / 30;
    const netPayable = dailyRate * stats.present;

    return {
      userId,
      username: user.username,
      designation: user.designation,
      baseSalary: user.baseSalary,
      daysPresent: stats.present,
      daysAbsent: stats.absent,
      netPayable: parseFloat(netPayable.toFixed(2)),
      month,
      year
    };
  }

  async getTeamReport(month, year) {
    const rawData = await payrollRepository.getTeamPayroll(month, year);
    
    return rawData.map(emp => {
      const payroll = emp.payroll?.[0] || null;
      const attendance = emp.attendance;
      
      return {
        id: emp.id,
        username: emp.username,
        email: emp.email,
        designation: emp.designation,
        basic_salary: payroll?.basicSalary || 0,
        net_payable: payroll?.netPayable || 0,
        status: payroll?.status || 'unprocessed',
        days_present: attendance.filter(a => a.status === 'present').length,
        days_absent: attendance.filter(a => a.status === 'absent').length,
      };
    });
  }

  async getUserHistory(userId) {
    return payrollRepository.getMyPayroll(userId);
  }
}

export default new PayrollService();
