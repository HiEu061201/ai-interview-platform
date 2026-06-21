
import { IInterviewSession } from '../models/InterviewSession';
import { IChatMessage, Sender } from '../models/ChatMessage';

export const buildPrompt = (session: IInterviewSession, chatHistory: IChatMessage[], latestUserMessage: string): string => {
  let contextBuilder = `You are an expert AI interviewer. The candidate is interviewing for the position of: ${session.positionRole} at a ${session.experienceLevel} level.\n`;

  if (session.resumeText?.trim()) {
    contextBuilder += `CANDIDATE CV / RESUME:\n\`\`\`\n${session.resumeText}\n\`\`\`\n`;
  }

  if (session.techStack?.trim()) {
    contextBuilder += `The candidate's tech stack / key skills: ${session.techStack}.\n`;
  }
  
  if (session.jobDescription?.trim()) {
    contextBuilder += `The job description is: ${session.jobDescription}\n`;
  }
  
  const isBehavioral = session.interviewType === 'Behavioral' || session.interviewType === 'Phỏng vấn hành vi';
  if (isBehavioral) {
    contextBuilder += `This is a BEHAVIORAL INTERVIEW. You must ask behavioral and situational questions. Evaluate the candidate's answer using the STAR method (Situation, Task, Action, Result).\n`;
  }
  contextBuilder += '\n';

  if (session.isHardcore) {
    contextBuilder += `HARDCORE MODE ACTIVE: You must be extremely strict, aggressive, and ask highly difficult, deeply technical or stressful questions. Do not praise the candidate easily. Point out flaws aggressively.\n\n`;
  }

  contextBuilder += `Here is the conversation history so far:\n`;
  for (const msg of chatHistory) {
    contextBuilder += `${msg.sender}: ${msg.messageContent}\n`;
  }
  contextBuilder += `USER: ${latestUserMessage}\n\n`;

  contextBuilder += `Evaluate the USER's latest answer and provide the next interview question. IMPORTANT: You MUST communicate and ask your next question in Vietnamese. CRITICAL RULE: You must ask EXACTLY ONE single, focused question at a time. Do NOT ask multiple questions, sub-questions, or multi-part questions in a single response.\n`;
  contextBuilder += `You MUST return your response as a pure JSON object without markdown formatting, with the following keys:\n`;
  contextBuilder += `- 'clarity': integer 0-100\n`;
  contextBuilder += `- 'technicalDepth': integer 0-100 (For behavioral interviews, this represents the depth of their action/impact)\n`;
  contextBuilder += `- 'confidence': integer 0-100\n`;
  if (isBehavioral) {
    contextBuilder += `- 'situation': integer 0-100 (STAR - Situation rating)\n`;
    contextBuilder += `- 'task': integer 0-100 (STAR - Task rating)\n`;
    contextBuilder += `- 'action': integer 0-100 (STAR - Action rating)\n`;
    contextBuilder += `- 'result': integer 0-100 (STAR - Result rating)\n`;
  }
  contextBuilder += `- 'suggestedAnswer': string, a better way the user could have answered the previous question (leave empty if their answer was good enough or if they just greeted)\n`;
  contextBuilder += `- 'categoryTopic': string, classify the core topic of the PREVIOUS question/answer (e.g., 'Java', 'System Design', 'Database', 'Behavioral', 'Networking', 'React'). Keep it to 1-2 words. Leave empty if N/A.\n`;
  contextBuilder += `- 'nextQuestion': string, the text of your next question.\n`;

  return contextBuilder;
};

export const buildFeedbackPrompt = (session: IInterviewSession, chatHistory: IChatMessage[]): string => {
  let prompt = `Bạn là một chuyên gia đánh giá phỏng vấn kỹ thuật. Hãy phân tích buổi phỏng vấn sau và đưa ra đánh giá chi tiết.\n\n`;

  prompt += `THÔNG TIN PHỎNG VẤN:\n`;
  prompt += `- Vị trí: ${session.positionRole}\n`;
  prompt += `- Cấp độ: ${session.experienceLevel}\n`;
  prompt += `- Loại phỏng vấn: ${session.interviewType}\n`;
  if (session.techStack) prompt += `- Tech stack: ${session.techStack}\n`;
  if (session.isHardcore) prompt += `- Chế độ: HARDCORE\n`;
  prompt += `\nLỊCH SỬ CUỘC PHỎNG VẤN:\n`;

  for (const msg of chatHistory) {
    const role = msg.sender === Sender.AI ? 'Người phỏng vấn (AI)' : 'Ứng viên';
    prompt += `${role}: ${msg.messageContent}\n`;
    if (msg.sender === Sender.USER && (msg.scoreClarity || msg.scoreTechnical || msg.scoreConfidence)) {
      prompt += `  [Đánh giá tự động - Rõ ràng: ${msg.scoreClarity}/100, Kỹ thuật: ${msg.scoreTechnical}/100, Tự tin: ${msg.scoreConfidence}/100]\n`;
    }
  }

  prompt += `\n\nDựa trên lịch sử phỏng vấn trên, hãy trả về kết quả đánh giá dưới dạng JSON thuần túy (không có markdown) với các trường sau:\n`;
  prompt += `- 'overallScore': số nguyên 0-100, điểm tổng thể\n`;
  prompt += `- 'technicalScore': số nguyên 0-100, điểm kỹ thuật\n`;
  prompt += `- 'communicationScore': số nguyên 0-100, điểm giao tiếp\n`;
  prompt += `- 'clarityScore': số nguyên 0-100, điểm rõ ràng\n`;
  prompt += `- 'confidenceScore': số nguyên 0-100, điểm tự tin\n`;
  prompt += `- 'strengths': string, điểm mạnh của ứng viên\n`;
  prompt += `- 'weaknesses': string, điểm yếu cần cải thiện\n`;
  prompt += `- 'detailedReview': string, nhận xét chi tiết về buổi phỏng vấn\n`;
  prompt += `- 'improvementPlan': string, kế hoạch cải thiện cụ thể\n`;
  prompt += `- 'recommendationLevel': string, một trong: 'STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE'\n`;

  return prompt;
};

export const parseAiResponse = (jsonResponse: string) => {
  try {
    let cleanedJson = jsonResponse.trim();
    if (cleanedJson.startsWith('```json')) cleanedJson = cleanedJson.substring(7);
    if (cleanedJson.startsWith('```')) cleanedJson = cleanedJson.substring(3);
    if (cleanedJson.endsWith('```')) cleanedJson = cleanedJson.substring(0, cleanedJson.length - 3);

    const parsed = JSON.parse(cleanedJson);
    return {
      sender: 'AI',
      content: parsed.nextQuestion || 'Xin lỗi, bạn có thể nói lại được không?',
      clarity: parsed.clarity || 0,
      technicalDepth: parsed.technicalDepth || 0,
      confidence: parsed.confidence || 0,
      situation: parsed.situation,
      task: parsed.task,
      action: parsed.action,
      result: parsed.result,
      suggestedAnswer: parsed.suggestedAnswer || '',
      categoryTopic: parsed.categoryTopic || 'Khác'
    };
  } catch (error) {
    console.error('Failed to parse AI response JSON', error);
    return {
      sender: 'AI',
      content: "Xin lỗi, tôi đang gặp sự cố. Bạn có thể nhắc lại không?",
      clarity: 0, technicalDepth: 0, confidence: 0, suggestedAnswer: '', categoryTopic: 'Khác'
    };
  }
};

