import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticateToken, (req, res) => {
    res.json({
        message: "Welcome to the Secret Dashboard!",
        user: req.user,
        stats: {
            totalUsers: 150,
            revenue: "$5,000",
            activeSessions: 12
        }
    });
});

export default router;