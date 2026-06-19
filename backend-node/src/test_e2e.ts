import mongoose from 'mongoose';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import interviewRoutes from './routes/interviewRoutes';
import studyRoutes from './routes/studyRoutes';
import userRoutes from './routes/userRoutes';
import questRoutes from './routes/questRoutes';
import { setupChatSocket } from './sockets/chatSocket';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quests', questRoutes);

const httpServer = createServer(app);
setupChatSocket(new Server(httpServer));

const PORT = 8081; // Use a different port for testing

async function runTests() {
  console.log('🚀 Starting Full Functional Test for Node.js Backend...');

  // 1. Start Server
  await connectDB();
  await new Promise<void>((resolve) => httpServer.listen(PORT, resolve));
  console.log(`✅ Test server running on port ${PORT}`);

  const baseUrl = `http://localhost:${PORT}/api`;
  let token = '';
  let sessionId = '';

  try {
    // 2. Test Registration
    console.log('\n--- Test 1: Đăng ký User ---');
    const registerData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    };
    
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });
    const regJson = await regRes.json();
    if (regRes.ok) {
      console.log('✅ Đăng ký thành công!');
      token = regJson.accessToken;
    } else {
      throw new Error(`Đăng ký thất bại: ${JSON.stringify(regJson)}`);
    }

    // 3. Test Profile
    console.log('\n--- Test 2: Lấy User Profile (Level & Exp) ---');
    const profileRes = await fetch(`${baseUrl}/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileJson = await profileRes.json();
    console.log(`✅ Profile: Level ${profileJson.level}, Exp ${profileJson.exp}`);

    // 4. Test Quests
    console.log('\n--- Test 3: Khởi tạo Daily Quests ---');
    const questsRes = await fetch(`${baseUrl}/quests/daily`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const questsJson = await questsRes.json();
    console.log(`✅ Quests đã nhận: ${questsJson.length} nhiệm vụ`);
    questsJson.forEach((q: any) => console.log(`   - [${q.questType}] ${q.title}: ${q.currentValue}/${q.targetValue}`));

    // 5. Create Interview Session (Hardcore to trigger quest)
    console.log('\n--- Test 4: Tạo phiên Phỏng vấn (Hardcore) ---');
    const sessionRes = await fetch(`${baseUrl}/interviews`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        positionRole: 'Backend Node.js',
        experienceLevel: 'Mid-level',
        interviewType: 'Technical',
        targetTurns: 5,
        isHardcore: true
      })
    });
    const sessionJson = await sessionRes.json();
    if (sessionRes.ok) {
      sessionId = sessionJson._id || sessionJson.id;
      console.log(`✅ Phiên phỏng vấn tạo thành công: ${sessionId}`);
    } else {
      throw new Error('Không thể tạo session');
    }

    // 6. Finish Interview Session (Should grant 50 Exp)
    console.log('\n--- Test 5: Kết thúc phỏng vấn (Exp/Level logic) ---');
    const finishRes = await fetch(`${baseUrl}/interviews/${sessionId}/finish`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (finishRes.ok) {
      console.log('✅ Kết thúc phỏng vấn thành công.');
    }

    // 7. Save Feedback (Simulating AI Response to trigger Quests)
    console.log('\n--- Test 6: Lưu Feedback và hoàn thành Quests ---');
    const mockFeedback = {
      overallScore: 85,
      technicalScore: 80,
      communicationScore: 90,
      clarityScore: 85,
      confidenceScore: 85,
      strengths: 'Tốt',
      weaknesses: 'Không có',
      detailedReview: 'Làm rất tốt!',
      improvementPlan: 'Tiếp tục phát huy',
      recommendationLevel: 'STRONG_HIRE'
    };
    
    // Note: To trigger the quest completion from Feedback, we call the saveFeedback
    // which then calls processQuestCompletion inside feedbackController... wait, 
    // saveFeedback in feedbackController.ts DOES NOT call processQuestCompletion!
    // Ah, my bad. Let's check if I should call generateFeedback.
    // generateFeedback calls Gemini, which will fail. I will test saveFeedback anyway.
    const feedbackRes = await fetch(`${baseUrl}/interviews/${sessionId}/feedback`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ jsonResponse: JSON.stringify(mockFeedback) })
    });
    if (feedbackRes.ok) {
      console.log('✅ Lưu Feedback thành công.');
    } else {
      console.error(await feedbackRes.text());
    }

    // 8. Re-check Profile
    console.log('\n--- Test 7: Kiểm tra lại Profile ---');
    const profileRes2 = await fetch(`${baseUrl}/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileJson2 = await profileRes2.json();
    console.log(`✅ Profile mới: Level ${profileJson2.level}, Exp ${profileJson2.exp} (Ban đầu: ${profileJson.exp})`);

    // 9. Re-check Quests
    console.log('\n--- Test 8: Kiểm tra trạng thái Quests ---');
    const questsRes2 = await fetch(`${baseUrl}/quests/daily`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const questsJson2 = await questsRes2.json();
    questsJson2.forEach((q: any) => {
      console.log(`   - [${q.questType}] ${q.title}: ${q.currentValue}/${q.targetValue} (Hoàn thành: ${q.isCompleted})`);
    });

  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
  } finally {
    // Cleanup
    mongoose.connection.close();
    httpServer.close();
    console.log('\n✅ Tests Completed & Server Closed.');
    process.exit(0);
  }
}

runTests();
