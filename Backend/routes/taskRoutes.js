import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { createTask, deleteTask, editTask } from '../controllers/taskController.js';

const router = express.Router();

router.post('/create', authenticateToken, createTask);
router.post('/edit/:id', authenticateToken, editTask);
router.delete('/delete/:id', authenticateToken, deleteTask);
export default router;