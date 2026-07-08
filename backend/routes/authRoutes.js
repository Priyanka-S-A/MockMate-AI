import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  googleLoginOrRegister,
  verifyOtpRegister,
  resendRegisterOtp,
  verifyForgotPasswordOtp,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Registration routes
router.post('/register', register);
router.post('/register-verify', verifyOtpRegister);
router.post('/register-resend', resendRegisterOtp);

// Traditional & Google Login
router.post('/login', login);
router.post('/google', googleLoginOrRegister);

// Recovery routes
router.post('/forgot-password', forgotPassword);
router.post('/forgot-password-verify', verifyForgotPasswordOtp);
router.post('/forgot-password-reset', resetPassword);

// Profile routes
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

export default router;
