import express from 'express';
import { register, login, refreshToken, googleLogin, getCurrentUser } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/google', googleLogin);
router.get('/me', protect, getCurrentUser);

export default router;
