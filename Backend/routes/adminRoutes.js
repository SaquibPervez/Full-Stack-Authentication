import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { autorizeRoles } from '../middleware/roleMiddleware.js';
import { createUser, deleteUser, getFullTaskDetails } from '../controllers/adminController.js';


const router = express.Router();

router.post('/create-user', authenticateToken, autorizeRoles('admin', 'manager'), createUser);
router.post('/delete-user/:id', authenticateToken, autorizeRoles('admin'), deleteUser);
router.get('/task-details', getFullTaskDetails);
export default router;
