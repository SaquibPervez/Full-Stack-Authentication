import userService from './user.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import { catchAsync } from '../../shared/catchAsync.js';

export const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  ApiResponse.created(res, user, `${req.body.role.charAt(0).toUpperCase() + req.body.role.slice(1)} created successfully!`);
});

export const getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers();
  ApiResponse.success(res, users, 'Users fetched successfully');
});

export const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(parseInt(req.params.id));
  ApiResponse.success(res, null, 'User deleted successfully');
});
