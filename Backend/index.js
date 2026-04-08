import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorHandler } from './src/middleware/errorHandler.js';

// Route Imports
import authRoutes from './src/modules/auth/auth.routes.js';
import taskRoutes from './src/modules/task/task.routes.js';
import commentRoutes from './src/modules/comment/comment.routes.js';
import attendanceRoutes from './src/modules/attendance/attendance.routes.js';
import payrollRoutes from './src/modules/payroll/payroll.routes.js';
import userRoutes from './src/modules/user/user.routes.js';
import dashboardRoutes from './src/modules/dashboard/dashboard.routes.js';

import initCronJobs from './src/utils/cron.js';

dotenv.config();
const app = express();

// Initialize Cron Jobs
initCronJobs();

// Standard Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.Base_URL || 'http://localhost:5173',
  credentials: true
}));

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/tasks', commentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/admin', userRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Shared Aliases for backward compatibility (Optional)
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ProFlow Engine Live on port ${PORT}`);
});