import dashboardService from './dashboard.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import { catchAsync } from '../../shared/catchAsync.js';

export const getAdminStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getAdminStats();
  ApiResponse.success(res, stats);
});

export const getManagerStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getManagerStats(req.user.id);
  ApiResponse.success(res, stats);
});

export const getEmployeeStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getEmployeeStats(req.user.id);
  ApiResponse.success(res, stats);
});
