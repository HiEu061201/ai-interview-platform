import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { InterviewSession, InterviewStatus } from '../models/InterviewSession';
import { InterviewFeedback } from '../models/Feedback';
import { ChatMessage, Sender } from '../models/ChatMessage';
import { buildFeedbackPrompt, getAiTextResponse } from '../services/aiService';
import { User } from '../models/User';
import { UserQuest, QuestType } from '../models/Quest';

interface QaPair {
  question: string;
  answer: string;
  suggestedAnswer?: string;
  scoreClarity?: number;
  scoreTechnical?: number;
  scoreConfidence?: number;
}

const buildQaReview = (chatHistory: any[]): QaPair[] => {
  const pairs: QaPair[] = [];
  let currentQuestion: string | null = null;

  for (const msg of chatHistory) {
    if (msg.sender === Sender.AI) {
      currentQuestion = msg.messageContent;
    } else if (msg.sender === Sender.USER && currentQuestion) {
      pairs.push({
        question: currentQuestion,
        answer: msg.messageContent,
        suggestedAnswer: msg.suggestedAnswer,
        scoreClarity: msg.scoreClarity,
        scoreTechnical: msg.scoreTechnical,
        scoreConfidence: msg.scoreConfidence,
      });
      currentQuestion = null;
    }
  }
  return pairs;
};

const mapFeedbackToResponse = (feedback: any, qaReview: QaPair[] = []) => ({
  id: feedback.id,
  sessionId: feedback.session,
  overallScore: feedback.overallScore,
  technicalScore: feedback.technicalScore,
  communicationScore: feedback.communicationScore,
  clarityScore: feedback.clarityScore,
  confidenceScore: feedback.confidenceScore,
  strengths: feedback.strengths,
  weaknesses: feedback.weaknesses,
  detailedReview: feedback.detailedReview,
  improvementPlan: feedback.improvementPlan,
  recommendationLevel: feedback.recommendationLevel,
  qaReview,
});

