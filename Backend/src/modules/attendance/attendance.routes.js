import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';
import { togglePunch, getMyTimeSheet, getTeamAttendance } from './attendance.controller.js';

const router = express.Router();
router.use(authenticate);

router.post('/punch', authenticate, togglePunch);
router.get('/me', authenticate, getMyTimeSheet);
router.get('/team', authenticate, authorize('manager', 'admin'), getTeamAttendance);
router.get('/status', authenticate, authorize('manager', 'admin'), getTeamAttendance);

export default router;
