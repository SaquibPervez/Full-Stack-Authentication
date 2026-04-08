import payrollService from './payroll.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import { catchAsync } from '../../shared/catchAsync.js';

export const processSalary = catchAsync(async (req, res) => {
  const result = await payrollService.processSalary(req.body);
  ApiResponse.success(res, result, 'Payroll processed');
});

export const getTeamPayroll = catchAsync(async (req, res) => {
  const { month, year } = req.query;
  const data = await payrollService.getTeamReport(month, year);
  ApiResponse.success(res, data);
});

export const getMyPayroll = catchAsync(async (req, res) => {
  const data = await payrollService.getUserHistory(req.user.id);
  ApiResponse.success(res, data);
});

export const getPreview = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { month, year } = req.query;
  const data = await payrollService.getPayrollPreview(userId, month, year);
  ApiResponse.success(res, data);
});
