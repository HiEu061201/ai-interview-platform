import express from 'express';
import multer from 'multer';
import { 
  createSession, 
  getSession, 
  getUserSessions, 
  cancelSession,
  finishSession,
  extractCv
} from '../controllers/interviewController';
import { 
  getFeedback, 
  getFeedbackPrompt, 
  saveFeedback, 
  generateFeedback 
} from '../controllers/feedbackController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Session routes
router.post('/', protect, createSession);
router.get('/', protect, getUserSessions);
router.get('/:id', protect, getSession);
router.patch('/:id/cancel', protect, cancelSession);
router.patch('/:id/finish', protect, finishSession);

// CV extraction
router.post('/extract-cv', protect, upload.single('file'), extractCv);

// Feedback routes (nested under session)
router.get('/:sessionId/feedback', protect, getFeedback);
router.get('/:sessionId/feedback/prompt', protect, getFeedbackPrompt);
router.post('/:sessionId/feedback', protect, saveFeedback);
router.post('/:sessionId/feedback/generate', protect, generateFeedback);

export default router;
