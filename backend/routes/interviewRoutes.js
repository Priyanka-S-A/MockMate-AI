import express from 'express';
import multer from 'multer';
import {
  createInterview,
  getInterview,
  submitAnswer,
  skipQuestion,
  getNextQuestion,
  completeInterview,
  getUserInterviews,
  downloadInterviewPDF,
  createResumeInterview,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes are protected
router.use(protect);

router.post('/', createInterview);
router.post('/resume', upload.single('resume'), createResumeInterview);
router.get('/', getUserInterviews);
router.get('/:id', getInterview);
router.get('/:id/pdf', downloadInterviewPDF);
router.post('/:id/answer', submitAnswer);
router.post('/:id/skip', skipQuestion);
router.post('/:id/next-question', getNextQuestion);
router.post('/:id/complete', completeInterview);

export default router;
