import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { createTask, deleteTask, editTask, getFullTaskDetails } from '../controllers/taskController.js';
import { autorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/create', authenticateToken, createTask);
router.put('/edit/:id', authenticateToken, editTask);
router.delete('/delete/:id', authenticateToken, deleteTask);
router.get('/task-details', authenticateToken, getFullTaskDetails );
export default router;