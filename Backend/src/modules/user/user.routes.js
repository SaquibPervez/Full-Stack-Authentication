import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';
import { createUser, deleteUser, getAllUsers } from './user.controller.js';

const router = express.Router();

router.post('/create-user', authenticate, authorize('admin', 'manager'), createUser);
router.post('/delete-user/:id', authenticate, authorize('admin'), deleteUser);
router.get('/users', authenticate, authorize('admin', 'manager'), getAllUsers);

export default router;
