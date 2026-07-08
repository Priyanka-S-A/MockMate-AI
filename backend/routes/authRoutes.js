import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  googleLoginOrRegister,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLoginOrRegister);
router.post('/forgot-password', forgotPassword);
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

export default router;
