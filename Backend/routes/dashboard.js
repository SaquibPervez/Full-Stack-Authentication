import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { autorizeRoles } from '../middleware/roleMiddleware.js';
import { getAdminStats, getEmployeeStats, getManagerStats } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/admin', authenticateToken, autorizeRoles('admin'), getAdminStats);

// 2. Manager Stats (Manager & Admin)
router.get('/manager', authenticateToken, autorizeRoles('manager', 'admin'), getManagerStats);

// 3. Employee Stats (Sab dekh sakte hain, par data sirf apna milega)
router.get('/employee', authenticateToken, autorizeRoles('employee', 'manager', 'admin'), getEmployeeStats);

export default router;