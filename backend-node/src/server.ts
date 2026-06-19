import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config/env';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import interviewRoutes from './routes/interviewRoutes';
import studyRoutes from './routes/studyRoutes';
import userRoutes from './routes/userRoutes';
import questRoutes from './routes/questRoutes';
import { setupChatSocket } from './sockets/chatSocket';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quests', questRoutes);

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Node.js backend is running!' });
});

// Setup Socket.io logic
setupChatSocket(io);

httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
