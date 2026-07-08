import express from 'express';
import {
  getAdminStats,
  getUsersList,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getInterviewsList,
  deleteInterview,
  getSettings,
  updateSettings
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect & admin checks to all admin endpoints
router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/users', getUsersList);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/interviews', getInterviewsList);
router.delete('/interviews/:id', deleteInterview);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
