import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';
import { getAdminStats, getManagerStats, getEmployeeStats } from './dashboard.controller.js';

const router = express.Router();

router.get('/admin', authenticate, authorize('admin'), getAdminStats);
router.get('/manager', authenticate, authorize('manager', 'admin'), getManagerStats);
router.get('/employee', authenticate, getEmployeeStats);

export default router;