// GET /api/interviews/:sessionId/feedback
export const getFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!._id;

    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const existingFeedback = await InterviewFeedback.findOne({ session: sessionId });
    if (!existingFeedback) {
      return res.status(204).send(); // No content - not yet generated
    }

    const chatHistory = await ChatMessage.find({ session: sessionId }).sort({ createdAt: 1 });
    const qaReview = buildQaReview(chatHistory);

    res.json(mapFeedbackToResponse(existingFeedback, qaReview));
  } catch (error) {
    console.error('getFeedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/interviews/:sessionId/feedback/prompt
export const getFeedbackPrompt = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!._id;

    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const chatHistory = await ChatMessage.find({ session: sessionId }).sort({ createdAt: 1 });
    if (chatHistory.length === 0) {
      return res.status(400).json({ message: 'Không thể tạo feedback cho session rỗng' });
    }

    const prompt = buildFeedbackPrompt(session, chatHistory);
    res.json({ prompt });
  } catch (error) {
    console.error('getFeedbackPrompt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/interviews/:sessionId/feedback  (save from frontend-generated AI response)
export const saveFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { jsonResponse } = req.body;
    const userId = req.user!._id;

    if (!jsonResponse) {
      return res.status(400).json({ message: 'jsonResponse là bắt buộc' });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If already exists, return existing
    const existingFeedback = await InterviewFeedback.findOne({ session: sessionId });
    if (existingFeedback) {
      const chatHistory = await ChatMessage.find({ session: sessionId }).sort({ createdAt: 1 });
      return res.json(mapFeedbackToResponse(existingFeedback, buildQaReview(chatHistory)));
    }

    // Parse AI JSON response
    let cleanedJson = jsonResponse.trim();
    if (cleanedJson.startsWith('```json')) cleanedJson = cleanedJson.substring(7);
    if (cleanedJson.startsWith('```')) cleanedJson = cleanedJson.substring(3);
    if (cleanedJson.endsWith('```')) cleanedJson = cleanedJson.substring(0, cleanedJson.length - 3);

    const parsed = JSON.parse(cleanedJson.trim());

    const feedback = await InterviewFeedback.create({
      session: sessionId as string,
      overallScore: parsed.overallScore || 0,
      technicalScore: parsed.technicalScore || 0,
      communicationScore: parsed.communicationScore || 0,
      clarityScore: parsed.clarityScore || 0,
      confidenceScore: parsed.confidenceScore || 0,
      strengths: parsed.strengths || '',
      weaknesses: parsed.weaknesses || '',
      detailedReview: parsed.detailedReview || '',
      improvementPlan: parsed.improvementPlan || '',
      recommendationLevel: parsed.recommendationLevel || 'NEUTRAL',
    });

    // Update session summary & score
    session.overallAiSummary = parsed.detailedReview || '';
    session.overallScore = parsed.overallScore || 0;
    await session.save();

    // Process quest completion after feedback saved
    await processQuestCompletion(session, userId.toString());

    const chatHistory = await ChatMessage.find({ session: sessionId }).sort({ createdAt: 1 });
    res.status(201).json(mapFeedbackToResponse(feedback, buildQaReview(chatHistory)));
  } catch (error) {
    console.error('saveFeedback error:', error);
    res.status(500).json({ message: 'Lỗi khi lưu feedback' });
  }
};

// POST /api/interviews/:sessionId/feedback/generate  (generate via Gemini)
export const generateFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!._id;

    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const chatHistory = await ChatMessage.find({ session: sessionId }).sort({ createdAt: 1 });
    if (chatHistory.length === 0) {
      return res.status(400).json({ message: 'Không thể tạo feedback cho session rỗng' });
    }

    // Check if already exists
    const existingFeedback = await InterviewFeedback.findOne({ session: sessionId });
    if (existingFeedback) {
      return res.json(mapFeedbackToResponse(existingFeedback, buildQaReview(chatHistory)));
    }

    const prompt = buildFeedbackPrompt(session, chatHistory);
    const jsonResponse = await getAiTextResponse(prompt);

    // Parse AI JSON
    let cleanedJson = jsonResponse.trim();
    if (cleanedJson.startsWith('```json')) cleanedJson = cleanedJson.substring(7);
    if (cleanedJson.startsWith('```')) cleanedJson = cleanedJson.substring(3);
    if (cleanedJson.endsWith('```')) cleanedJson = cleanedJson.substring(0, cleanedJson.length - 3);

    const parsed = JSON.parse(cleanedJson.trim());

    const feedback = await InterviewFeedback.create({
      session: sessionId as string,
      overallScore: parsed.overallScore || 0,
      technicalScore: parsed.technicalScore || 0,
      communicationScore: parsed.communicationScore || 0,
      clarityScore: parsed.clarityScore || 0,
      confidenceScore: parsed.confidenceScore || 0,
      strengths: parsed.strengths || '',
      weaknesses: parsed.weaknesses || '',
      detailedReview: parsed.detailedReview || '',
      improvementPlan: parsed.improvementPlan || '',
      recommendationLevel: parsed.recommendationLevel || 'NEUTRAL',
    });

    session.overallAiSummary = parsed.detailedReview || '';
    session.overallScore = parsed.overallScore || 0;
    await session.save();

    // Process quest completion after feedback generated
    await processQuestCompletion(session, userId.toString());

    res.status(201).json(mapFeedbackToResponse(feedback, buildQaReview(chatHistory)));
  } catch (error) {
    console.error('generateFeedback error:', error);
    res.status(500).json({ message: 'Lỗi khi tạo feedback AI' });
  }
};

async function processQuestCompletion(session: any, userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const activeQuests = await UserQuest.find({
      user: userId,
      assignedDate: today,
      isCompleted: false,
    });

    if (activeQuests.length === 0) return;

    const user = await User.findById(userId);
    if (!user) return;

    let bonusExp = 0;

    for (const quest of activeQuests) {
      let isMatched = false;

      if (quest.questType === QuestType.COMPLETE_ANY) {
        isMatched = true;
      } else if (quest.questType === QuestType.COMPLETE_HARDCORE) {
        isMatched = !!session.isHardcore;
      } else if (quest.questType === QuestType.ACHIEVE_HIGH_SCORE) {
        isMatched = session.overallScore != null && session.overallScore >= 80;
      }

      if (isMatched) {
        quest.currentValue = quest.currentValue + 1;
        if (quest.currentValue >= quest.targetValue) {
          quest.isCompleted = true;
          bonusExp += quest.rewardExp;
        }
        await quest.save();
      }
    }

    if (bonusExp > 0) {
      let currentExp = user.exp ?? 0;
      let currentLevel = user.level ?? 1;
      currentExp += bonusExp;
      while (currentExp >= currentLevel * 100) {
        currentExp -= currentLevel * 100;
        currentLevel++;
      }
      user.exp = currentExp;
      user.level = currentLevel;
      await user.save();
    }
  } catch (err) {
    console.error('processQuestCompletion error:', err);
  }
}
