import express from 'express';
import { getDailyChallenge, submitDailyChallenge } from '../controllers/dailyChallengeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDailyChallenge);
router.post('/submit', protect, submitDailyChallenge);

export default router;
