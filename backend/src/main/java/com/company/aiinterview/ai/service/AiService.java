package com.company.aiinterview.ai.service;

import com.company.aiinterview.chat.dto.OutgoingMessage;
import com.company.aiinterview.chat.entity.ChatMessage;
import com.company.aiinterview.interview.entity.InterviewSession;

import java.util.List;

public interface AiService {
    String buildPrompt(InterviewSession session, List<ChatMessage> chatHistory, String latestUserMessage);
    OutgoingMessage parseAiResponse(String jsonResponse);
    String buildFeedbackPrompt(InterviewSession session, List<ChatMessage> chatHistory);
}
