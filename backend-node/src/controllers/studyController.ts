import { Request, Response } from 'express';
import { StudyCategory, StudyMaterial } from '../models/StudyMaterial';
import { ChatMessage, Sender } from '../models/ChatMessage';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await StudyCategory.find().sort({ displayOrder: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMaterialsByCategory = async (req: Request, res: Response) => {
  try {
    // Support both categorySlug and categoryId for compatibility
    const { categorySlug } = req.params;

    let category = await StudyCategory.findOne({ slug: categorySlug });
    
    // Fallback: try by ID if slug lookup fails (backward compat)
    if (!category) {
      category = await StudyCategory.findById(categorySlug).catch(() => null);
    }

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const materials = await StudyMaterial.find({ category: category._id })
      .sort({ displayOrder: 1 })
      .select('id title slug displayOrder');

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMaterialBySlug = async (req: Request, res: Response) => {
  try {
    const material = await StudyMaterial.findOne({ slug: req.params.slug }).populate('category');
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/study/my-notes (protected)
export const getMyNotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;

    // Get AI messages that have low scores (mistakes/weak answers)
    const aiMessages = await ChatMessage.find({
      sender: Sender.AI,
      $or: [
        { scoreClarity: { $lt: 60 } },
        { scoreTechnical: { $lt: 60 } },
        { scoreConfidence: { $lt: 60 } },
        { suggestedAnswer: { $exists: true, $ne: '' } },
      ],
    })
    .populate({
      path: 'session',
      match: { user: userId },
    })
    .sort({ createdAt: -1 })
    .limit(100);

    // Filter out messages whose session doesn't belong to user
    const filteredMessages = aiMessages.filter(msg => msg.session != null);

    // Build notes with question context
    const notes = await Promise.all(
      filteredMessages.map(async (msg) => {
        const sessionHistory = await ChatMessage.find({ session: msg.session })
          .sort({ createdAt: 1 });

        let question = 'Câu hỏi không xác định';
        let userAnswer = 'Không xác định';
        
        const msgIndex = sessionHistory.findIndex(m => m.id === msg.id);
        
        // msg is the AI message with feedback.
        // msgIndex - 1 is the USER's answer.
        if (msgIndex > 0 && sessionHistory[msgIndex - 1].sender === Sender.USER) {
          userAnswer = sessionHistory[msgIndex - 1].messageContent;
          // msgIndex - 2 is the AI's question that prompted the USER's answer.
          if (msgIndex > 1 && sessionHistory[msgIndex - 2].sender === Sender.AI) {
            question = sessionHistory[msgIndex - 2].messageContent;
          }
        }

        return {
          id: msg.id,
          questionContent: question,
          userContent: userAnswer,
          suggestedAnswer: msg.suggestedAnswer,
          scoreClarity: msg.scoreClarity,
          scoreTechnical: msg.scoreTechnical,
          scoreConfidence: msg.scoreConfidence,
          categoryTopic: msg.categoryTopic || 'Chung',
          createdAt: msg.createdAt.toISOString(),
        };
      })
    );

    // Group by categoryTopic
    const grouped: Record<string, typeof notes> = {};
    for (const note of notes) {
      const topic = note.categoryTopic;
      if (!grouped[topic]) grouped[topic] = [];
      grouped[topic].push(note);
    }

    res.json(grouped);
  } catch (error) {
    console.error('getMyNotes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
