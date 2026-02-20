import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { autorizeRoles } from '../middleware/roleMiddleware.js';
import { createUser, deleteUser } from '../controllers/adminController.js';
import { getFullTaskDetails } from '../controllers/taskController.js';


const router = express.Router();

router.post('/create-user', authenticateToken, autorizeRoles('admin', 'manager'), createUser);
router.post('/delete-user/:id', authenticateToken, autorizeRoles('admin'), deleteUser);
export default router;
