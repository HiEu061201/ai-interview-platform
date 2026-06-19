import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UserQuest, QuestType, IUserQuest } from '../models/Quest';

const generateDailyQuests = (userId: string, today: string): Omit<IUserQuest, keyof Document>[] => {
  const quests: any[] = [];

  // Quest 1: Always - complete any interview
  quests.push({
    user: userId,
    questType: QuestType.COMPLETE_ANY,
    title: 'Chăm chỉ',
    description: 'Hoàn thành 1 bài phỏng vấn bất kỳ',
    targetValue: 1,
    currentValue: 0,
    rewardExp: 50,
    isCompleted: false,
    assignedDate: today,
  });

  // Quest 2: Random between Hardcore or High Score
  if (Math.random() < 0.5) {
    quests.push({
      user: userId,
      questType: QuestType.COMPLETE_HARDCORE,
      title: 'Kẻ thách thức',
      description: 'Hoàn thành 1 bài phỏng vấn ở chế độ Hardcore',
      targetValue: 1,
      currentValue: 0,
      rewardExp: 100,
      isCompleted: false,
      assignedDate: today,
    });
  } else {
    quests.push({
      user: userId,
      questType: QuestType.ACHIEVE_HIGH_SCORE,
      title: 'Thành tích xuất sắc',
      description: 'Đạt điểm tổng quát >= 80 trong một bài phỏng vấn',
      targetValue: 1,
      currentValue: 0,
      rewardExp: 150,
      isCompleted: false,
      assignedDate: today,
    });
  }

  return quests;
};

// GET /api/quests/daily
export const getDailyQuests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    let quests = await UserQuest.find({ user: userId, assignedDate: today });

    if (quests.length === 0) {
      const newQuestData = generateDailyQuests(userId, today);
      quests = await UserQuest.insertMany(newQuestData) as any;
    }

    res.json(quests.map(q => ({
      id: q.id,
      questType: q.questType,
      title: q.title,
      description: q.description,
      targetValue: q.targetValue,
      currentValue: q.currentValue,
      rewardExp: q.rewardExp,
      isCompleted: q.isCompleted,
      assignedDate: q.assignedDate,
    })));
  } catch (error) {
    console.error('getDailyQuests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
