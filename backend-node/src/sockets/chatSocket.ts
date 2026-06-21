import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { InterviewSession } from '../models/InterviewSession';
import { ChatMessage, Sender } from '../models/ChatMessage';
import { buildPrompt, parseAiResponse } from '../services/aiService';
import { config } from '../config/env';

export const setupChatSocket = (io: Server) => {
  // H1 Fix: Authenticate socket connections via JWT
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      socket.data.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('Authenticated user connected:', socket.id, 'userId:', socket.data.userId);

    // Join a specific interview room
    socket.on('join_room', async (data: { sessionId: string }) => {
      if (!data.sessionId) {
        return socket.emit('error', { message: 'sessionId is required' });
      }
      socket.join(data.sessionId);
      console.log(`Socket ${socket.id} joined room ${data.sessionId}`);
    });

    // Handle sending message
    socket.on('send_message', async (data: { sessionId: string, messageContent: string }) => {
      try {
        const { sessionId, messageContent } = data;

        // M2 Fix: Basic input validation
        if (!sessionId || !messageContent || typeof messageContent !== 'string') {
          return socket.emit('error', { message: 'Invalid message data' });
        }

        // Strip HTML tags to prevent stored XSS
        const sanitizedContent = messageContent.replace(/<[^>]*>/g, '').trim();
        if (!sanitizedContent) {
          return socket.emit('error', { message: 'Message content cannot be empty' });
        }

        const session = await InterviewSession.findById(sessionId);
        if (!session) {
          return socket.emit('error', { message: 'Session not found' });
        }

        // H2 Fix: Verify session ownership
        if (session.user.toString() !== socket.data.userId) {
          return socket.emit('error', { message: 'Not authorized for this session' });
        }

        // Save User Message
        const userMessage = await ChatMessage.create({
          session: sessionId,
          sender: Sender.USER,
          messageContent: sanitizedContent,
          turnNo: session.currentTurn
        });

        // Broadcast user message to room
        io.to(sessionId).emit('receive_message', userMessage);

        // Fetch history
        const chatHistory = await ChatMessage.find({ session: sessionId }).sort({ createdAt: 1 });

        // Generate AI Prompt
        const prompt = buildPrompt(session, chatHistory, sanitizedContent);

        // Emit to the client to generate AI response
        socket.emit('request_ai_generate', { sessionId, prompt });

      } catch (error) {
        console.error('Socket send_message error:', error);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    // Handle AI response from client
    socket.on('submit_ai_response', async (data: { sessionId: string, jsonResponse: string }) => {
      try {
        const { sessionId, jsonResponse } = data;

        if (!sessionId || !jsonResponse) {
          return socket.emit('error', { message: 'Invalid AI response data' });
        }

        const session = await InterviewSession.findById(sessionId);
        if (!session) {
          return socket.emit('error', { message: 'Session not found' });
        }

        if (session.user.toString() !== socket.data.userId) {
          return socket.emit('error', { message: 'Not authorized for this session' });
        }

        const aiResult = parseAiResponse(jsonResponse);
        const currentTurn = session.currentTurn ?? 0;

        // Save AI Message
        const aiMessage = await ChatMessage.create({
          session: sessionId,
          sender: Sender.AI,
          messageContent: aiResult.content,
          turnNo: currentTurn + 1,
          modelName: 'puter-frontend',
          suggestedAnswer: aiResult.suggestedAnswer,
          scoreClarity: aiResult.clarity,
          scoreTechnical: aiResult.technicalDepth,
          scoreConfidence: aiResult.confidence,
          scoreSituation: (aiResult as any).situation,
          scoreTask: (aiResult as any).task,
          scoreAction: (aiResult as any).action,
          scoreResult: (aiResult as any).result,
          categoryTopic: aiResult.categoryTopic
        });

        // Increment session turn safely
        session.currentTurn = currentTurn + 1;
        await session.save();

        // Broadcast AI message
        io.to(sessionId).emit('receive_message', aiMessage);

      } catch (error) {
        console.error('Socket submit_ai_response error:', error);
        socket.emit('error', { message: 'Failed to save AI response' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
