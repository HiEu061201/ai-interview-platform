import express from 'express';
import { getUserProfile, getAnalytics } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.get('/profile/analytics', protect, getAnalytics);

export default router;
