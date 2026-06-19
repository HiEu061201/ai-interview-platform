import express from 'express';
import { getDailyQuests } from '../controllers/questController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/daily', protect, getDailyQuests);

export default router;
