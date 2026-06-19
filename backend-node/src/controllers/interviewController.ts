import { Response } from 'express';
import { InterviewSession, InterviewStatus } from '../models/InterviewSession';
import { AuthRequest } from '../middlewares/authMiddleware';
import { User } from '../models/User';
import { UserQuest, QuestType } from '../models/Quest';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

// Gamification: award EXP and process quests after finishing session
const processGamification = async (session: any, userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Base EXP for completing interview
    let currentExp = user.exp ?? 0;
    let currentLevel = user.level ?? 1;

    currentExp += 50;
    const requiredExp = currentLevel * 100;
    if (currentExp >= requiredExp) {
      currentLevel++;
      currentExp -= requiredExp;
    }

    user.exp = currentExp;
    user.level = currentLevel;
    await user.save();
  } catch (err) {
    console.error('processGamification error:', err);
  }
};

// POST /api/interviews
export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const { positionRole, experienceLevel, interviewType, language, targetTurns, jobDescription, resumeText, isHardcore } = req.body;
    let { techStack } = req.body;

    if (Array.isArray(techStack)) {
      techStack = techStack.join(', ');
    }
    
    if (!positionRole || !experienceLevel || !interviewType) {
      return res.status(400).json({ 
        message: 'Missing required fields: positionRole, experienceLevel, interviewType' 
      });
    }

    const session = await InterviewSession.create({
      user: req.user!._id,
      positionRole,
      experienceLevel,
      interviewType,
      language,
      targetTurns: targetTurns || 5,
      techStack,
      jobDescription,
      resumeText,
      isHardcore: isHardcore || false,
      status: InterviewStatus.IN_PROGRESS,
      currentTurn: 0,
      startedAt: new Date()
    });

    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create interview session' });
  }
};

// GET /api/interviews/:id
export const getSession = async (req: AuthRequest, res: Response) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    if (session.user.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/interviews
export const getUserSessions = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 10;

    const total = await InterviewSession.countDocuments({ user: req.user!._id });
    const sessions = await InterviewSession.find({ user: req.user!._id })
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size);

    res.json({
      content: sessions,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size,
      number: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/interviews/:id/cancel
export const cancelSession = async (req: AuthRequest, res: Response) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.user.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (session.status === InterviewStatus.COMPLETED) {
      return res.status(400).json({ message: 'Cannot cancel a finished session' });
    }

    session.status = InterviewStatus.CANCELLED;
    session.endedAt = new Date();
    await session.save();

    res.json({ message: 'Session cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/interviews/:id/finish
export const finishSession = async (req: AuthRequest, res: Response) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.user.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (session.status === InterviewStatus.COMPLETED) {
      return res.status(400).json({ message: 'Session already finished' });
    }

    session.status = InterviewStatus.COMPLETED;
    session.endedAt = new Date();

    if (session.startedAt) {
      session.durationSeconds = Math.floor(
        (session.endedAt.getTime() - session.startedAt.getTime()) / 1000
      );
    }

    await session.save();

    // Award gamification EXP
    await processGamification(session, req.user!._id.toString());

    res.json({ message: 'Session finished successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/interviews/extract-cv
export const extractCv = async (req: AuthRequest & { file?: any }, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileName = req.file.originalname?.toLowerCase() || '';
    if (!fileName.endsWith('.pdf')) {
      return res.status(400).json({ message: 'Only PDF files are supported' });
    }

    const data = await pdfParse(req.file.buffer);
    const extractedText = data.text?.trim() || '';

    if (!extractedText) {
      return res.status(422).json({ message: 'Could not extract text from PDF' });
    }

    res.json({ text: extractedText });
  } catch (error) {
    console.error('extractCv error:', error);
    res.status(500).json({ message: 'Failed to extract text from PDF' });
  }
};

// Legacy - kept for compatibility
export const endSession = finishSession;
