import attendanceService from './attendance.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import { catchAsync } from '../../shared/catchAsync.js';

export const togglePunch = catchAsync(async (req, res) => {
  const result = await attendanceService.togglePunch(req.user.id);
  const statusCode = result.action === 'in' ? 201 : 200;
  return res.status(statusCode).json({ success: true, ...result });
});

export const getMyTimeSheet = catchAsync(async (req, res) => {
  const data = await attendanceService.getMyTimeSheet(req.user.id);
  ApiResponse.success(res, data);
});

export const getTeamAttendance = catchAsync(async (req, res) => {
  const data = await attendanceService.getTeamAttendance();
  ApiResponse.success(res, data, 'Team attendance fetched');
});
