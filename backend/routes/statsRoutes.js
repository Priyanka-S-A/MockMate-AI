import express from 'express';
import { getDashboardStats, getScoreTrend } from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/score-trend', protect, getScoreTrend);

export default router;
