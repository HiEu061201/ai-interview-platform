import { Response } from 'express';
import { User } from '../models/User';
import { InterviewSession, InterviewStatus } from '../models/InterviewSession';
import { InterviewFeedback } from '../models/Feedback';
import { AuthRequest } from '../middlewares/authMiddleware';

// GET /api/users/profile
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const totalInterviews = await InterviewSession.countDocuments({ user: user._id });
    const completedInterviews = await InterviewSession.countDocuments({ 
      user: user._id, 
      status: InterviewStatus.COMPLETED 
    });
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      level: user.level,
      exp: user.exp,
      stats: {
        totalInterviews,
        completedInterviews,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users/profile/analytics
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;

    // Find all completed sessions with feedback
    const sessions = await InterviewSession.find({ 
      user: userId, 
      status: InterviewStatus.COMPLETED 
    }).sort({ createdAt: 1 });

    const analytics = await Promise.all(
      sessions.map(async (session) => {
        const feedback = await InterviewFeedback.findOne({ session: session._id });
        return {
          sessionId: session.id,
          date: session.createdAt,
          positionRole: session.positionRole,
          overallScore: feedback?.overallScore ?? null,
          technicalScore: feedback?.technicalScore ?? null,
          clarityScore: feedback?.clarityScore ?? null,
          confidenceScore: feedback?.confidenceScore ?? null,
        };
      })
    );

    res.json(analytics);
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
