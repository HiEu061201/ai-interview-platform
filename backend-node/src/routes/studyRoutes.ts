import express from 'express';
import { getCategories, getMaterialsByCategory, getMaterialBySlug, getMyNotes } from '../controllers/studyController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/categories/:categorySlug/materials', getMaterialsByCategory);
router.get('/materials/:slug', getMaterialBySlug);
router.get('/my-notes', protect, getMyNotes);

export default router;
