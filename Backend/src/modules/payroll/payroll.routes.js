import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.js';
import { getTeamPayroll, processSalary, getMyPayroll } from './payroll.controller.js';
import { processSalarySchema, payrollQuerySchema } from './payroll.validation.js';

const router = express.Router();

router.get('/team', authenticate, authorize('manager', 'admin'), validate(payrollQuerySchema), getTeamPayroll);
router.post('/process', authenticate, authorize('manager', 'admin'), validate(processSalarySchema), processSalary);
router.get('/me', authenticate, getMyPayroll);

export default router;
